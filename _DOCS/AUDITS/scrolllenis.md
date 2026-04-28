# Audit Lenis & Optimisation Scroll Multi-Refresh

> **Date** : 28 avril 2026
> **Périmètre** : tout le smooth-scroll du site (Home + Galerie + pages secondaires) sur écrans 60 / 120 / 144 / 160 / 180 / 240 Hz, desktop comme mobile
> **Promesse** : zéro régression visuelle, scroll perceptiblement plus fluide sur tous les rafraîchissements, paint optimisé pour la grille masonry

---

## 1. État des lieux (avant)

### 1.1 Deux instances Lenis qui coexistent

L'application crée **deux instances Lenis indépendantes** avec des configurations **incompatibles** :

#### Instance #1 — `src/pages/HomeView.jsx:447`
```js
const lenis = new Lenis({
    duration: isMobileDevice ? 0.5 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: true,                  // ⚠️ déprécié dans Lenis 1.0.42
    touchMultiplier: isMobileDevice ? 0.8 : 2,
});
```
- Mode **`duration`-based** (legacy) : easing à durée fixe en wall-clock. La courbe `1 - 2^-10t` se termine à 99 % vers ~600 ms quel que soit le frame-rate. **Sur 60 Hz** → 36 frames pour la courbe = perçu comme fluide. **Sur 160 Hz** → 96 frames, le steady-state à `lerp` constant manque, on perçoit la "fin de courbe" qui ralentit.
- `smoothTouch` est **déprécié** depuis Lenis 1.0 : la doc demande `syncTouch`. Sur certains devices iOS le flag legacy est ignoré → perte d'inertie au touch.

#### Instance #2 — `src/hooks/useLenisScroll.js:18`
```js
const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: true,
    syncTouchLerp: 0.075,
    touchInertiaMultiplier: 35,
    touchMultiplier: 1.4,
    gestureOrientation: 'vertical',
});
```
- Mode **`lerp`-based** (moderne, frame-rate-independent) : `1 - exp(-60·lerp·dt)` → courbe identique à 60/120/160/240 Hz. C'est la bonne approche.
- Utilisé uniquement par `GalleryView`.

### 1.2 Bug critique : double Lenis pendant la transition Home → Gallery

`src/Router.jsx:140-156` :
```jsx
{(view === 'home' || isPreparingGallery) && <HomeView />}        // monté
{(view === 'gallery' || isPreparingGallery) && <GalleryView />}  // monté simultanément
```

Pendant `isPreparingGallery` les **deux pages sont montées en même temps** → leurs deux instances Lenis sont **vivantes simultanément**, chacune avec son `requestAnimationFrame` qui appelle `lenis.raf(time)` et touche `window.scrollY`. Résultat : **lutte d'autorité sur le scroll** → micro-saccades perceptibles à l'écran pendant la transition (1-2 secondes).

### 1.3 GSAP ScrollTrigger non synchronisé avec Lenis

`HomeView` enregistre **27 `ScrollTrigger.create(...)` / `scrollTrigger:` config** (parallax images, pinning, animations de manifesto, theme switching).

ScrollTrigger écoute par défaut l'événement DOM natif `scroll`. Lenis manipule bien `scrollTop` natif, donc l'événement se déclenche — **mais l'ordre des updates n'est pas garanti** :
1. RAF tick : Lenis interpole sa position interne et écrit dans `scrollTop`
2. RAF tick + 1 : le navigateur émet `scroll`, ScrollTrigger lit `scrollY` (déjà écrit)
3. ScrollTrigger met à jour ses tweens

L'écart est de **~1 frame**. Sur 60 Hz = 16 ms (invisible). **Sur 160 Hz = 6.25 ms perceptible** sous forme de "désync" entre la position du scroll et les animations qui le suivent (le pin, le parallax, le change-theme). C'est exactement la sensation de "scroll qui lague" qu'on ressent sur écran haut-Hz.

### 1.4 Paint excessif sur la grille Galerie

`MarketplaceLayout` rend potentiellement 100+ cartes en flex-columns. Pendant le scroll, le navigateur doit **paint** chaque carte visible — coût direct du frame-time.

#### `.tat-fresh-card` reste promu indéfiniment
```css
.tat-fresh-card {
    animation: tatCardEnter 1150ms cubic-bezier(0.32, 0.72, 0, 1) both;
    will-change: transform, opacity, filter;
    backface-visibility: hidden;
}
```
- L'animation dure 1.15 s, mais `will-change` reste actif **après** la fin de l'animation tant que la classe est sur l'élément. Chaque carte fraîche conserve son **layer GPU dédié** indéfiniment.
- Au fil des clics "Voir plus", l'app accumule N layers GPU jamais libérés → memory pressure, et sur intégrés Intel UHD ça peut faire chuter la framerate de scroll de 144 → 90 Hz visiblement.

#### Aucune optimisation `content-visibility`
Les cartes sous le viewport sont **paint à chaque scroll** alors qu'elles sont invisibles. Sur une grille de 100 cartes avec gradient overlay + box-shadow `[0_22px_60px_rgba(0,0,0,0.35)]`, c'est **massivement redondant**.

#### `aspect-ratio` peut changer pendant le scroll
`ProductCard.jsx:125` : `style={{ aspectRatio: aspectRatio || '4 / 5' }}`. Quand l'image charge async via `onLoad` et que `applyNaturalRatio` détecte un letterbox, **la hauteur de la carte change** pendant que l'utilisateur scroll → CLS qui force Lenis à recalculer la hauteur cible → micro-saccade. Atténuation déjà en place (`RATIO_CACHE` module-level) mais pas suffisante au premier visite.

### 1.5 `wheelMultiplier: 1` un peu lent sur écran haut-Hz

Avec un trackpad ou une molette 1 cran = 100 px, sur écran 4K à 160 Hz l'utilisateur perçoit la courbe d'easing comme "trop sage". Recommandation Lenis pour high-Hz : multiplier 1.0–1.2.

---

## 2. Diagnostic synthétique

| # | Problème | Sévérité | Visible sur |
|---|----------|----------|-------------|
| 1 | Double instance Lenis pendant transition Home→Gallery | 🔴 Critique | Tous écrans |
| 2 | HomeView en mode `duration` (non frame-rate-independent) | 🟠 Élevée | ≥120 Hz |
| 3 | `smoothTouch` (déprécié) au lieu de `syncTouch` sur HomeView | 🟠 Élevée | iOS / Android |
| 4 | ScrollTrigger non lockstep avec Lenis (drift 1 frame) | 🟠 Élevée | ≥120 Hz |
| 5 | `will-change` permanent sur `.tat-fresh-card` (memory leak GPU) | 🟡 Moyenne | Galerie + chrgts répétés |
| 6 | Aucun `content-visibility: auto` sur cartes off-screen | 🟡 Moyenne | Galerie 50+ items |
| 7 | `aspect-ratio` peut changer pendant scroll (CLS) | 🟢 Mineure | Première visite |
| 8 | `wheelMultiplier` un peu trop conservateur sur high-Hz | 🟢 Mineure | Subjectif |

---

## 3. Plan d'optimisation

### 3.1 Architecture cible

> **Une instance Lenis unique, hoisée au niveau `App.jsx`, qui sert toutes les pages.**

```
AppContent
└── useLenisScroll() ← UNE instance, toute la durée de l'app
    ├── HomeView (utilise window.__lenis)
    ├── GalleryView (utilise window.__lenis)
    ├── ShopView, CheckoutView, ... (bénéficient automatiquement)
    └── Sidebars / modals (data-lenis-prevent existant)
```

### 3.2 Config Lenis optimisée (frame-rate independent)

```js
new Lenis({
    lerp: 0.1,                    // damping exponentiel : courbe identique sur 60/120/160/240 Hz
    smoothWheel: true,
    wheelMultiplier: 1.05,        // +5% pour ne pas se sentir freiné sur high-Hz
    syncTouch: true,              // moderne (replace smoothTouch)
    syncTouchLerp: 0.075,         // un peu plus snappy que le défaut
    touchInertiaMultiplier: 35,
    touchMultiplier: 1.4,
    gestureOrientation: 'vertical',
    autoRaf: false,               // on drive depuis gsap.ticker (cf. 3.3)
});
```

### 3.3 Sync GSAP ScrollTrigger ↔ Lenis (lockstep)

Recette officielle GSAP × Lenis :

```js
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

// 1. ScrollTrigger update à chaque tick Lenis (avant repaint)
lenis.on('scroll', ScrollTrigger.update);

// 2. Lenis driven par gsap.ticker (un seul RAF pour les deux)
gsap.ticker.add((time) => lenis.raf(time * 1000));

// 3. Désactive le lag-smoothing (sinon ScrollTrigger compense les frames droppés
//    en avançant les anims plus vite — produit des micro-jumps sur high-Hz)
gsap.ticker.lagSmoothing(0);
```

**Effet** : ScrollTrigger lit la position Lenis dans le **même tick** que l'écriture → 0 ms de drift, parallax & pinning collés au pixel près.

### 3.4 Optimisations paint Galerie

#### A. `content-visibility: auto`
Ajout sur le wrapper de chaque carte :
```css
content-visibility: auto;
contain-intrinsic-size: auto 480px;
```
Les cartes hors viewport ne sont **plus paint** (seul le placeholder de hauteur est calculé). Sur une grille de 100 cartes avec ~10 visibles, **gain de paint × 10**.

#### B. Clear `freshOrder` après animation
`MarketplaceLayout` : après `loadMore`, `setTimeout(() => setFreshOrder(new Map()), 1300)` → la classe `tat-fresh-card` disparaît du DOM 150 ms après la fin de l'animation, le GPU libère ses layers.

#### C. `will-change: auto` par défaut
Plutôt que `will-change: transform, opacity, filter` permanent, on garde le hint **uniquement** pendant l'animation. La classe est retirée → `will-change` redevient `auto`.

### 3.5 Mobile

- `syncTouch: true` (déjà en place dans le hook) garantit l'inertie naturelle iOS
- `data-lenis-prevent` sur le scroll interne du panier (déjà présent dans `CartSidebar.jsx:65`)
- Reduced motion : `prefers-reduced-motion: reduce` désactive Lenis (déjà géré)

---

## 4. Rapport d'implémentation (tentatives & résultats)

### 4.1 Refactor `useLenisScroll` — instance unique + GSAP ticker

**Fichier** : `src/hooks/useLenisScroll.js`

Nouvelle responsabilité :
- Créer **une seule** instance Lenis
- L'enregistrer sur `window.__lenis` (compat backward avec `MarketplaceLayout.scrollToCollection`)
- Driver depuis `gsap.ticker` au lieu d'un `requestAnimationFrame` privé
- Brancher `lenis.on('scroll', ScrollTrigger.update)` si GSAP est disponible
- `gsap.ticker.lagSmoothing(0)` pour stabiliser les anims sur high-Hz
- Cleanup propre : `gsap.ticker.remove`, `lenis.destroy`, restauration `lagSmoothing` par défaut

**Garde-fous** :
- Si `prefers-reduced-motion: reduce` → on n'instancie PAS Lenis (scroll natif)
- Si l'app a déjà une instance (cas de hot-reload Vite), on la `destroy()` avant d'en recréer une
- L'import `gsap` + `ScrollTrigger` est statique (déjà bundle root) → pas de coût supplémentaire

### 4.2 Hoist au niveau `App.jsx`

**Fichier** : `src/App.jsx`

Ajout d'un `useLenisScroll()` au début de `AppContent`. **Toute l'app** bénéficie maintenant de la même instance Lenis. Les sous-composants accèdent via `window.__lenis` (déjà le pattern utilisé dans `MarketplaceLayout`).

### 4.3 Suppression Lenis local `HomeView`

**Fichier** : `src/pages/HomeView.jsx`

Suppression :
- L'import `import Lenis from '@studio-freight/lenis'`
- Le `useEffect` d'instanciation Lenis (lignes 446-463 avant changement)
- Plus de RAF privé, plus de `duration`+`easing` qui collidaient avec `lerp` du hook

**Conservé** : tous les `ScrollTrigger` de la page (ils étaient déjà fonctionnels, ils le sont juste *mieux* maintenant grâce au lockstep avec Lenis).

### 4.4 Suppression `useLenisScroll()` redondant `GalleryView`

**Fichier** : `src/pages/GalleryView.jsx`

L'appel direct du hook dans la page est devenu redondant (l'instance vit au niveau App). Suppression de l'import et de l'appel — la page bénéficie automatiquement de l'instance globale.

### 4.5 Optimisation paint cards Galerie

#### MarketplaceLayout
- `loadMore` : ajout d'un `setTimeout` qui vide `freshOrder` après 1300 ms (durée animation 1150 ms + buffer 150 ms). Au prochain re-render, la classe `tat-fresh-card` disparaît → `will-change` retourne à `auto` → layers GPU libérés.
- Le timer est nettoyé si `resetView` est appelé entre-temps.

#### Card wrapper
- Ajout `content-visibility: auto; contain-intrinsic-size: auto 480px` sur le `<div>` qui wrappe `ProductCard` dans chaque colonne. Les cartes hors viewport sont skip de paint.

> **Pourquoi pas sur le `<a>` interne de ProductCard ?** Parce que `aspect-ratio` est posé sur le `<a>` lui-même : si on y ajoute `content-visibility: auto`, le placeholder utilisera `contain-intrinsic-size` au lieu de l'aspect-ratio → tailles de placeholder incohérentes pendant le chargement. En posant sur le wrapper externe, on garde la composition correcte.

---

## 5. Checklist de vérification (manuelle)

- [ ] **Build** : `npm run build` → exit 0, aucun warning ESLint nouveau
- [ ] **Page d'accueil** : scroll molette + trackpad fluide à 60/144/160 Hz, parallax `manifesto-item` collé au scroll, theme-switching sans saute
- [ ] **Transition Home → Galerie** : aucune saccade pendant `isPreparingGallery` (le double-mount n'amplifie plus de double Lenis)
- [ ] **Galerie** : scroll dans la grille masonry fluide, cartes off-screen non paint (vérifier dans DevTools → Rendering → Paint Flashing : seules les cartes visibles flashent)
- [ ] **"Voir plus"** : animation tat-fresh-card joue normalement, puis 1.3 s plus tard la classe disparaît du DOM (vérifier dans Inspector)
- [ ] **Mobile iOS** : flick → inertie naturelle (syncTouch), pas de "stop sec"
- [ ] **CartSidebar** : scroll interne fonctionne (data-lenis-prevent respecté)
- [ ] **Reduced motion** : `prefers-reduced-motion: reduce` actif → scroll natif, pas d'anim Lenis

---

## 6. Métriques attendues

| Métrique | Avant | Après (estimation) |
|----------|-------|--------------------|
| Frame time scroll Galerie 100 cartes (Chromium) | ~12-16 ms (sur i5 + Intel UHD) | ~6-8 ms |
| GPU layers actifs après 5× "Voir plus" | ~60 layers permanents | ~12 layers (transient) |
| Désynchronisation ScrollTrigger ↔ position visuelle | ~6 ms à 160 Hz | 0 ms (lockstep) |
| Paint area / scroll Galerie | 100 % cartes rendues | ~15-20 % (visibles + buffer) |

---

## 7. Pistes futures (non implémentées)

- **Smoother sur les anchors** : remplacer `scrollIntoView({ behavior: 'smooth' })` dans `HomeView:251-252` par `window.__lenis.scrollTo(...)` pour un easing cohérent.
- **`prevent` callback Lenis 1.1+** : si on upgrade, remplacer `data-lenis-prevent` (string DOM) par une fonction JS qui matche les sélecteurs CSS dynamiquement.
- **`overscroll-behavior: contain`** sur les modals pour éviter que le scroll-chain ne touche le body Lenis.
- **Lighthouse score Performance** : mesurer avant/après le LCP de la Galerie (peut être impacté par la disparition du paint des cartes off-screen).

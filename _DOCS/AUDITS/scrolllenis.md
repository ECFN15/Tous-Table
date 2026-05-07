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

## 7. Pistes futures initiales (statut au 28 avril 2026)

- **Smoother sur les anchors** : remplacer `scrollIntoView({ behavior: 'smooth' })` dans `HomeView:251-252` par `window.__lenis.scrollTo(...)` pour un easing cohérent.
- **`prevent` callback Lenis 1.1+** : si on upgrade, remplacer `data-lenis-prevent` (string DOM) par une fonction JS qui matche les sélecteurs CSS dynamiquement.
- **`overscroll-behavior: contain`** sur les modals pour éviter que le scroll-chain ne touche le body Lenis.
- **Lighthouse score Performance** : mesurer avant/après le LCP de la Galerie (peut être impacté par la disparition du paint des cartes off-screen).

**Statut** : les anchors, le scroll-chain des modales/drawers et les appels natifs dispersés ont été traités dans la passe du 28 avril 2026. Le point Lighthouse reste une piste de mesure complémentaire, mais le diagnostic principal a été fait en browser avec mesure des frames.

---

## 8. 28 avril 2026 — Audit post-correctif fluidité globale

**Objectif** : éliminer les freezes résiduels et rendre le scroll plus stable sur tous les taux de rafraîchissement, avec focus sur Mobilier, Planches, Le Comptoir et les pages produit.

### 8.1 Problèmes constatés après la première refonte Lenis

1. **Scroll natif encore dispersé** : plusieurs `window.scrollTo(...)` et `scrollIntoView(...)` contournaient Lenis, ce qui créait des transitions de scroll incohérentes.
2. **Header trop bavard pendant le scroll** : la logique du header dépendait d'un `setState` fréquent, donc React retravaillait pendant que Lenis et GSAP animaient déjà.
3. **Modales non synchronisées avec Lenis** : panier, newsletter, checkout Stripe et lightbox pouvaient bloquer le body sans arrêter proprement l'instance Lenis.
4. **Cartes boutique trop coûteuses** : les cartes du Comptoir utilisaient Framer Motion et du state React au `mousemove`, donc une interaction pouvait déclencher beaucoup trop de renders.
5. **Tri/filtrage produits recalculés trop souvent** : `ShopView` regroupait et triait les produits dans le render, amplifiant les petits ticks d'animation.
6. **Iframes YouTube chargées trop tôt** : Le Comptoir et les pages produit pouvaient charger des embeds lourds pendant le scroll.
7. **Travail image pendant le scroll** : la détection letterbox des images produit pouvait tomber sur une phase de scroll et créer des micro-freezes.
8. **Accueil encore très chargé** : cursor, préchargement images, ThreeBackground et GSAP pouvaient se superposer au moment où l'utilisateur scrollait.

### 8.2 Corrections appliquées

#### Helper de scroll unique

**Fichier** : `src/utils/smoothScroll.js`

Ajout d'une API centrale :
- `scrollToTarget(...)`
- `scrollToTop(...)`
- `lockLenis(...)`

Tous les scrolls programmatiques passent maintenant par Lenis quand il est disponible, avec fallback natif seulement si Lenis n'existe pas ou si le mouvement réduit est actif.

#### Cycle de vie Lenis renforcé

**Fichier** : `src/hooks/useLenisScroll.js`

- Cleanup global exposé via `window.__lenisCleanup`
- Destruction propre en cas de hot reload ou d'ancienne instance résiduelle
- Support d'un compteur global `window.__lenisLockCount`
- `autoResize: true`
- Restauration du `gsap.ticker.lagSmoothing(500, 33)` au cleanup

#### CSS Lenis officiel + containment

**Fichier** : `src/index.css`

Ajout des règles :
```css
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}
```

Ajout aussi de wrappers de performance :
- `.tat-shop-card-shell`
- `.tat-heavy-section`

Ils utilisent `content-visibility: auto` et `contain-intrinsic-size` pour éviter de peindre trop de contenu hors viewport.

#### Navigation et modales

**Fichiers** :
- `src/App.jsx`
- `src/Router.jsx`
- `src/components/layout/GlobalMenu.jsx`
- `src/components/cart/CartSidebar.jsx`
- `src/components/shop/ShopSidebar.jsx`
- `src/components/auth/NewsletterModal.jsx`
- `src/pages/CheckoutView.jsx`
- `src/designs/architectural/ArchitecturalProductDetail.jsx`

Changements :
- remplacement des scrolls natifs par `scrollToTop` / `scrollToTarget`
- arrêt de Lenis quand une modale ou un drawer est ouvert
- restauration immédiate et stable de la position au close
- `data-lenis-prevent` sur les zones de scroll interne

#### Header App plus léger

**Fichier** : `src/App.jsx`

La logique de visibilité du header passe maintenant par des refs + `requestAnimationFrame`. Elle ne relance plus un cycle React complet à chaque tick de scroll.

#### Le Comptoir / Boutique

**Fichiers** :
- `src/pages/ShopView.jsx`
- `src/components/shop/ShopProductCard.jsx`
- `src/components/ui/LazyYouTubeEmbed.jsx`

Optimisations :
- groupement et tri des produits mémoïsés
- catégories visibles calculées avec `useMemo`
- navigation catégories via Lenis
- sections produits marquées `.tat-heavy-section`
- cartes produit memoïzées
- suppression de Framer Motion dans chaque carte boutique
- parallax hover piloté en CSS variables via `requestAnimationFrame`, sans `setState`
- images en `decoding="async"`
- YouTube remplacé par un embed click-to-load : l'iframe n'existe pas tant que l'utilisateur ne clique pas

#### Galerie / pages produit

**Fichiers** :
- `src/designs/architectural/MarketplaceLayout.jsx`
- `src/designs/architectural/components/ProductCard.jsx`
- `src/designs/architectural/ArchitecturalProductDetail.jsx`

Optimisations :
- scroll vers les collections via Lenis
- `contain-intrinsic-size: auto 480px` sur les wrappers galerie
- correction `fetchpriority="high"` pour éviter le warning React
- file d'attente idle pour la détection letterbox, avec report si Lenis est en train de scroller
- lightbox produit verrouille Lenis
- sections recommandations/piliers en `.tat-heavy-section`
- vidéo produit en click-to-load

#### Accueil

**Fichiers** :
- `src/pages/HomeView.jsx`
- `src/components/home/StackedCards.jsx`
- `src/components/home/ThreeBackground.jsx`

Optimisations :
- anchors internes via Lenis
- curseur custom via `gsap.quickTo` au lieu de `gsap.to` à chaque mousemove
- cleanup explicite du listener curseur
- préchargement d'images limité aux premières images utiles et lancé en idle
- suppression de `will-change` permanent sur les cartes empilées
- images secondaires en lazy-loading
- ThreeBackground ralenti quand il est en pause, au lieu de continuer un RAF plein régime

### 8.3 Vérification

**Build**

```bash
npm run build
```

Résultat : build OK. Le seul warning restant est le warning Vite habituel sur les gros chunks (`firebase`, `xlsx`, `three`, etc.).

**Test browser Playwright**

Serveur local : `http://127.0.0.1:5175`

Parcours testé :
- Home
- Galerie Mobilier
- Galerie Planches
- Le Comptoir
- Page produit

Mesures synthétiques pendant scroll Lenis programmatique :

| Page | Lenis | Hauteur scroll | Cartes | Frame moyenne | P95 | Max | Long frames |
|------|-------|----------------|--------|---------------|-----|-----|-------------|
| Home | oui | 19814 px | - | 33.63 ms | 50 ms | 83.4 ms | 6 |
| Galerie Mobilier | oui | 5256 px | 24 | 17.07 ms | 16.8 ms | 33.4 ms | 0 |
| Galerie Planches | oui | 5138 px | 24 | 16.87 ms | 16.8 ms | 33.4 ms | 0 |
| Le Comptoir | oui | 12849 px | 44 | 20.19 ms | 33.4 ms | 50 ms | 0 |
| Page produit | oui | 2507 px | 4 | 19.93 ms | 33.4 ms | 50 ms | 0 |

**Conclusion** : Mobilier, Planches, Le Comptoir et les pages produit sont désormais nettement plus stables. L'accueil reste la page la plus lourde du site, mais les causes de freeze les plus évidentes ont été réduites : moins de RAF concurrents, moins de travail image pendant le scroll, moins de préchargement agressif, moins de renders React liés au scroll.

### 8.4 Pistes restantes

- Mesurer l'accueil en conditions réelles sur mobile Android/iOS, car c'est la seule page qui garde quelques longues frames en test de stress.
- Envisager un découpage plus profond de certains bundles (`firebase`, `xlsx`, admin) pour réduire la charge initiale.
- Si le hero 3D de l'accueil reste sensible sur appareils modestes, ajouter une qualité adaptative basée sur `deviceMemory`, `hardwareConcurrency` ou le premier score de frame time.

## 9. Preloader mobile de demarrage - 7 mai 2026

Objectif : reprendre le preloader visuel de la vitrine v50 au lancement mobile, afin de masquer la phase de boot et de lancer les prechargements critiques avant l'interaction utilisateur.

Fichiers modifies :
- `src/components/layout/StartupPreloader.jsx`
- `src/utils/startupWarmup.js`
- `src/App.jsx`
- `src/index.css`

Changements :
- ajout d'un preloader global mobile/tactile, avec fond brun sombre et signature Tous a Table inspiree de v50 ;
- remplacement du spinner initial par ce preloader quand le terminal est mobile/tactile ;
- warmup pendant le preloader des chunks publics prioritaires (`GalleryView`, `ShopView`, details hors reseau reduit) ;
- prechargement des images hero marketplace mobiles et des premieres images produits deja recues ;
- pas de changement du scroll mobile : Lenis reste desktop-only, le tactile reste natif.

Validation :
- `npm run build` OK.

Risque restant :
- a verifier sur Xiaomi reel : le preloader deplace la charge initiale avant usage, mais ne corrige pas a lui seul un jank qui viendrait d'un decode image tardif ou d'un rendu Firestore arrive apres la fermeture.

Correction 7 mai 2026 :
- le `StartupPreloader` reprend le vrai timeline GSAP du preloader v50 pour l'entree et la sortie : fond `#1a1a1a`, voile secondaire `#9C8268` a 20%, entree `expo.out`, sortie rideau `expo.inOut` en 0.8 s avec decalage 0.05 s ;
- le warmup reste lance pendant le preloader, avec images critiques separees mobile/desktop ;
- le preloader de demarrage est actif sur les routes publiques marketplace mobile et desktop, en conservant `?skipPreloader=1`, le respect de `prefers-reduced-motion`, et les exclusions admin/login.

Correction 8 mai 2026 :
- verification des commits v35, v44, v45 et v50 : la sortie historique ne deplacait pas les lettres seules, elle faisait monter tout l'overlay `preloader-overlay` en `yPercent: -100` apres le voile secondaire ;
- le wrapper React du nouveau `StartupPreloader` garde maintenant un fond transparent, pour que la montee du panneau `#1a1a1a` revele bien la page comme dans l'ancien code, sans couche noire fixe derriere la sortie.

## 10. Optimisation mobile faible puissance de `/a-propos` - 7 mai 2026

Objectif : rendre la page vitrine `/a-propos` fluide sur les telephones avec CPU/GPU modestes, sans changer l'architecture Lenis existante ni supprimer les animations sur les appareils capables.

Cause analyse :
- la page gardait plusieurs sources de travail continu sur mobile : WebGL hero, marquee editorial avec `gsap.ticker`, `useScroll`/`useVelocity`, cartes Framer Motion liees au scroll, parallax GSAP scrub sur les images manifesto, animations de blur/filter et `will-change` permanents ;
- les resize mobile lies a la barre d'adresse pouvaient appeler `renderer.setSize(...)` pendant l'inertie native ;
- le preloader public ne couvrait pas encore `home/about`, donc `/a-propos` ne profitait pas du warmup global de demarrage.

Fichiers modifies :
- `src/utils/devicePerformance.js`
- `src/utils/startupWarmup.js`
- `src/App.jsx`
- `src/pages/HomeView.jsx`
- `src/components/home/ThreeBackground.jsx`
- `src/components/home/StackedCards.jsx`
- `src/components/ui/EditorialMarquee.jsx`
- `src/components/home/ProcessSection.jsx`
- `src/index.css`
- `src/hooks/useLenisScroll.js`

Changements :
- ajout d'un profil `tat-low-power-mobile` base sur tactile, `deviceMemory`, `hardwareConcurrency`, `saveData`, reseau lent et largeur mobile ;
- ajout de `/a-propos`/`home` au `StartupPreloader` global avec warmup cible des images critiques de la page atelier ;
- WebGL conserve sur mobile faible puissance, mais boucle RAF reellement stoppee quand `.hero-section` sort du viewport, puis relancee au retour vers le haut via `window.__setThreePaused` et un listener scroll RAF-coalesce ;
- baisse du cout WebGL sur tactile : pas d'antialiasing, pixel ratio 1, geometrie reduite et resize WebGL ignore sur petits changements de hauteur de barre navigateur ;
- animations conservees sur toutes les sections : marquee editorial, cartes Framer Motion scroll-linked, parallax manifesto, reveals blur/filter, counters, theme transitions et rotations restent actifs ;
- optimisation du marquee sans changer le rendu : les tickers GSAP sont mis en pause par `IntersectionObserver` quand la section est hors viewport ;
- les hints `will-change` permanents sont reduits sur profil mobile faible puissance sans supprimer les animations visibles ;
- ajout de `decoding="async"` / lazy loading sur images tardives de la page.

Validation :
- `npm run build` OK le 7 mai 2026 ;
- route locale `http://127.0.0.1:5174/a-propos` repond HTTP 200.

Risques restants :
- a valider sur un vrai Xiaomi / Android entree de gamme avec le frame sampler, car le gain principal cible le runtime mobile reel ;
- les gros chunks Vite historiques (`firebase`, `heic2any`, etc.) restent signales par le build, sans regression nouvelle observee.

Correction 8 mai 2026 :
- demande utilisateur : ne pas supprimer le hero WebGL sur mobile faible puissance ;
- `ThreeBackground` est a nouveau monte pour tous les profils, mais sa boucle `requestAnimationFrame` est reellement annulee quand `.hero-section` n'est plus visible ;
- retour en haut : `ScrollTrigger` et le listener scroll RAF-coalesce appellent `window.__setThreePaused(false)` pour relancer la boucle WebGL ;
- demande utilisateur : ne pas casser les animations des sections ; les versions statiques temporaires du marquee et des cartes ont ete supprimees, le parallax manifesto et les reveals complets ont ete restaures ;
- validation : `npm run build` OK et `/a-propos` repond HTTP 200 en local.

Correction 8 mai 2026 - demarrage WebGL differe :
- demande utilisateur : eviter que le WebGL du hero demarre en meme temps que l'animation "Le Geste / & L'Ame" et les descriptions du bas ;
- `HomeView` ne monte plus `ThreeBackground` au premier paint : `shouldMountThree` passe a `true` pendant la revelation de "Le Geste / & L'Ame" (`heroTitle+=0.35` / `exit+=0.65`), avec un callback final de securite ;
- `ThreeBackground` signale son premier rendu via `onReady`, puis `.three-fade-layer` passe de `opacity: 0` a `1` en fondu GSAP pour eviter l'effet d'apparition instantanee ;
- effet attendu : le chunk Three.js, le renderer WebGL et la RAF commencent apres le titre hero sans concurrencer le premier rendu texte, puis gardent le stop/restart hors viewport deja en place.

## 10. Audit Comptoir mobile scroll - 7 mai 2026

Objectif : reduire les risques de lag/freeze pendant le scroll mobile sur `/comptoir`, sans casser l'UI ni les animations visibles.

Constats :
- Lenis est bien desktop-only dans `src/hooks/useLenisScroll.js` : early return tactile, `syncTouch: false`, `autoRaf: false`, instance unique via `App.jsx`.
- Le header global utilise deja un scroll listener passif + `requestAnimationFrame` + diff avant `setIsHeaderVisible`, donc pas de setState direct a chaque event scroll.
- Le Comptoir avait encore une source de travail React hors scroll : le mot "Rituel Bois" mettait a jour l'etat dans `ShopView`, ce qui faisait retraverser la page complete et les grilles produit toutes les 55 a 145 ms pendant toute la visite.
- Plusieurs surfaces mobiles utilisaient du `backdrop-blur` pendant le scroll : bouton filtre fixed, badges de cartes, CTA, bloc tutoriel. Le blur fixed est le plus risque car il recomposite le contenu en mouvement sous le bouton.
- Le hero Comptoir charge 6 images produit externes Amazon ; sans `decoding="async"`, le decode pouvait tomber sur les premiers gestes de scroll.

Changements appliques :
- `src/pages/ShopView.jsx` : extraction de l'animation de mot dans `RitualWordLoop`, afin que les ticks de typing ne rerendent plus toute la page Comptoir.
- `src/pages/ShopView.jsx` : suppression du `backdrop-blur-xl` du bouton filtre mobile fixed, et passage du blur du bloc tutoriel en `md:backdrop-blur-xl` uniquement.
- `src/components/shop/ShopProductCard.jsx` : suppression du blur sur mobile pour les badges et le CTA, conserve a partir de `sm`.
- `src/components/shop/WorkshopHero.jsx` : ajout de `decoding="async"` sur les images hero, `fetchPriority="high"` sur les deux images principales, `loading="lazy"` sur les images secondaires.

Validation :
- `npm run build` OK le 7 mai 2026.
- `npm run verify:seo-roadmap` OK le 7 mai 2026, 16 checks passes.
- Checklist source : une seule instanciation `new Lenis(`, aucun `syncTouch: true`, `autoRaf: false`, scroll handlers Comptoir sans setState par event scroll.

Risques residuels :
- Playwright n'est pas installe dans le repo, donc aucune mesure frame-time automatisee n'a ete prise dans cette passe.
- A verifier sur vrai mobile Android/iOS : scroll `/comptoir`, ouverture du drawer categories, passage des blocs tutoriels, decode des images hero au premier chargement.
- Les classes `.tat-shop-card-shell` et `.tat-heavy-section` desactivent `content-visibility` sur `pointer: coarse` ; c'est un arbitrage a re-mesurer sur appareil reel si les sections longues restent lourdes.

## 11. Warmup oriente parcours marketplace - 8 mai 2026

Objectif : eviter que le preloader de demarrage charge trop de routes/images en parallele, afin de garder l'animation fluide et de concentrer le budget reseau/CPU sur le premier ecran reel : la marketplace mobilier.

Fichiers modifies :
- `src/utils/startupWarmup.js`
- `src/App.jsx`
- `src/Router.jsx`
- `src/pages/GalleryView.jsx`
- `src/designs/architectural/MarketplaceLayout.jsx`
- `src/designs/architectural/components/ArchitecturalHeader.jsx`
- `src/designs/architectural/components/ProductCard.jsx`
- `src/pages/ShopView.jsx`
- `src/components/shop/ShopProductCard.jsx`

Changements :
- le warmup pendant le preloader marketplace ne charge plus par defaut Planches, Comptoir, `ProductDetail` ni `ShopProductDetail` ;
- le preloader marketplace charge seulement le chunk `GalleryView`, les images hero mobilier adaptees au viewport et les premieres images mobilier ;
- le nombre d'images mobilier chauffe pendant le preloader depend du profil appareil : 3 si reseau limite/mobile faible puissance, 5 sur tactile, 8 sur desktop ;
- le warmup Planches est declenche sur intention utilisateur (`hover`, `focus`, `pointerdown`, puis clic) des boutons Planches dans le header desktop et le switcher mobile ;
- le warmup Comptoir est declenche sur intention utilisateur du bouton Comptoir ;
- le warmup detail produit est declenche sur intention/clic d'une carte meuble, et le warmup detail Comptoir sur intention/clic d'une carte produit Comptoir ;
- les routes directes `/planches-a-decouper-anciennes`, `/comptoir`, `/produit/...` et `/comptoir/...` gardent un warmup cible adapte a leur route initiale.

Validation :
- `npm run build` OK le 8 mai 2026.

Risques residuels :
- a valider sur vrai mobile Android/iOS : fluidite de l'animation preloader pendant decode hero mobilier et premier rendu grille ;
- le prefetch d'intention sur mobile se declenche surtout au `pointerdown`, donc il sert principalement a anticiper le debut de navigation, pas une longue phase de prechargement avant clic.

Correction preloader 8 mai 2026 :
- l'entree GSAP du preloader garde la priorite : le warmup ne demarre plus sur la premiere frame, il attend la fin de l'intro puis travaille sur un budget court avant la sortie ;
- les images du warmup sont chargees de maniere cooperative : concurrence limitee pendant le preloader, pauses `requestIdleCallback`/fallback entre images, et `decode()` reserve aux images haute priorite ;
- le warmup mobilier de demarrage est stage : chunk `GalleryView` + hero mobilier d'abord, puis premieres images produits ;
- ajustement visuel de la signature : `Atelier Normand` est groupe avec `TOUS A TABLE` pour controler l'ecart sans additionner `gap` et `margin-top`.

Correction marketplace 8 mai 2026 :
- au clic `Voir plus de produits`, les cartes meubles/planches ne sont plus injectees immediatement : le prochain lot lance d'abord un warmup image/decode limite dans le temps, puis l'animation `tatCardEnter` demarre ;
- sur mobile, le warmup du lot est sequentiel/concurrentiel limite selon profil appareil, pour eviter de saturer le thread principal pendant l'apparition ;
- les images critiques du lot remplissent aussi `RATIO_CACHE` quand leurs dimensions sont disponibles, afin de reduire les changements de hauteur pendant le fondu ;
- les cartes fraiches recoivent `imagePriority` uniquement pendant leur animation, sans supprimer l'animation existante mobile ou desktop.

Ajustement marketplace 8 mai 2026 :
- sur mobile performant, le clic `Voir plus de produits` ne bloque plus sur un warmup de 8 images : seules les 4 premieres images du lot sont prioritaires, avec budget court, puis le reste continue en arriere-plan pendant le stagger ;
- sur mobile faible puissance/reseau limite, le warmup reste plus prudent mais le budget bloquant est reduit pour eviter l'impression de bouton fige ;
- le libelle du bouton reste stable pendant la preparation, afin de reduire la sensation de chargement visible.

Ajustement marketplace S24/iPhone recents - 8 mai 2026 :
- le profil `Voir plus` ne s'appuie plus directement sur le fallback global `Android largeur mobile`, car il classait des telephones haut de gamme comme faibles puissances ;
- si le navigateur expose au moins 6 Go de `deviceMemory` ou 6 coeurs CPU, le warmup du clic passe en profil mobile performant : 3 images prioritaires, budget bloquant court (~420 ms), reste du lot en arriere-plan ;
- les vrais profils limites restent detectes par `saveData`/2G, `prefers-reduced-motion`, RAM <= 4 Go ou CPU <= 4 coeurs.

Ajustement marketplace reveal progressif - 8 mai 2026 :
- demande utilisateur : conserver l'animation premium `tatCardEnter` avec blur/fondu, mais eviter le freeze au moment ou les nouvelles cartes arrivent apres `Voir plus de produits` ;
- `MarketplaceLayout` ne monte plus les 12 nouvelles cartes dans le meme frame apres le warmup : le lot est revele par micro-lots adaptes au profil appareil (desktop, tactile performant, tactile contraint), tout en gardant le meme keyframe d'apparition ;
- `freshOrder` stocke maintenant un delai en millisecondes par carte fraiche, afin que chaque micro-lot puisse lancer l'animation sans recalculer un stagger global trop couteux ;
- seules les premieres cartes du lot gardent `imagePriority`, le reste profite du warmup et du lazy loading pour reduire la pression decode/reseau pendant l'animation ;
- le bouton reste occupe jusqu'a la fin de la salve courante pour eviter deux sequences `Voir plus` concurrentes ;
- validation : `git diff --check -- src/designs/architectural/MarketplaceLayout.jsx` OK et `npm run build` OK le 8 mai 2026.

Correction marketplace planches - 8 mai 2026 :
- diagnostic utilisateur : le bouton `Voir plus de produits` des planches n'etait pas systematique, car `visibleCount` etait partage par `MarketplaceLayout` entre mobilier et planches ;
- passage de collection : la fenetre visible repart a 24, les timers de reveal sont annules, `freshOrder`/`freshPriorityIds` et les hauteurs masonry sont remis a zero ;
- sur la collection `cutting_boards`, les filtres categories mobilier (`buffet`, `table`, `armoire`, etc.) ne sont plus rendus et la categorie interne est forcee a `all` ;
- la reinitialisation des filtres sur les planches ne rappelle plus `onCategoryChange`, afin de ne pas renvoyer l'utilisateur vers la page mobilier.

Ajustement preloader desktop/laptop - 8 mai 2026 :
- demande utilisateur : rendre le preloader plus harmonieux sur laptop et desktop, les espacements marteau / `TOUS A TABLE` / `Atelier Normand` etant trop compresses ;
- application du skill `frontsymmetry` : le preloader est un overlay fixed isole, donc les ajustements sont limites aux gaps internes et tailles des enfants, sans modifier le flux du site ni la timeline GSAP ;
- breakpoints ajoutes : `768px`, `1024px`, `1440px` avec respiration verticale progressive, titre plus present, tracking reduit pour contenir la largeur, marteau agrandi et signature reequilibree.

Ajustement preloader vertical - 8 mai 2026 :
- demande utilisateur : ajouter proportionnellement plus de marge entre le marteau et `TOUS A TABLE`, puis entre `TOUS A TABLE` et `Atelier Normand`, sur mobile, laptop et desktop ;
- `frontsymmetry` : augmentation des deux gaps internes uniquement (`tat-startup-preloader-content` et `tat-startup-preloader-brand`), sans changement de taille, de timeline GSAP ni de layout public ;
- valeurs finales : mobile `2.55rem / 1.86rem`, 768px `3.55rem / 2.55rem`, 1024px `4rem / 2.85rem`, 1440px `4.35rem / 3.05rem`.

Ajustement signature preloader desktop/laptop - 8 mai 2026 :
- demande utilisateur : rendre `Atelier Normand` et ses deux traits plus gros sur laptop/desktop, et l'eloigner davantage de `TOUS A TABLE` ;
- mobile conserve intact ; seuls les breakpoints `768px`, `1024px`, `1440px` changent ;
- signature agrandie, traits allonges et gap titre/signature augmente pour une hierarchie plus harmonieuse.

Ajustement icone preloader mobile - 8 mai 2026 :
- demande utilisateur : le marteau mobile etait trop gros par rapport au titre et a la signature ;
- taille SVG mobile fixee a `2.8rem`, les tailles laptop/desktop validees restent inchangées via les media queries existantes.

Ajustement signature mobile - 8 mai 2026 :
- demande utilisateur : descendre legerement `Atelier Normand` sur mobile ;
- `frontsymmetry` : deplacement visuel seul via `top: 0.22rem` sur la signature mobile, reset a `top: 0` des `768px` pour ne pas changer laptop/desktop.

Ajustement titre preloader mobile - 8 mai 2026 :
- demande utilisateur : agrandir legerement `TOUS A TABLE` sur mobile apres reequilibrage du marteau et de la signature ;
- taille mobile passee a `clamp(1.94rem, 8.7vw, 2.34rem)` en conservant la limite de largeur existante pour eviter le contact avec les bords de l'ecran.

## 12. Comptoir - retrait animations d'apparition ciblees - 8 mai 2026

Objectif : retirer les animations d'apparition des deux premieres cartes de chaque section Comptoir et des six images du hero, sans changer la composition visuelle ni les hover states.

Fichiers modifies :
- `src/pages/ShopView.jsx`
- `src/components/shop/ShopProductCard.jsx`
- `src/components/shop/WorkshopHero.jsx`

Changements :
- `ShopProductCard` accepte `disableAppearAnimation` et expose `data-shop-card-appear` pour distinguer les cartes animables ;
- `ShopView` passe `disableAppearAnimation={index < 2}` sur chaque section produit ;
- l'ancien `gsap.from(grid)` sur le wrapper `.product-grid` a ete retire, sinon les deux premieres cartes continuaient a apparaitre avec le groupe ;
- une tentative d'animation GSAP carte-par-carte a ete retiree immediatement : elle pouvait laisser les cartes suivantes en `opacity: 0` si le `ScrollTrigger` ne jouait pas au bon moment ;
- `WorkshopHero` ne monte plus de refs ni de `useGSAP` pour les 6 images : elles sont presentes directement au rendu initial, avec les transitions hover conservees.

Validation :
- `git diff --check` OK sur les fichiers touches.
- `npm run build` bloque hors scope : `src/components/home/StackedCards.jsx` importe `../ui/EditorialMarquee`, mais `src/components/ui/EditorialMarquee.jsx` est actuellement supprime dans le worktree.

Risque restant :
- build complet a relancer apres resolution de la suppression de `EditorialMarquee.jsx`.

# Audit Design — Hero Section « L'Atelier »
> Périmètre strict : `WorkshopHero.jsx` + `<section>` hero dans `ShopView.jsx`  
> Mode : **LECTURE SEULE** — aucune modification. Plan chirurgical uniquement.

---

## 1. Cartographie des breakpoints actuels

| Viewport | Breakpoint Tailwind | Comportement actuel |
|---|---|---|
| Desktop large (1280px+) | `xl:` | ✅ Bento 6 images + overlays typographiques parfaits |
| Laptop (1024–1279px) | `lg:` | ✅ Bento à `56vw / max-w-[900px]` — peut être serré sur 1024px |
| **Tablette paysage (768–1023px)** | `md:` sans `lg:` | 🔴 ZONE MORTE |
| **Tablette portrait (600–767px)** | entre `sm:` et `md:` | 🔴 ZONE MORTE |
| Mobile (< 600px) | défaut | 🟠 Collision texte/bento, hauteur insuffisante |

---

## 2. Issues identifiées

### 🔴 CRITIQUE — Tablette (768–1023px) : La « zone morte »

**Fichiers :** `WorkshopHero.jsx` L58 vs L151

```jsx
// Desktop — visible seulement >= 1024px
className="... hidden lg:block"

// Mobile — visible seulement < 1024px
className="... lg:hidden"
```

**Problème :** Il n'existe aucun layout tablette intermédiaire. Entre 768px et 1023px :
- Le bento desktop (6 images, 900px, `h-[448px]`) est **masqué**
- Le mini-bento phone (`w-[46vw] max-w-[240px]`, 3 images) **prend le relais**
- Un bento de 240px prévu pour un iPhone s'affiche sur un iPad 9" → visuellement catastrophique

**Impact :** La moitié droite du hero est soit vide, soit occupée par un carré microscopique. Le layout ressemble à un bug.

---

### 🟠 MAJEUR — Collision structurelle texte / bento mobile

**Fichiers :** `WorkshopHero.jsx` L151 + `ShopView.jsx` L232

```jsx
// Bento : absolu, ancré à droite
className="absolute right-4 top-[54%] -translate-y-1/2 w-[46vw] max-w-[240px] lg:hidden"

// Titre : en flux normal, text-6xl
className="hero-reveal font-serif text-6xl ... leading-[0.85]"
```

**Calcul sur iPhone SE (375px) :**
- Titre `text-6xl` (60px) × `leading-[0.85]` × 2 lignes ≈ **102px haut / ~280px large**
- Bento : **240px** depuis `right-4` (16px du bord)
- Total horizontal requis : **280 + 240 + marges > 375px**
- → **Chevauchement structurel garanti**

---

### 🟠 MAJEUR — Positionnement `top-[54%]` fragile

**Fichier :** `WorkshopHero.jsx` L151

```jsx
top-[54%] -translate-y-1/2
```

Le `%` est relatif à la hauteur du parent `<section>`. Comme celle-ci varie (`min-h-[60vh]` mobile vs `min-h-[85vh]` tablette), le bento flotte à des positions imprévisibles. Valeur magique non défensive.

---

### 🟠 MAJEUR — Hauteur de section et padding sur mobile

**Fichier :** `ShopView.jsx` L171

```jsx
className="relative min-h-[60vh] md:min-h-[85vh] flex flex-col justify-end
           px-6 xl:px-12 pb-16 md:pb-24 pt-32 overflow-hidden"
```

**Problèmes :**

| Problème | Détail |
|---|---|
| `min-h-[60vh]` mobile | iPhone SE : ~400px. Avec navbar (72px) + `pt-32` (128px) = ~200px restants pour titre + paragraphe + bento. Insuffisant. |
| `pt-32` fixe | 128px de padding-top sur toutes les tailles. Écrase l'espace utile mobile. |
| `justify-end` | Texte collé en bas. Bento à `top-[54%]` au milieu. Aucune relation de layout cohérente. |

---

### 🟡 MODÉRÉ — Titre hero : `text-6xl` trop grand sur petit mobile

**Fichier :** `ShopView.jsx` L232

```jsx
className="hero-reveal font-serif text-6xl md:text-8xl xl:text-[11.5rem] leading-[0.85] tracking-tighter"
```

`text-6xl` = 60px. Sur 375px, les mots « Le Soin » et « du Bois. » tiennent à peine. Aucun breakpoint `sm:` pour adoucir la transition entre mobile et tablette.

---

### 🟡 MODÉRÉ — Bloc typewriter `Rituel Bois` absent sur tablette

**Fichier :** `ShopView.jsx` L174

```jsx
className="hidden lg:block absolute left-6 xl:left-12 top-10 z-10 pointer-events-none"
```

L'animation `NOURRIR / PROTEGER / RESTAURER` + pills est entièrement masquée avant `lg:`. Sur tablette, le hero n'a ni animation, ni bento correct. Combiné à la zone morte, le hero tablette est une coquille vide.

---

### 🟡 MODÉRÉ — `max-w-2xl` du sous-texte en collision mobile

**Fichier :** `ShopView.jsx` L235

```jsx
<div className="hero-reveal max-w-2xl">
```

Sur mobile, la largeur disponible après le bento flottant (240px + 16px) ≈ **120px**. Le paragraphe `max-w-2xl` (672px) tente de tenir dans cet espace → colonne ultra-étroite, texte illisible.

---

### 🟢 MINEUR — Glow décoratif décalé du bento mobile

**Fichier :** `ShopView.jsx` L229

```jsx
className="absolute top-0 right-0 w-[50vw] h-[50vw] ..."
```

Glow en `top-0 right-0` (coin haut-droit) ; bento à `top-[54%] right-4` (milieu). L'association lumineuse est perdue sur mobile. Non bloquant mais incohérent.

---

## 3. Plan Chirurgical

> **Règle d'or absolue :** Tout ce qui est `lg:` et au-delà reste **INTOUCHÉ**.  
> Les modifications se limitent aux breakpoints `md:` et inférieurs.

---

### ACTION 1 🔴 — Créer un bento tablette (nouveau bloc `md:block lg:hidden`)
**Fichier :** `WorkshopHero.jsx`

Ajouter un **troisième bloc de composition** entre desktop et mobile :

```
Desktop (lg+)    : 6 images, grid-cols-12, h-[448px]  → UNCHANGED  (hidden lg:block)
Tablette (md–lg) : 3-4 images, grid 2×2, ~h-[340px]   → A CRÉER   (hidden md:block lg:hidden)
Mobile (< md)    : 3 images, compact                   → A AJUSTER (block md:hidden)
```

**Dimensionnement tablette recommandé :**

```jsx
// Conteneur
className="absolute right-4 top-1/2 -translate-y-1/2 w-[48vw] max-w-[440px] hidden md:block lg:hidden"

// Container carte
<div className={`rounded-[24px] border p-3 ${darkMode ? 'border-white/5 bg-black/10' : 'border-stone-300/60 bg-white/25'}`}>
  <div className="grid grid-cols-2 gap-3 h-[340px]">
    {/* Image 1 : col-span-1 row-span-2 (colonne gauche haute) */}
    {/* Image 2 : col-span-1 (haut droit) */}
    {/* Image 3 : col-span-1 (bas droit) */}
  </div>
</div>
```

---

### ACTION 2 🔴 — Corriger le bento mobile (breakpoint + position)
**Fichier :** `WorkshopHero.jsx` L151

```jsx
// Actuel — fragile, valve mobile/tablette mal calibrée
"absolute right-4 top-[54%] -translate-y-1/2 w-[46vw] max-w-[240px] lg:hidden"

// Proposé — mobile uniquement, position ajustée
"absolute right-3 top-[44%] sm:top-[48%] -translate-y-1/2 w-[44vw] max-w-[220px] md:hidden"
```

Changer `lg:hidden` → `md:hidden` car le bloc tablette dédié (ACTION 1) prend le relais à partir de `md:`.

---

### ACTION 3 🟠 — Ajuster la hauteur et le padding de la section hero
**Fichier :** `ShopView.jsx` L171

```
Actuel  : min-h-[60vh]          md:min-h-[85vh]
Proposé : min-h-[75vh] sm:min-h-[80vh] md:min-h-[85vh]

Actuel  : pt-32  (fixe sur tout)
Proposé : pt-20 sm:pt-24 md:pt-32

Actuel  : pb-16          md:pb-24
Proposé : pb-10 sm:pb-14 md:pb-24
```

Le desktop (`md:` et au-delà) reste **identique**.

---

### ACTION 4 🟡 — Ajouter un breakpoint `sm:` sur le titre
**Fichier :** `ShopView.jsx` L232

```
Actuel  : text-6xl  md:text-8xl  xl:text-[11.5rem]
Proposé : text-5xl  sm:text-6xl  md:text-8xl  xl:text-[11.5rem]
```

`xl:text-[11.5rem]` reste **INTOUCHÉ**.

---

### ACTION 5 🟡 — Contraindre le sous-texte sur mobile
**Fichier :** `ShopView.jsx` L235

```
Actuel  : max-w-2xl         (s'applique partout)
Proposé : max-w-[52%] sm:max-w-xs md:max-w-2xl
```

`md:max-w-2xl` restaure le comportement desktop identique.

---

## 4. Récapitulatif des modifications

| Fichier | Lignes | Action | Priorité |
|---|---|---|---|
| `WorkshopHero.jsx` | L58, L151–186 | Bloc tablette (nouveau) + ajustement bento mobile | 🔴 |
| `ShopView.jsx` | L171 | `min-h` + `pt` + `pb` adaptatifs | 🟠 |
| `ShopView.jsx` | L232 | Breakpoint `sm:` sur le titre | 🟡 |
| `ShopView.jsx` | L235 | `max-w` progressif sur le sous-texte | 🟡 |
| `ShopView.jsx` | L229 | (optionnel) Aligner le glow avec le bento | 🟢 |

**Lignes à ne JAMAIS toucher :**
- `WorkshopHero.jsx` L58–148 → bento desktop intact
- Tout `lg:` / `xl:` dans `ShopView.jsx` → desktop préservé

---

## 5. Checklist de validation post-implémentation

- [ ] iPhone SE 375px — pas de chevauchement texte/bento, tout lisible
- [ ] iPhone 14 Pro 393px — composition 55/45 équilibrée
- [ ] iPad mini portrait 768px — bento tablette visible et proportionné
- [ ] iPad Air paysage 1024px — transition propre vers desktop
- [ ] MacBook 1280px — aucune régression, desktop parfaitement intact

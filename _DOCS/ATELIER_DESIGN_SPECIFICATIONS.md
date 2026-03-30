# SPÉCIFICATIONS DESIGN COMPLÈTES : Page Atelier "Tous à Table"

> **Document de référence** : Pour l'implémentation par agent IA (Claude/Gemini)  
> **Date** : Mars 2026  
> **Objectif** : Transformer la boutique d'affiliation en expérience premium "Editorial E-commerce"  
> **Exclusion** : Section Hero (déjà validée, ne pas modifier)

---

## 🎯 VISION GLOBALE & PHILOSOPHIE UX

### Identité de l'Expérience
La page Atelier doit incarner une **galerie éditoriale premium** où chaque produit est présenté comme un objet de curation. L'utilisateur ne "fait pas ses courses", il **découvre une sélection experte** dans une ambiance sophistiquée et immersive.

### Principes Directeurs
1. **Premium Storytelling** : Chaque élément raconte une histoire, de la typographie aux animations
2. **Immersif & Cinématique** : Les interactions sont fluides, dramatiques, avec un timing soigné (800ms+)
3. **Glassmorphism & Layering** : Profondeur visuelle par superposition de calques avec backdrop-blur
4. **Conversion par Élégance** : Le CTA n'est jamais agressif, mais irrésistible par son raffinement

---

## 📐 ARCHITECTURE DE LA PAGE

### Structure Hiérarchique

```
┌─────────────────────────────────────────────────────────┐
│  HEADER PRINCIPAL (existant, ne pas toucher)            │
├─────────────────────────────────────────────────────────┤
│  HERO SECTION (existant, ne pas toucher)                │
├─────────────────────────────────────────────────────────┤
│  🆕 BARRE DE FILTRES STICKY (Pills Glassmorphism)       │ ← Position: sticky top-[88px]
├─────────────────────────────────────────────────────────┤
│                                                          │
│  GRILLE DE PRODUITS (Responsive Grid)                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Card │ │ Card │ │ Card │ │ Card │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Card │ │ Card │ │ Card │ │ Card │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│  ┌─────────────────────────────┐                        │
│  │  BLOC ÉDITORIAL INLINE      │ ← Après 3-4 produits  │
│  │  (Magazine Spread)          │                        │
│  └─────────────────────────────┘                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Card │ │ Card │ │ Card │ │ Card │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 SYSTÈME DE DESIGN (Design Tokens)

### Palette de Couleurs
```css
/* Base Neutrals */
--stone-900: #1c1917;
--stone-800: #292524;
--stone-700: #44403c;
--stone-50: #fafaf9;
--stone-400: #a8a29e;

/* Accent Brand */
--amber-500: #f59e0b;
--amber-500-20: rgba(245, 158, 11, 0.2);
--amber-500-80: rgba(245, 158, 11, 0.8);

/* Glassmorphism Overlays */
--glass-dark: rgba(28, 25, 23, 0.4);   /* stone-900/40 */
--glass-light: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.05);
```

### Ombres & Profondeur
```css
/* Premium Shadows */
--shadow-premium-dark: 0 20px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-premium-light: 0 20px 50px -12px rgba(0, 0, 0, 0.08);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.35);

/* Glow Effects */
--glow-amber: 0 0 20px rgba(245, 158, 11, 0.3);
```

### Typographie
```css
/* Font Families */
--font-serif: 'Cormorant Garamond', serif;
--font-sans: 'Plus Jakarta Sans', sans-serif;

/* Type Scale - Product Cards */
--brand-size: 8px;
--brand-tracking: 0.3em;
--brand-weight: 900;

--product-name-size-desktop: 24px;
--product-name-size-mobile: 18px;
--product-name-leading: 1.0; /* leading-none */
--product-name-weight: 400;

--price-size: 11px;
--price-weight: 500;

--description-size: 11px;
--description-opacity: 0.6;
--description-weight: 400;
```

### Espacements & Bordures
```css
/* Border Radius */
--card-radius: 28px; /* Organique, plus rond */
--pill-radius: 9999px; /* Capsule parfaite */

/* Grid Gaps */
--gap-mobile: 0.75rem; /* gap-3 */
--gap-desktop: 2rem;   /* gap-8 */
```

---

## 🔍 COMPOSANT 1 : BARRE DE FILTRES STICKY

### Spécifications Techniques

**Position & Layout**
```jsx
className="sticky top-[88px] z-40 h-14 backdrop-blur-xl bg-stone-900/80 border-b border-white/5"
```

**Structure HTML/JSX**
```jsx
<div className="sticky top-[88px] z-40 h-14 backdrop-blur-xl bg-stone-900/80 border-b border-white/5">
  <div className="max-w-[1920px] mx-auto px-6 h-full">
    <div className="flex items-center gap-3 h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory">
      
      {/* Pill "Tout Afficher" */}
      <button 
        onClick={() => setActiveCategory(null)}
        className={`
          flex-shrink-0 px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold
          backdrop-blur-md border transition-all duration-300 snap-center
          ${activeCategory === null 
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
            : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-stone-200'
          }
        `}
      >
        Tout Afficher
      </button>

      {/* Pills Catégories */}
      {categories.map((category) => (
        <button 
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className={`
            flex-shrink-0 px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold
            backdrop-blur-md border transition-all duration-300 snap-center
            ${activeCategory === category.id 
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
              : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-stone-200'
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  </div>
</div>
```

### Comportement Fonctionnel

**Filtrage Exclusif Instantané**
- Clic sur une pill → `setActiveCategory(categoryId)`
- La grille filtre immédiatement pour n'afficher que les produits de cette catégorie
- Les autres produits disparaissent avec animation (voir section Transitions)
- Un bouton "Tout Afficher" permet de revenir à la vue complète
- La pill active a un glow amber subtil

**Scroll Horizontal Mobile**
- `overflow-x-auto` avec `scrollbar-hide`
- `snap-x snap-mandatory` pour un scroll fluide avec points d'accroche
- Chaque pill a `snap-center` pour s'aligner au centre lors du scroll

---

## 🎴 COMPOSANT 2 : PRODUCT CARD V2 (Premium Storytelling)

### Anatomie Visuelle

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │                             │   │ ← Badge Amazon (haut-droit)
│  │                             │   │   Glass overlay
│  │        IMAGE PRODUIT        │   │
│  │      (aspect-[3/4])         │   │
│  │                             │   │
│  │                             │   │
│  │  [Badge Gamme]              │   │ ← Badge Gamme (bas-gauche)
│  └─────────────────────────────┘   │   Glass overlay
│                                     │
│  MARQUE (8px uppercase)             │ ← Micro-typo amber-500/80
│  Nom du Produit en Grande Sérif     │ ← 24px Cormorant Garamond
│  (leading-none, 2 lignes max)       │
│                                     │
│  37,90 EUR                          │ ← 11px discret stone-400
│                                     │
│  Description complète du produit    │ ← 11px Plus Jakarta Sans
│  expliquant pourquoi on recommande  │   opacity-60, 3-4 lignes
│  ce produit pour l'entretien...     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Découvrir →                  │ │ ← CTA glass capsule
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Code JSX Complet

```jsx
<motion.div
  layout
  layoutId={`product-${product.id}`}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  className="group relative"
>
  {/* BLOC IMAGE */}
  <div className="relative aspect-[3/4] rounded-[28px] overflow-hidden mb-4">
    <motion.img
      src={product.image}
      alt={product.name}
      className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
      loading="lazy"
    />
    
    {/* Overlay Gradient (apparaît au hover) */}
    <motion.div
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent"
    />
    
    {/* Badge Amazon (Haut-Droit) */}
    <div className="absolute top-3 right-3 px-2 py-1 rounded-md backdrop-blur-md bg-white/10 border border-white/20">
      <span className="text-[8px] uppercase tracking-wider font-black text-white">Amazon</span>
    </div>
    
    {/* Badge Gamme (Bas-Gauche) */}
    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md bg-stone-900/40 border border-white/10">
      <span className="text-[9px] uppercase tracking-wide font-bold text-white">{product.range}</span>
    </div>
  </div>

  {/* BLOC TEXTE */}
  <div className="space-y-2">
    {/* Marque */}
    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-500/80 font-sans">
      {product.brand}
    </p>
    
    {/* Nom du Produit */}
    <h3 className="text-[24px] md:text-[24px] font-serif leading-none text-stone-50 line-clamp-2">
      {product.name}
    </h3>
    
    {/* Prix */}
    <p className="text-[11px] font-medium text-stone-400 font-sans">
      {product.price}
    </p>
    
    {/* Description */}
    <p className="text-[11px] leading-relaxed text-stone-300 opacity-60 font-sans line-clamp-4">
      {product.whyWeRecommend}
    </p>
  </div>

  {/* CTA - Capsule Glass avec Backdrop Subtil */}
  <motion.a
    href={product.amazonLink}
    target="_blank"
    rel="noopener noreferrer"
    className="
      mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
      backdrop-blur-sm bg-white/5 border border-white/10
      text-[11px] font-medium text-stone-300
      transition-all duration-300
      hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]
    "
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span>Découvrir</span>
    <motion.span
      animate={{ x: [0, 4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      →
    </motion.span>
  </motion.a>
</motion.div>
```

### États Interactifs (Immersif & Cinématique)

**Hover Desktop**
1. **Image** : `scale-110` avec transition de 800ms (zoom doux et lent)
2. **Overlay gradient** : Apparition d'un gradient sombre depuis le bas (opacity 0 → 1)
3. **Carte** : Légère élévation avec `shadow-2xl`
4. **CTA** : Le backdrop devient plus opaque + glow amber + la flèche pulse

**Tap Mobile**
- Swipe horizontal sur la carte pour révéler plus d'informations (optionnel, à implémenter si besoin)
- Sinon, simple tap ouvre le lien Amazon directement

**Animation de Parallax (Optionnel - Effet Wow)**
```jsx
// Au hover, créer un léger effet parallax sur l'image
onMouseMove={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  setParallax({ x: x * 10, y: y * 10 });
}}
```

---

## 📊 COMPOSANT 3 : GRILLE RESPONSIVE

### Breakpoints & Colonnes

```jsx
className="
  grid 
  grid-cols-2          /* Mobile (< 640px) : 2 colonnes */
  sm:grid-cols-3       /* Tablet (640px - 1024px) : 3 colonnes */
  lg:grid-cols-4       /* Desktop (1024px - 1536px) : 4 colonnes */
  2xl:grid-cols-5      /* Wide (> 1536px) : 5 colonnes */
  gap-3 sm:gap-6 lg:gap-8  /* Gaps progressifs */
  px-6 py-12
  max-w-[1920px] mx-auto
"
```

### Logique de Filtrage (State Management)

```jsx
// Dans ShopView.jsx
const [activeCategory, setActiveCategory] = useState(null);

// Filtrer les produits
const filteredProducts = activeCategory 
  ? products.filter(p => p.categoryId === activeCategory)
  : products;

// Rendu avec AnimatePresence pour les transitions
<AnimatePresence mode="wait">
  <motion.div 
    key={activeCategory || 'all'}
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 lg:gap-8"
  >
    {filteredProducts.map((product) => (
      <ShopProductCard key={product.id} product={product} />
    ))}
  </motion.div>
</AnimatePresence>
```

---

## 🎬 COMPOSANT 4 : TRANSITIONS & ANIMATIONS

### Transition entre Catégories (Layout Shift Animé)

**Concept** : Utiliser Framer Motion `layoutId` pour que les cartes se déplacent physiquement vers leurs nouvelles positions.

```jsx
// Configuration AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={activeCategory || 'all'}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
  >
    {filteredProducts.map((product, index) => (
      <motion.div
        key={product.id}
        layoutId={`product-${product.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { 
            delay: index * 0.05, // Stagger de 50ms
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] // Easing custom "easeOutExpo"
          }
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.9,
          transition: { duration: 0.4 }
        }}
      >
        <ShopProductCard product={product} />
      </motion.div>
    ))}
  </motion.div>
</AnimatePresence>
```

### Initial Page Load (Reveal Progressif)

```jsx
// Au chargement initial de la page
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms entre chaque carte
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
  className="grid..."
>
  {products.map((product) => (
    <motion.div key={product.id} variants={item}>
      <ShopProductCard product={product} />
    </motion.div>
  ))}
</motion.div>
```

### Timings Clés
- **Transition catégorie** : 800ms (cinématique)
- **Hover image** : 800ms (zoom lent et doux)
- **CTA hover** : 300ms (réactif)
- **Stagger cards** : 50ms entre chaque (fluide sans être trop lent)

---

## 📝 COMPOSANT 5 : BLOC ÉDITORIAL INLINE

### Concept
Après les 3-4 premiers produits d'une catégorie, insérer un bloc éditorial qui prend **2 colonnes de la grille** (sur desktop). Style "magazine spread" avec typographie contrastée.

### Position dans la Grille

```jsx
{filteredProducts.map((product, index) => (
  <React.Fragment key={product.id}>
    <ShopProductCard product={product} />
    
    {/* Insérer le bloc éditorial après le 4ème produit */}
    {index === 3 && activeCategory && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="
          col-span-2 lg:col-span-2
          p-8 lg:p-12
          rounded-[28px]
          backdrop-blur-xl bg-gradient-to-br from-amber-500/5 to-stone-800/20
          border border-white/5
        "
      >
        {/* Contenu éditorial */}
        <div className="max-w-xl">
          <h3 className="text-3xl lg:text-4xl font-serif leading-tight text-stone-50 mb-4">
            {categoryEditorialContent[activeCategory].title}
          </h3>
          <p className="text-base leading-relaxed text-stone-300 opacity-80 font-sans">
            {categoryEditorialContent[activeCategory].description}
          </p>
        </div>
      </motion.div>
    )}
  </React.Fragment>
))}
```

### Style Visuel
- **Fond** : Gradient subtil `from-amber-500/5 to-stone-800/20` avec `backdrop-blur-xl`
- **Bordure** : `border-white/5` pour intégration douce
- **Typographie** : Titre en 3xl-4xl sérif + description en base sans-serif
- **Espacement** : Padding généreux (p-8 à p-12) pour respiration

---

## 🎨 DESIGN TOKENS COMPLETS (Pour Tailwind Config)

```js
// tailwind.config.js - Ajouts recommandés
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        stone: {
          // Déjà présent dans Tailwind
        },
        amber: {
          // Déjà présent dans Tailwind
        }
      },
      boxShadow: {
        'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      letterSpacing: {
        'widest-plus': '0.3em',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    }
  }
}
```

---

## 📱 EXPÉRIENCE MOBILE (Spécificités)

### Barre de Filtres
- Scroll horizontal fluide avec `snap-x snap-mandatory`
- Pills légèrement plus petites (px-4 au lieu de px-6)
- Indicateur visuel de scroll (fade gradient sur les bords)

### Product Cards
- **Grille** : 2 colonnes (grid-cols-2) avec gap-3
- **Typographie** : Nom du produit à 18px au lieu de 24px
- **CTA** : Bouton pleine largeur sur mobile pour faciliter le tap
- **Hover** : Remplacé par un état "tap" qui maintient l'effet pendant 300ms

### Bloc Éditorial Inline
- Prend toute la largeur (col-span-2) sur mobile
- Padding réduit (p-6 au lieu de p-12)
- Titre à 2xl au lieu de 4xl

---

## ♿ ACCESSIBILITÉ

### Contraste & Lisibilité
- **Badges glass** : Vérifier que le texte blanc sur backdrop-blur a un ratio de contraste ≥ 4.5:1
- **Pills actives** : Le glow amber + la couleur amber-500 doivent être suffisamment distincts
- **Description produit** : Opacity-60 sur stone-300 = vérifier le contraste sur fond sombre

### Navigation Clavier
```jsx
// Ajouter focus-visible sur les pills
className="... focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"

// Ajouter focus sur les cartes produit
className="... focus-within:ring-2 focus-within:ring-amber-500/50"
```

### ARIA Labels
```jsx
<button 
  aria-label={`Filtrer par catégorie ${category.name}`}
  aria-pressed={activeCategory === category.id}
>
  {category.name}
</button>

<a 
  href={product.amazonLink}
  aria-label={`Découvrir ${product.name} sur Amazon`}
>
  Découvrir →
</a>
```

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### Fichiers à Modifier

1. **`ShopView.jsx`** (Composant principal)
   - Ajouter `useState` pour `activeCategory`
   - Implémenter la logique de filtrage
   - Intégrer `AnimatePresence` pour les transitions
   - Ajouter le bloc éditorial inline

2. **`ShopProductCard.jsx`** (Carte produit)
   - Refonte complète selon les specs ci-dessus
   - Ajouter les animations Framer Motion
   - Implémenter le nouveau système de badges glass
   - Nouvelle hiérarchie typographique

3. **`ShopFilterBar.jsx`** (Nouveau composant)
   - Créer le composant de barre sticky
   - Pills avec glassmorphism
   - Gestion du scroll horizontal mobile
   - État actif avec glow

4. **`tailwind.config.js`**
   - Ajouter les custom shadows, fonts, etc.

### Dépendances Requises
```json
{
  "framer-motion": "^10.x.x",
  "lucide-react": "^0.x.x" // Pour les icônes (flèches, etc.)
}
```

### Structure de Données Produit

```js
const product = {
  id: "prod-001",
  categoryId: "huiles-nourrissants",
  brand: "JOHN BOOS",
  name: "Mystery Oil (crystal)",
  price: "37,90 EUR",
  image: "/images/products/john-boos-mystery-oil.jpg",
  range: "PREMIUM", // Badge gamme
  program: "AMAZON", // Badge programme
  whyWeRecommend: "Le premier geste pour choyer un meuble en bois massif. Des huiles professionnelles qui pénètrent au cœur des fibres pour protéger, nourrir et respecter le grain et la toucher naturel. Idéal aussi les huiles alimentaires pour les planches de découpe et ustensiles.",
  amazonLink: "https://amazon.fr/...",
};

const categoryEditorialContent = {
  "huiles-nourrissants": {
    title: "Protection Profonde",
    description: "Le premier geste pour choyer un meuble en bois massif. Des huiles professionnelles qui pénètrent au cœur des fibres pour protéger, nourrir et respecter le grain et la toucher naturel."
  },
  // ... autres catégories
};
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Structure & État
- [ ] Créer le composant `ShopFilterBar.jsx` avec pills glassmorphism
- [ ] Ajouter `useState` pour `activeCategory` dans `ShopView.jsx`
- [ ] Implémenter la logique de filtrage exclusif
- [ ] Tester le filtrage avec données mock

### Phase 2 : Grille & Cards
- [ ] Refondre `ShopProductCard.jsx` avec nouvelle anatomie
- [ ] Implémenter la grille responsive (2/3/4/5 colonnes)
- [ ] Ajouter les badges glass en overlay sur images
- [ ] Implémenter la nouvelle hiérarchie typographique

### Phase 3 : Animations
- [ ] Installer et configurer Framer Motion
- [ ] Ajouter `AnimatePresence` pour transitions de filtrage
- [ ] Implémenter les animations hover (scale, shadow, parallax)
- [ ] Ajouter le stagger sur l'initial load
- [ ] Tester les transitions sur différents devices

### Phase 4 : Contenu Éditorial
- [ ] Créer la structure de données `categoryEditorialContent`
- [ ] Implémenter le bloc éditorial inline (après 4ème produit)
- [ ] Styler le bloc avec gradient glass

### Phase 5 : Polish & Accessibilité
- [ ] Ajouter les focus states pour navigation clavier
- [ ] Implémenter les ARIA labels
- [ ] Vérifier les contrastes de couleurs
- [ ] Tester sur mobile (scroll horizontal, tap states)
- [ ] Optimiser les performances (lazy loading images)

### Phase 6 : Testing Final
- [ ] Test cross-browser (Chrome, Safari, Firefox)
- [ ] Test responsive (mobile, tablet, desktop, wide)
- [ ] Test des animations (fluidité, timing)
- [ ] Test accessibilité (screen reader, keyboard nav)
- [ ] Test performance (Lighthouse score)

---

## 🎯 RÉSUMÉ DES DÉCISIONS UX

| Aspect | Décision | Rationale |
|--------|----------|-----------|
| **Filtrage** | Exclusif instantané | Expérience claire, focus sur une catégorie à la fois |
| **Hiérarchie Carte** | Premium storytelling | Image 70% + grande typo sérif + description complète |
| **Interactions** | Immersif & cinématique | Animations 800ms, parallax, transitions dramatiques |
| **Grille** | Équilibré & scannable | 2/3/4/5 cols, gaps moyens, bon compromis densité/lisibilité |
| **Barre Filtres** | Pills glassmorphism | Minimaliste, élégant, scroll horizontal mobile |
| **Contenu Éditorial** | Inline entre produits | Magazine spread, intégré au flow, pas de friction |
| **Transitions** | Layout shift animé | Cartes qui se déplacent physiquement, effet wow |
| **CTA** | Capsule glass subtile | Backdrop-blur + glow hover, élégant sans être agressif |
| **Badges** | Overlay glass sur image | Discrets, informatifs, cohérents avec le système glass |
| **Typographie** | Contrastée dramatique | 24px sérif pour le nom, micro-typo pour la marque, fort impact |

---

## 🚀 PROCHAINES ÉTAPES

1. **Valider ce document** avec le client
2. **Commencer l'implémentation** en suivant la checklist
3. **Itérer** sur les animations et timings après premiers tests
4. **Déployer** en staging pour validation finale

---

*Document créé pour l'implémentation par agent IA - Mars 2026*  
*Projet "Tous à Table" - Page Atelier Premium E-commerce*

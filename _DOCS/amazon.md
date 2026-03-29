# Documentation Boutique Affiliation — L'Atelier

> Suivi technique de l'implémentation de la boutique d'affiliation au sein de Tous à Table.
> Dernière mise à jour : 29 mars 2026 (ajout plan ShopView)

---

## Table des matières

1. [Contexte & Stratégie](#1-contexte--stratégie)
2. [Programmes d'affiliation](#2-programmes-daffiliation)
3. [Architecture technique](#3-architecture-technique)
4. [Fichiers créés](#4-fichiers-créés)
5. [Fichiers modifiés](#5-fichiers-modifiés)
6. [Schema Firestore](#6-schema-firestore)
7. [Obligations légales](#7-obligations-légales)
8. [Journal des interventions](#8-journal-des-interventions)
9. [Todo & Prochaines étapes](#9-todo--prochaines-étapes)

---

## 1. Contexte & Stratégie

### Pourquoi l'affiliation

La publicité display (AdSense etc.) rapporte ~0.01€/visite avec un faible trafic. L'affiliation sur des produits à 30-80€ avec 5-8% de commission peut générer 2-6€ par vente. 10 ventes/mois = revenu immédiatement supérieur à la pub.

### Concept

Créer une section "L'Atelier" au sein de la marketplace : une boutique curatée de produits d'entretien et de rénovation de meubles (cires, patines, peintures, résines, outils...) avec des liens affiliés vers Amazon, ManoMano, Leroy Merlin.

L'audience de Tous à Table (acheteurs de meubles restaurés) est le coeur de cible naturel pour ces produits.

### Projection revenus

| Scénario | Visiteurs boutique/mois | Taux clic | Taux conversion | Panier moyen | Commission | Revenu/mois |
|----------|------------------------|-----------|-----------------|-------------|------------|-------------|
| Pessimiste | 200 | 15% | 3% | 35€ | 6% | ~19€ |
| Réaliste | 500 | 20% | 5% | 45€ | 6% | ~135€ |
| Optimiste | 1500 | 25% | 7% | 55€ | 7% | ~1010€ |

---

## 2. Programmes d'affiliation

### Priorité 1 — À ouvrir en premier

| Programme | Commission | Durée cookie | Inscription |
|-----------|-----------|--------------|-------------|
| **Amazon Partenaires** | 1-8% (meubles: 8%) | 24h | partenaires.amazon.fr |
| **ManoMano** (via Awin) | 2.5-7% | 30 jours | awin.com puis chercher ManoMano |
| **Leroy Merlin** (via Awin) | 5-10% | 30 jours | awin.com puis chercher Leroy Merlin |

### Priorité 2 — Complémentaires

| Programme | Commission | Réseau |
|-----------|-----------|--------|
| Rakuten France | Jusqu'à 9% | Direct (fr.shopping.rakuten.com) |
| Castorama | 3-7% | Awin |
| Cdiscount | 4-8% | Awin |

### Marques directes à prospecter

- **Liberon** — référence patines/cires bois
- **V33** — peintures rénovation meuble
- **Annie Sloan** (Chalk Paint) — cult following
- **Rubio Monocoat** — huiles dures premium
- **Syntilor** — lasures/vernis/décapants

### Démarche d'inscription Amazon

1. Aller sur partenaires.amazon.fr
2. Créer un compte avec l'adresse email du site
3. Renseigner l'URL du site (tousatable-madeinnormandie.fr)
4. Obtenir son tag d'affiliation (ex: `tousatable-21`)
5. Intégrer le tag dans les liens : `https://www.amazon.fr/dp/BXXXXXXXXX?tag=tousatable-21`

> **Important Amazon** : générer au moins 3 ventes dans les 180 jours suivant l'inscription, sinon le compte est suspendu.

---

## 3. Architecture technique

### Vue d'ensemble

```
App.jsx
  └── onSnapshot("affiliate_products") → affiliateProducts[]
  └── view = 'shop' (deep link #shop ou ?page=shop)
  └── <AppRouter affiliateProducts={affiliateProducts} />

Router.jsx
  ├── Admin tab "Boutique" → <AdminShop />
  └── view='shop' → <ShopView /> [à créer Phase 2]

GlobalMenu.jsx
  └── Item "L'Atelier" [à ajouter Phase 2]
```

### Collections Firestore

```
artifacts/tat-made-in-normandie/public/data/
  └── affiliate_products/{productId}   ← produits de la boutique

affiliate_clicks/{clickId}             ← tracking des clics (top-level)
```

### Flux utilisateur

```
Visiteur → Page "L'Atelier" → Clic "Voir l'offre"
  → addDoc(affiliate_clicks)          ← tracking interne
  → increment(product.clickCount)     ← compteur sur le produit
  → window.open(affiliateUrl, '_blank') ← redirection partenaire
  → Achat sur Amazon/ManoMano/...
  → Commission versée par le programme
```

---

## 4. Fichiers créés

### `src/features/admin/AdminShop.jsx`

Panel d'administration complet pour gérer les produits affiliés.

**Fonctionnalités :**
- KPIs en haut : total produits, publiés, clics totaux, top produit
- Formulaire ajout/modification avec tous les champs
- Tableau filtrable (par catégorie, par gamme)
- Actions par produit : publier/masquer, mettre en avant (étoile), modifier, supprimer, ouvrir le lien
- Bannière rappel légal affiliation

**Champs du formulaire :**

| Champ | Type | Description |
|-------|------|-------------|
| `name` | string | Nom du produit |
| `brand` | string | Marque (Liberon, V33...) |
| `description` | textarea | Description courte |
| `category` | select | patines_cires / peintures / huiles / resines / preparation / outils |
| `tier` | select | essentiel / premium / expert |
| `price` | number | Prix indicatif en € (affiché, aucun paiement sur le site) |
| `affiliateUrl` | string | Lien affilié complet avec tag |
| `affiliateProgram` | select | amazon / manomano / leroymerlin / rakuten / castorama / direct |
| `imageUrl` | string | URL de l'image produit |
| `whyWeRecommend` | textarea | Texte éditorial court |
| `proTip` | textarea | Conseil pro pour l'utilisation |
| `featured` | toggle | Mis en avant sur la home |
| `status` | toggle | published / draft |

---

## 5. Fichiers modifiés

### `firestore.rules`

**Ajouts :**

```javascript
// Validation schema produit affilié
function isValidAffiliateProduct() { ... }

// Règle collection affiliate_products (path spécifique, écrase la règle générique)
match /artifacts/tat-made-in-normandie/public/data/affiliate_products/{productId} {
  allow read: if true;
  allow create, update: if isArtisan() && isValidAffiliateProduct();
  allow delete: if isArtisan();
}

// Tracking clics
match /affiliate_clicks/{clickId} {
  allow create: if request.auth != null && [validation schema];
  allow read: if isArtisan();
}
```

**Validation schema affiliate_clicks :** champs autorisés uniquement `productId`, `productName`, `affiliateProgram`, `category`, `tier`, `timestamp`, `sessionId`, `referrer`. Aucune donnée personnelle (RGPD).

---

### `src/Router.jsx`

**Ajouts :**
- Import `ShoppingBag` de lucide-react
- `const AdminShop = React.lazy(() => import('./features/admin/AdminShop'))`
- Onglet admin `{ id: 'shop', label: 'Boutique', icon: ShoppingBag }` dans `adminTabs[]`
- Case `adminCollection === 'shop'` dans le rendu Suspense

---

### `src/App.jsx`

**Ajouts :**
- State : `const [affiliateProducts, setAffiliateProducts] = useState([])`
- Deep link : `'shop'` ajouté dans les hash valides + support `?page=shop`
- Listener onSnapshot sur `affiliate_products` (filtre `status === 'published'`)
- Prop `affiliateProducts={affiliateProducts}` passée à `<AppRouter />`
- `'shop'` ajouté dans les vues qui affichent le footer

---

## 6. Schema Firestore

### Collection `affiliate_products`

```javascript
{
  // Identité
  id: "auto-generated",
  name: "Cire d'Abeille Pure - Liberon 375ml",
  brand: "Liberon",
  description: "Nourrit et protège tous les bois...",

  // Classification
  category: "patines_cires",   // patines_cires | peintures | huiles | resines | preparation | outils
  tier: "premium",             // essentiel | premium | expert
  tags: ["bois", "cire", "naturel"],

  // Prix & Lien
  price: 24.90,                // Indicatif uniquement, aucun paiement sur le site
  affiliateUrl: "https://www.amazon.fr/dp/B00XXXXX?tag=tousatable-21",
  affiliateProgram: "amazon",  // amazon | manomano | leroymerlin | rakuten | castorama | direct

  // Visuels
  imageUrl: "https://...",

  // Contenu éditorial
  whyWeRecommend: "Un classique de la rénovation...",
  proTip: "Appliquer en couches fines avec un chiffon doux",

  // Metadata
  status: "published",         // published | draft
  featured: false,             // Mis en avant home/boutique

  // Stats (mis à jour côté client au clic)
  clickCount: 0,

  // Timestamps
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Collection `affiliate_clicks`

```javascript
{
  productId: "xxx",
  productName: "Cire d'Abeille Pure",
  affiliateProgram: "amazon",
  category: "patines_cires",
  tier: "premium",
  timestamp: serverTimestamp(),
  sessionId: "analytics_session_id",  // Lié aux analytics existants
  referrer: "shop"                     // shop | home_featured | product_detail
}
```

---

## 7. Obligations légales

### Ce qui est obligatoire (Loi française juin 2023)

1. **Mention visible dès le premier regard** sur chaque lien affilié
   - Texte requis : "lien partenaire" ou "lien affilié"
   - Pas suffisant : #pub, #ad, #sponsored seuls

2. **Bandeau d'information** sur la page boutique
   - Exemple : *"Cette page contient des liens d'affiliation. Lorsque vous achetez via ces liens, nous recevons une commission sans surcoût pour vous."*

3. **Mentions légales** à mettre à jour
   - Déclarer l'activité d'affiliation
   - Lister les programmes partenaires
   - Préciser que les prix sont indicatifs

4. **RGPD** : les `affiliate_clicks` ne stockent aucune donnée personnelle (pas d'email, pas d'IP, juste le sessionId anonyme et les infos produit)

### Sanctions en cas de non-conformité

- Jusqu'à **2 ans d'emprisonnement**
- Jusqu'à **300 000€ d'amende**
- Contrôlé par la DGCCRF

### Implémentation dans le code

```jsx
// Bandeau permanent sur la page boutique (à faire en Phase 2)
<div className="text-xs text-stone-400 text-center py-4 border-t">
  Page contenant des liens d'affiliation —
  <a href="/mentions-legales#affiliation">En savoir plus</a>
</div>

// Sur chaque carte produit (à faire en Phase 2)
<span className="text-[9px] text-stone-400">Lien partenaire</span>

// Attribut HTML obligatoire sur chaque lien affilié
<a href={affiliateUrl} rel="noopener noreferrer sponsored" target="_blank">
```

---

## 8. Journal des interventions

### 29 mars 2026 — Phase 1 : Fondations (implémentée)

**Objectif :** Mettre en place la couche admin pour pouvoir commencer à saisir des produits dès que les comptes affiliés sont ouverts.

**Réalisé :**

| Fichier | Action | Détail |
|---------|--------|--------|
| `firestore.rules` | Modifié | Ajout règles `affiliate_products` + `affiliate_clicks` + fonction `isValidAffiliateProduct()` |
| `src/features/admin/AdminShop.jsx` | Créé | Panel admin complet (CRUD, KPIs, filtres, liste) |
| `src/Router.jsx` | Modifié | Lazy import + onglet "Boutique" dans adminTabs + case rendu |
| `src/App.jsx` | Modifié | State affiliateProducts + listener onSnapshot + deep link + footer |

**Déploiement nécessaire :**
```bash
firebase deploy --only firestore:rules
npm run build && firebase deploy --only hosting
```

---

## 9. Todo & Prochaines étapes

### Côté propriétaire (hors dev)
- [ ] Ouvrir un compte Amazon Partenaires (partenaires.amazon.fr)
- [ ] Ouvrir un compte Awin (pour ManoMano + Leroy Merlin)
- [ ] Sélectionner 15-20 premiers produits avec leurs liens affiliés
- [ ] Récupérer les images produits autorisées
- [ ] Mettre à jour les Mentions Légales du site (section affiliation)

### Phase 2 — Page boutique client (à coder)

- [ ] `src/pages/ShopView.jsx` — page boutique complète avec filtres
- [ ] `src/components/shop/ShopProductCard.jsx` — carte produit avec tracking clic
- [ ] Ajouter "L'Atelier" dans `GlobalMenu.jsx`
- [ ] Ajouter le case `view === 'shop'` dans `Router.jsx`

### Phase 3 — Intégration Home (à coder)

- [ ] Section "Nos Essentiels" dans `HomeView.jsx` (3-4 produits `featured: true`)
- [ ] Meta tags SEO pour la page boutique (`react-helmet-async`)
- [ ] Bandeau mention légale affiliation visible

### Phase 4 — Stats admin (à coder)

- [ ] Graphique clics/jour dans AdminShop (pattern SVG de AdminAnalytics)
- [ ] Top 10 produits par clics
- [ ] Répartition par programme d'affiliation

---

---

## 10. Plan de design ShopView.jsx — Brief pour Gemini

> Ce brief est destiné à concevoir `src/pages/ShopView.jsx` et son composant enfant `src/components/shop/ShopProductCard.jsx`.
> Le code doit s'intégrer parfaitement dans l'architecture et le design system existants.

---

### Contexte projet à donner à Gemini

**Stack :** React 18, Tailwind CSS v4, Framer Motion 12, Lucide React, Firebase Firestore
**Design system :** Palette Tailwind `stone`, typographie `Cormorant Garamond` (serif, headings) + `Plus Jakarta Sans` (sans, corps), accents `amber-500/600`
**Dark mode :** prop booléenne `darkMode` passée à chaque composant (pas de hook CSS classes)
**Animations :** CSS transitions sur le compositor thread (GPU). Framer Motion uniquement pour hover par lettres. Pattern établi dans le projet.
**Responsive :** Mobile-first. Breakpoints : `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px

---

### 10.1 Interface Props — `ShopView.jsx`

```jsx
const ShopView = ({
  affiliateProducts,   // Product[] — déjà filtrés status='published', vient de App.jsx
  darkMode,            // boolean
  onOpenMenu,          // () => void — ouvre le GlobalMenu
  onOpenCart,          // () => void — ouvre le CartSidebar
  toggleTheme,         // () => void — bascule dark/light
  setHeaderProps,      // (props) => void — configure le header partagé ArchitecturalHeader
}) => {}
```

**Aucune requête Firestore dans ShopView.** Les données arrivent déjà via props depuis App.jsx.

---

### 10.2 State interne

```jsx
const [activeCategory, setActiveCategory] = useState('all')
// 'all' | 'patines_cires' | 'peintures' | 'huiles' | 'resines' | 'preparation' | 'outils'

const [activeTier, setActiveTier] = useState('all')
// 'all' | 'essentiel' | 'premium' | 'expert'

const [sortBy, setSortBy] = useState('featured')
// 'featured' | 'price_asc' | 'price_desc' | 'popular'
```

---

### 10.3 Logique de filtrage — `useMemo`

```jsx
const filteredProducts = useMemo(() => {
  let result = [...affiliateProducts]

  // Filtre catégorie
  if (activeCategory !== 'all') {
    result = result.filter(p => p.category === activeCategory)
  }

  // Filtre gamme
  if (activeTier !== 'all') {
    result = result.filter(p => p.tier === activeTier)
  }

  // Tri
  if (sortBy === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0))
  if (sortBy === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0))
  if (sortBy === 'popular') result.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
  if (sortBy === 'featured') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))

  return result
}, [affiliateProducts, activeCategory, activeTier, sortBy])
```

---

### 10.4 Header sync — `useEffect`

Au montage, configurer le header partagé (pattern identique à GalleryView) :

```jsx
useEffect(() => {
  setHeaderProps({
    title: "L'Atelier",
    hideCollectionFilter: true,    // Pas de filtre Mobilier/Planches
    hideAuctionFilter: true,       // Pas de filtre enchères
  })
  return () => setHeaderProps(null) // Reset au démontage
}, [setHeaderProps])
```

---

### 10.5 Logique clic affilié — dans `ShopProductCard.jsx`

```jsx
import { addDoc, collection, updateDoc, doc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'

const handleAffiliateClick = async (product) => {
  // 1. Ouvrir le lien immédiatement (ne pas bloquer sur l'async)
  window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')

  // 2. Tracker le clic en arrière-plan (fire & forget)
  try {
    const colRef = collection(db, 'affiliate_clicks')
    await addDoc(colRef, {
      productId: product.id,
      productName: product.name,
      affiliateProgram: product.affiliateProgram,
      category: product.category,
      tier: product.tier,
      timestamp: serverTimestamp(),
      sessionId: sessionStorage.getItem('analytics_session_id') || null,
      referrer: 'shop',
    })
    // Incrémenter le compteur sur le produit
    await updateDoc(
      doc(db, 'artifacts', 'tat-made-in-normandie', 'public', 'data', 'affiliate_products', product.id),
      { clickCount: increment(1) }
    )
  } catch (e) {
    // Silencieux — ne pas bloquer l'UX pour un tracking raté
  }
}
```

**Important :** `window.open` est appelé **avant** l'async. Les navigateurs bloquent les popups si `window.open` est dans une promesse.

---

### 10.6 Structure HTML de la page

```
<div>                                     ← Racine, min-h-screen
  <SEO ... />                             ← react-helmet-async
  <ArchitecturalHeader ... />             ← Header partagé (déjà dans le layout App)

  [SECTION HERO]
    ← Titre "L'Atelier" en serif massif
    ← Sous-titre éditorial
    ← Compteur produits (ex: "24 produits sélectionnés")

  [SECTION FILTRES]
    ← Onglets catégories (scroll horizontal mobile)
    ← Badges gamme (Essentiel / Premium / Expert)
    ← Select tri (Mis en avant / Prix ↑ / Prix ↓ / Populaires)

  [SECTION GRILLE]
    ← grid responsive (voir specs)
    ← <ShopProductCard /> × N
    ← État vide si filtres trop stricts

  [BANDEAU LÉGAL]
    ← Mention obligatoire affiliation
</div>
```

---

### 10.7 Specs design — Section Hero

**Layout :** `py-24 md:py-32 px-6 md:px-12`

**Titre principal :**
- Font : `font-serif` (Cormorant Garamond)
- Taille : `text-6xl md:text-8xl xl:text-[10rem]`
- Weight : `font-black`
- Letter-spacing : `tracking-tighter`
- Dark : `text-white` / Light : `text-stone-900`

**Étiquette au-dessus du titre :**
- `text-[10px] font-black uppercase tracking-[0.4em]`
- Dark : `text-stone-500` / Light : `text-stone-400`
- Texte : `"Boutique — Affiliation"`

**Sous-titre :**
- Font : `font-sans`
- Taille : `text-base md:text-lg`
- Dark : `text-stone-400` / Light : `text-stone-500`
- Texte : `"Produits sélectionnés pour entretenir, restaurer et sublimer vos meubles."`
- `max-w-xl`

**Compteur produits :**
- `text-[11px] font-black uppercase tracking-widest`
- Dark : `text-stone-600` / Light : `text-stone-400`
- Format : `"${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''}"`

**Layout général :** Flexbox colonne, left-aligned. Pas de centrage.

---

### 10.8 Specs design — Barre de filtres

**Conteneur :** sticky top (après le header à 96px) : `sticky top-24 z-30`
**Fond sticky :** `backdrop-blur-xl bg-white/80 dark:bg-[#0a0a0a]/80`
**Séparateur bas :** `border-b border-stone-200/50 dark:border-white/5`
**Padding :** `px-6 md:px-12 py-4`

**Onglets catégories (scroll horizontal mobile) :**
```
[Tout] [Patines & Cires] [Peintures] [Huiles] [Résines] [Préparation] [Outils]
```
- Container : `flex gap-2 overflow-x-auto scrollbar-none pb-1`
- Pill actif : `bg-stone-900 text-white dark:bg-white dark:text-stone-900`
- Pill inactif : `text-stone-500 hover:text-stone-900 dark:hover:text-white`
- Style commun : `px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors`

**Badges gamme (sur la même ligne ou ligne suivante) :**
```
[Essentiel ○] [Premium ◆] [Expert ■]
```
- Essentiel actif : `bg-stone-200 text-stone-800`
- Premium actif : `bg-amber-100 text-amber-800`
- Expert actif : `bg-stone-900 text-white dark:bg-white dark:text-stone-900`
- Inactif : `border border-current opacity-40 hover:opacity-100`

**Select tri :**
- Aligné à droite sur desktop, pleine largeur sur mobile
- Style : `bg-transparent border border-stone-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider`
- Options : `Mis en avant`, `Prix croissant`, `Prix décroissant`, `Populaires`

---

### 10.9 Specs design — Grille produits

**Grid :**
```
grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8
px-6 md:px-12
```

**État vide (aucun produit après filtre) :**
```jsx
<div className="col-span-full py-24 text-center">
  <p className="text-stone-400 text-sm">Aucun produit dans cette sélection.</p>
  <button onClick={() => { setActiveCategory('all'); setActiveTier('all') }}>
    Réinitialiser les filtres
  </button>
</div>
```

---

### 10.10 Specs design — `ShopProductCard.jsx`

**Props :**
```jsx
const ShopProductCard = ({ product, darkMode }) => {}
```

**Structure de la carte :**

```
<div>                                    ← Wrapper, group, cursor-pointer
  [BLOC IMAGE]
    ← aspect-[4/5] sur mobile, aspect-[3/4] sur desktop
    ← object-cover, scale-110 au hover (transition 800ms ease-out)
    ← Badge gamme en overlay bas-gauche (si tier !== 'essentiel')
    ← Indicateur programme (ex: petit logo/texte "Amazon") en overlay haut-droit

  [BLOC INFO]
    ← Marque (10px, uppercase, stone-400/500)
    ← Nom produit (font-serif, 15px mobile / 17px desktop, leading-tight)
    ← Prix indicatif (12px, font-black, stone-600/400)
    ← whyWeRecommend (11px, stone-500, 2 lignes max, line-clamp-2)

  [CTA]
    ← Bouton "Voir l'offre" avec ExternalLink icon
    ← Au clic → handleAffiliateClick(product)
    ← Mention "Lien partenaire" en 9px sous le bouton
</div>
```

**Badge gamme (overlay) :**
```jsx
// Positionné : absolute bottom-3 left-3
// Essentiel : bg-white/90 text-stone-700
// Premium : bg-amber-400 text-white
// Expert : bg-stone-900/90 text-white backdrop-blur-sm
// Style : px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full
```

**Indicateur programme (overlay) :**
```jsx
// Positionné : absolute top-3 right-3
// bg-white/90 dark:bg-black/70 backdrop-blur-sm
// px-2 py-1 rounded-lg text-[8px] font-black uppercase text-stone-500
// Affiche : "Amazon" | "ManoMano" | "Leroy Merlin" | "Rakuten" | "Direct"
```

**Bouton CTA :**
```jsx
// Dark : bg-white text-stone-900 hover:bg-stone-100
// Light : bg-stone-900 text-white hover:bg-stone-700
// Classes : w-full flex items-center justify-center gap-2
//           py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
//           transition-colors duration-300
// Icon : <ExternalLink size={12} />
```

**Hover global sur la carte :**
- Image : `scale-110` — `transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]`
- Carte : légère élévation `hover:-translate-y-1` — `transition-transform duration-300`
- Pas de Framer Motion — CSS pur uniquement

---

### 10.11 Specs design — Bandeau légal

**Position :** Bas de page, avant le Footer
**Style :**
```
border-t border-stone-200/30 dark:border-white/5
py-6 px-6 md:px-12
flex items-center justify-center gap-2
text-[10px] text-stone-400 dark:text-stone-600
text-center
```
**Icône :** `<Info size={12} />` (Lucide)
**Texte :** `"Cette page contient des liens d'affiliation. En achetant via ces liens, vous soutenez notre atelier sans surcoût pour vous."` + lien vers `/mentions-legales#affiliation`

---

### 10.12 SEO — Balises à inclure

```jsx
<SEO
  title="L'Atelier — Produits d'entretien & rénovation de meubles"
  description="Nos produits sélectionnés pour entretenir et restaurer vos meubles : cires, patines, peintures Chalk Paint, huiles dures, résines époxy. Marques Liberon, V33, Annie Sloan."
  url="/?page=shop"
/>
```

---

### 10.13 Ajouts dans les autres fichiers (Phase 2)

#### `Router.jsx` — Ajouter le case `view === 'shop'`

```jsx
// Lazy import (déjà à faire)
const ShopView = React.lazy(() => import('./pages/ShopView'))

// Dans le rendu main, après my-orders :
{view === 'shop' && (
  <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
    <ShopView
      affiliateProducts={affiliateProducts}
      darkMode={darkMode}
      onOpenMenu={onOpenMenu}
      onOpenCart={onOpenCart}
      toggleTheme={toggleTheme}
      setHeaderProps={setHeaderProps}
    />
  </Suspense>
)}
```

#### `GlobalMenu.jsx` — Ajouter l'item "L'Atelier"

Dans le tableau `menuItems` (dans le `useMemo`), insérer entre "La Galerie" et "Commandes" :

```jsx
{
  label: "L'Atelier",
  action: () => {
    setView('shop')
    window.location.hash = 'shop'
  }
}
```

---

### 10.14 Checklist design pour Gemini

- [ ] Police serif (Cormorant Garamond) sur le titre hero et les noms produits
- [ ] Police sans-serif (Plus Jakarta Sans) sur les labels, badges, boutons
- [ ] dark mode géré par prop `darkMode` boolean (pas de `dark:` classes Tailwind seules)
- [ ] Hover image : `scale-110` CSS transition 800ms `cubic-bezier(0.23,1,0.32,1)` (pattern existant dans ProductCard.jsx)
- [ ] Animations d'ouverture de page : `animate-in fade-in duration-500` (Tailwind, pattern existant)
- [ ] Sticky filter bar avec `backdrop-blur-xl`
- [ ] Scroll horizontal natif sur les onglets mobile (`overflow-x-auto scrollbar-none`)
- [ ] `window.open` appelé AVANT l'async du tracking
- [ ] Attribut `rel="noopener noreferrer sponsored"` sur le lien affilié
- [ ] Bandeau légal obligatoire en bas de page
- [ ] État vide avec reset des filtres
- [ ] `useMemo` pour le filtrage (performance)
- [ ] Pas de nouvelles dépendances npm

*Document maintenu par Claude — projet Tous à Table Made in Normandie*

---

## 11. 29 mars 2026 — Implementation reelle (Shop en production UI)

Objectif execute : remplacer l'entree Encheres par la boutique Shop cote navigation utilisateur, et livrer une vraie page client L'Atelier exploitable avec tracking d'affiliation.

### 11.1 Fichiers crees

#### `src/pages/ShopView.jsx`

Page client complete L'Atelier.

Implante :
- Hero editorial (titre massif, sous-titre, compteur produits)
- Barre sticky de filtres (categorie, tier, tri)
- Filtrage + tri via `useMemo`
- Grille responsive produits
- Etat vide avec reset filtres
- SEO dedie `/ ?page=shop`
- Bandeau legal affiliation en bas de page

#### `src/components/shop/ShopProductCard.jsx`

Carte produit shop avec logique affiliation.

Implante :
- Image + overlays (tier + programme)
- Bloc info (marque, nom, prix, reco)
- CTA `Voir l'offre`
- `window.open(...)` appele avant l'async (anti popup blocker)
- Tracking clic via `addDoc('affiliate_clicks')`
- Increment `clickCount` via `updateDoc(... increment(1))`
- Lien avec `rel="noopener noreferrer sponsored"`

### 11.2 Fichiers modifies

#### `src/Router.jsx`

- Ajout lazy import `ShopView`
- Ajout rendu `view === 'shop'`
- Passage de `affiliateProducts` a `ShopView`
- Suppression de l'onglet admin `auctions`
- Onglet admin `shop` conserve comme entree boutique principale
- Ajout d'un callback `onOpenShop` passe a `GalleryView` pour ouvrir le shop depuis la barre centrale galerie

#### `src/App.jsx`

- Routing URL/hash shop renforce :
  - support `?page=shop`
  - support `#shop`
  - `hashchange` inclut `shop`

#### `src/components/layout/GlobalMenu.jsx`

- Ajout entree `L'Atelier` dans le menu global
- Navigation directe vers `setView('shop')`

#### `src/pages/GalleryView.jsx`

- Ajout prop `onOpenShop`
- Passage de `onOpenShop` dans `headerProps` (consomme par header/layout architectural)
- Ajustement texte SEO galerie (retrait mention Encheres)

#### `src/designs/architectural/components/ArchitecturalHeader.jsx`

- Suppression du bouton Encheres desktop (barre centrale)
- Ajout bouton `L'Atelier` (desktop) avec style coherent
- Le clic ouvre la page shop via `headerProps.onOpenShop`

#### `src/designs/architectural/MarketplaceLayout.jsx`

- Suppression du bouton Encheres mobile de la galerie
- Ajout bouton mobile `L'Atelier` (zone hero/filtres mobile)
- Le clic ouvre la page shop via `onOpenShop`

### 11.3 Etat fonctionnel obtenu

- La page shop existe et s'affiche avec les donnees Firestore `affiliate_products` publiees.
- Le remplacement visuel est effectif :
  - desktop galerie : barre centrale = Mobilier / Planches / L'Atelier
  - mobile galerie : boutons hero = Mobilier / Planches / L'Atelier
- L'entree menu global L'Atelier ouvre la page shop.
- L'onglet admin Encheres n'est plus expose dans la navigation admin.

### 11.4 Verification technique

- Verification erreurs editeur sur les fichiers modifies : OK (aucune erreur).
- Build Vite : compilation complete reussie (assets generes, chunk ShopView genere).
- Incident terminal Windows apres build : assertion Node/UV (`UV_HANDLE_CLOSING`) apparue apres la fin de compilation. Ce crash semble environnement terminal, pas un echec de compilation applicative.

### 11.5 Point important pour la suite (Claude)

- La logique interne `filter: 'auction' | 'fixed'` existe encore dans `GalleryView` pour ne pas casser le comportement data historique, mais l'UI Encheres n'est plus exposee a l'utilisateur.
- Si objectif futur = suppression totale du mode enchere, il faudra faire une phase dediee de decommission (UI + routing + logique metier + composants detail/timer + admin).


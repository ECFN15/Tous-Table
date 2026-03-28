# Documentation Boutique Affiliation — L'Atelier

> Suivi technique de l'implémentation de la boutique d'affiliation au sein de Tous à Table.
> Dernière mise à jour : 29 mars 2026

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

*Document maintenu par Claude — projet Tous à Table Made in Normandie*

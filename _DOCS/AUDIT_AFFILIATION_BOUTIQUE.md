# AUDIT COMPLET : Boutique Affiliation "L'Atelier" — Tous a Table

> **Date** : 29 mars 2026
> **Objectif** : Integrer une boutique de produits d'entretien/renovation de meubles en affiliation au sein de la marketplace existante.
> **Statut** : Phase d'audit et roadmap

---

## TABLE DES MATIERES

1. [Analyse Strategique](#1-analyse-strategique)
2. [Modele Economique & Programmes d'Affiliation](#2-modele-economique)
3. [Catalogue Produits Recommande](#3-catalogue-produits)
4. [Architecture Technique](#4-architecture-technique)
5. [Schema de Donnees Firestore](#5-schema-firestore)
6. [Design & UX](#6-design-ux)
7. [Obligations Legales (France)](#7-obligations-legales)
8. [Roadmap d'Implementation](#8-roadmap)
9. [KPIs & Metriques](#9-kpis)
10. [Risques & Mitigations](#10-risques)

---

## 1. ANALYSE STRATEGIQUE

### Pourquoi l'affiliation plutot que la publicite ?

| Critere | Publicite (banniere/AdSense) | Affiliation (boutique) |
|---------|------------------------------|------------------------|
| Revenu avec faible trafic | ~0.50-2EUR/jour (CPM ~2EUR) | 5-15% par vente (panier moyen ~30-80EUR) |
| Experience utilisateur | Degradee (pubs intrusives) | Amelioree (valeur ajoutee) |
| Coherence marque | Faible (pubs hors contexte) | Forte (produits curates) |
| Monetisation/visite | ~0.01EUR/visite | ~0.50-3EUR/clic converti |
| Scalabilite | Lineaire au trafic | Lineaire au trafic + panier moyen |

**Verdict** : Avec un trafic estime modeste (~500-2000 visiteurs/mois), la pub display rapporterait 15-60EUR/mois max. L'affiliation sur des produits a 30-80EUR avec 5-8% de commission peut generer 2-6EUR par vente. 10 ventes/mois = 20-60EUR minimum, avec un potentiel de croissance bien superieur si le catalogue est bon.

### Fit avec le positionnement "Tous a Table"

L'audience actuelle (acheteurs de meubles restaures Made in Normandie) est **exactement** le coeur de cible pour :
- Produits d'entretien du bois (cires, huiles, patines)
- Peintures de renovation (Chalk Paint, resines)
- Outils de restauration
- Accessoires de protection/finition

C'est une extension naturelle du parcours client : "J'achete un meuble restaure -> je veux l'entretenir / restaurer moi-meme d'autres pieces".

---

## 2. MODELE ECONOMIQUE & PROGRAMMES D'AFFILIATION

### Programmes recommandes (par ordre de priorite)

#### Tier 1 — Obligatoires

| Programme | Commission | Cookie | Avantages | Inscription |
|-----------|-----------|--------|-----------|-------------|
| **Amazon Partenaires** | 1-8% (meubles: 8%) | 24h | Catalogue illimite, confiance client, conversion elevee | partenaires.amazon.fr |
| **ManoMano** (via Awin) | 2.5-7% | 30j | Specialiste bricolage, gros catalogue pro | Via Awin.com |
| **Leroy Merlin** | 5-10% | 30j | Marque de confiance, gamme complete | Via Awin ou Affilae |

#### Tier 2 — Complementaires

| Programme | Commission | Cookie | Avantages |
|-----------|-----------|--------|-----------|
| **Rakuten France** | Jusqu'a 9% | 30j | Bons prix, catalogue varie |
| **Cdiscount** | 4-8% | 30j | Forte notoriete France |
| **Castorama** (via Awin) | 3-7% | 30j | Gamme bricolage premium |

#### Tier 3 — Marques directes (a prospecter)

| Marque | Specialite | Potentiel |
|--------|-----------|-----------|
| **Liberon** | Patines, cires, teintes bois | Tres fort (reference renovation) |
| **V33** | Peintures renovation meuble | Fort |
| **Annie Sloan** (Chalk Paint) | Peinture craie premium | Tres fort (cult following) |
| **Rubio Monocoat** | Huiles dures premium | Fort (segment premium) |
| **Syntilor** | Lasures, vernis, decapants | Moyen-fort |

### Strategie multi-programme

Un meme produit peut etre reference sur plusieurs programmes. L'admin choisit le lien le plus avantageux :
- **Cookie 24h** (Amazon) : ideal pour les produits "achat impulsif" < 30EUR
- **Cookie 30j** (ManoMano, Leroy Merlin) : ideal pour les produits > 50EUR (l'utilisateur reflechit avant d'acheter)

### Projection revenus

| Scenario | Visiteurs boutique/mois | Taux clic | Taux conversion | Panier moyen | Commission moy. | Revenu/mois |
|----------|------------------------|-----------|-----------------|-------------|-----------------|-------------|
| Pessimiste | 200 | 15% | 3% | 35EUR | 6% | ~19EUR |
| Realiste | 500 | 20% | 5% | 45EUR | 6% | ~135EUR |
| Optimiste | 1500 | 25% | 7% | 55EUR | 7% | ~1010EUR |

---

## 3. CATALOGUE PRODUITS RECOMMANDE

### Organisation par categories

```
L'Atelier (boutique affiliation)
|
+-- Patines & Cires
|   +-- Cire d'abeille naturelle (Liberon, Starwax)
|   +-- Patine a l'ancienne (Liberon)
|   +-- Cire antiquaire (Liberon, Syntilor)
|   +-- Baume restaurateur bois
|
+-- Peintures & Finitions
|   +-- Peinture craie / Chalk Paint (Annie Sloan, Rust-Oleum)
|   +-- Peinture renovation meuble (V33, Syntilor)
|   +-- Vernis mat/satine/brillant
|   +-- Laque renovation
|
+-- Huiles & Protection
|   +-- Huile dure (Rubio Monocoat, Liberon)
|   +-- Huile de lin
|   +-- Huile danoise
|   +-- Saturateur bois
|
+-- Resines & Effets
|   +-- Resine epoxy transparente (tables riviere)
|   +-- Resine de coulage
|   +-- Pigments et colorants
|   +-- Feuilles d'or / dorure
|
+-- Preparation & Decapage
|   +-- Decapant bois (V33, Syntilor)
|   +-- Ponceuse orbitale
|   +-- Papier abrasif (grains varies)
|   +-- Mastic a bois
|
+-- Outils & Accessoires
|   +-- Pinceaux (rechampir, plat, spalter)
|   +-- Rouleaux mousse laqueur
|   +-- Chiffons de polissage
|   +-- Ruban de masquage pro
```

### Gammes de prix (3 tiers)

| Gamme | Prix cible | Exemple | Marge affiliation |
|-------|-----------|---------|-------------------|
| **Essentiel** | 5-20EUR | Cire Starwax 375ml, abrasif lot, pinceaux basiques | 0.30-1.60EUR |
| **Premium** | 20-60EUR | Chalk Paint Annie Sloan 1L, Huile Rubio 350ml, Ponceuse | 1.20-4.80EUR |
| **Expert** | 60-200EUR | Kit resine epoxy 2kg, Ponceuse Festool, Coffret Liberon complet | 3.60-16EUR |

---

## 4. ARCHITECTURE TECHNIQUE

### Vue d'ensemble de l'integration

```
ARCHITECTURE ACTUELLE                    AJOUTS AFFILIATION
+-------------------+                   +-------------------------+
| App.jsx           |                   |                         |
|  view = 'home'    |                   |  view = 'shop'  [NEW]   |
|  view = 'gallery' |                   |                         |
|  view = 'detail'  |                   +-------------------------+
|  view = 'checkout'|                           |
|  view = 'admin'   |                   +-------v-----------------+
|  ...              |                   | ShopView.jsx     [NEW]  |
+-------------------+                   |  - Categories            |
        |                               |  - Filtres (gamme, cat)  |
        |                               |  - Grille produits       |
+-------------------+                   +-------------------------+
| Router.jsx        |                           |
|  + case 'shop'    | <-------- [NEW]   +-------v-----------------+
+-------------------+                   | ShopProductCard.jsx [NEW]|
        |                               |  - Image, prix, marque   |
+-------------------+                   |  - Badge gamme            |
| GlobalMenu.jsx    |                   |  - Lien affilie (ext.)  |
|  + "L'Atelier"    | <-------- [NEW]   +-------------------------+
+-------------------+                           |
        |                               +-------v-----------------+
+-------------------+                   | Admin: AdminShop.jsx[NEW]|
| Admin tabs        |                   |  - CRUD produits affilies|
|  + 'shop' tab     | <-------- [NEW]   |  - Stats clics/revenus   |
+-------------------+                   +-------------------------+
```

### Fichiers a creer

| Fichier | Role |
|---------|------|
| `src/pages/ShopView.jsx` | Page principale boutique affiliation |
| `src/components/shop/ShopProductCard.jsx` | Carte produit avec lien affilie |
| `src/components/shop/ShopFilters.jsx` | Filtres par categorie, gamme, marque |
| `src/components/shop/ShopHero.jsx` | Header/hero de la boutique |
| `src/features/admin/AdminShop.jsx` | CRUD admin pour les produits affilies |
| `src/features/admin/AdminShopStats.jsx` | Dashboard stats affiliation |

### Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/App.jsx` | Ajouter state `view = 'shop'`, fetch collection `affiliate_products` |
| `src/Router.jsx` | Ajouter `case 'shop'` + lazy import `ShopView` + admin tab `shop` |
| `src/components/layout/GlobalMenu.jsx` | Ajouter item "L'Atelier" dans le menu |
| `src/designs/architectural/components/ArchitecturalHeader.jsx` | Optionnel: bouton raccourci boutique |
| `firestore.rules` | Regles pour `affiliate_products` et `affiliate_clicks` |

### Pas de backend necessaire

Contrairement au commerce (Stripe, Cloud Functions), l'affiliation n'a besoin d'aucun backend :
- Les produits sont stockes dans Firestore (admin CRUD)
- Les clics sont traces cote client (Firestore increment)
- Les liens affilies redirigent directement vers le site partenaire
- Les commissions sont gerees par le programme partenaire (pas par nous)

---

## 5. SCHEMA DE DONNEES FIRESTORE

### Collection : `artifacts/{appId}/public/data/affiliate_products/{productId}`

```javascript
{
  // Identite
  id: "auto-generated",
  name: "Cire d'Abeille Pure - Liberon",
  brand: "Liberon",
  description: "Cire naturelle pour nourrir et proteger le bois...",

  // Classification
  category: "patines_cires",    // enum: patines_cires | peintures | huiles | resines | preparation | outils
  tier: "premium",              // enum: essentiel | premium | expert
  tags: ["bois", "entretien", "naturel", "cire"],

  // Prix & Lien
  price: 24.90,                 // Prix indicatif (affiche, pas de paiement)
  affiliateUrl: "https://www.amazon.fr/dp/B00XXXXX?tag=tousatable-21",
  affiliateProgram: "amazon",   // enum: amazon | manomano | leroymerlin | rakuten | direct

  // Visuels
  imageUrl: "https://...",      // Image produit (hebergee sur Firebase Storage)
  thumbnailUrl: "https://...",  // Thumbnail optimise

  // Contenu editorial
  whyWeRecommend: "Un classique de la renovation...",  // Court texte editorial
  proTip: "Appliquer en couches fines avec un chiffon doux",  // Conseil pro

  // Metadata
  status: "published",          // published | draft
  featured: false,              // Mis en avant sur la home/boutique
  sortOrder: 0,                 // Tri manuel

  // Stats (incremente cote client)
  clickCount: 0,

  // Timestamps
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Collection : `affiliate_clicks/{clickId}` (Analytics)

```javascript
{
  productId: "xxx",
  productName: "Cire d'Abeille Pure",
  affiliateProgram: "amazon",
  category: "patines_cires",
  tier: "premium",
  timestamp: serverTimestamp(),
  // Pas de donnees personnelles (RGPD) — juste les stats agregees
  sessionId: "analytics_session_id",  // Lien avec analytics existant
  referrer: "shop" | "home_featured" | "product_detail"  // D'ou vient le clic
}
```

### Regles Firestore

```javascript
// affiliate_products — lecture publique, ecriture admin
match /artifacts/{appId}/public/data/affiliate_products/{productId} {
  allow read: if true;
  allow create, update, delete: if isArtisan();
}

// affiliate_clicks — creation par tout utilisateur authentifie, lecture admin
match /affiliate_clicks/{clickId} {
  allow create: if request.auth != null
    && request.resource.data.keys().hasOnly(['productId', 'productName', 'affiliateProgram', 'category', 'tier', 'timestamp', 'sessionId', 'referrer'])
    && request.resource.data.productId is string;
  allow read: if isArtisan();
}
```

---

## 6. DESIGN & UX

### Nom de la section

Propositions classees par pertinence :
1. **"L'Atelier"** — Coherent avec l'univers meuble/artisanat, court, memorable
2. "La Boutique" — Direct, comprehensible
3. "L'Etabli" — Original, reference au meuble d'artisan
4. "Nos Essentiels" — Met en avant la curation

**Recommandation : "L'Atelier"** — renforce le positionnement artisan/savoir-faire.

### Layout de la page boutique

```
+=========================================================+
|                    HEADER (existant)                      |
+=========================================================+
|                                                           |
|  L'ATELIER                                               |
|  Nos produits selectionnes pour entretenir,               |
|  restaurer et sublimer vos meubles.                      |
|                                                           |
|  [Tout] [Patines] [Peintures] [Huiles] [Resines] [Outils]|
|                                                           |
|  Gamme: [Essentiel] [Premium] [Expert]                   |
|                                                           |
+------------------+------------------+--------------------+
|  +-----------+   |  +-----------+   |  +-----------+    |
|  |  IMAGE    |   |  |  IMAGE    |   |  |  IMAGE    |    |
|  |           |   |  |           |   |  |           |    |
|  +-----------+   |  +-----------+   |  +-----------+    |
|  MARQUE          |  MARQUE          |  MARQUE           |
|  Nom produit     |  Nom produit     |  Nom produit      |
|  [PREMIUM]       |  [ESSENTIEL]     |  [EXPERT]         |
|  24,90EUR           |  8,50EUR            |  89,00EUR          |
|  [Voir l'offre ->]  [Voir l'offre ->]  [Voir l'offre ->]|
+------------------+------------------+--------------------+
|                                                           |
|  MENTION LEGALE (bandeau discret)                        |
|  "Cette page contient des liens affilies. En achetant    |
|   via ces liens, vous soutenez notre atelier sans         |
|   surcout pour vous."                                    |
|                                                           |
+=========================================================+
|                    FOOTER (existant)                      |
+=========================================================+
```

### Integration sur la page d'accueil (HomeView)

Ajouter une section "Nos Essentiels" entre les sections existantes :
- 3-4 produits `featured: true` affiches en horizontal scroll
- Bouton "Decouvrir l'Atelier" → navigue vers la boutique
- Design coherent avec les StackedCards existantes (tons chauds)

### Carte produit — Design

```
+---------------------------+
|                           |
|     [IMAGE PRODUIT]       |
|                           |
|  Bandeau gamme si premium |
+---------------------------+
|  LIBERON                  |  <- Marque (10px, uppercase, stone-400)
|  Cire d'Abeille Pure     |  <- Nom (16px, font-serif)
|                           |
|  [PREMIUM]  24,90EUR        |  <- Badge gamme + prix
|                           |
|  "Un classique..."        |  <- whyWeRecommend (truncated)
|                           |
|  [Voir l'offre  ->]      |  <- CTA (lien affilie, target _blank)
|  sur Amazon               |  <- Source (8px, stone-400)
+---------------------------+
```

### Style guide specifique

- **Fond** : Meme design system "architectural" (stone palette, serif headings)
- **Badges gamme** :
  - Essentiel : `bg-stone-200 text-stone-700` (neutre)
  - Premium : `bg-amber-100 text-amber-800` (dore, coherent avec les accents existants)
  - Expert : `bg-stone-900 text-white` (premium dark)
- **CTA "Voir l'offre"** : Bouton avec icone fleche externe (`ExternalLink` de Lucide)
- **Indicateur affilie** : Petit icone ou texte "lien partenaire" sous le CTA

---

## 7. OBLIGATIONS LEGALES (FRANCE)

### Ce qui est obligatoire

1. **Mention de partenariat commercial** (Loi de juin 2023 sur l'influence commerciale)
   - Texte visible **des le premier regard** : "Ce lien est un lien d'affiliation"
   - Ne pas se contenter d'un hashtag #ad ou #pub (insuffisant)
   - Mention en francais, meme langue que le contenu

2. **Transparence sur le modele economique**
   - Bandeau ou mention en haut ou bas de page boutique
   - Exemple : *"Cette page contient des liens d'affiliation. Lorsque vous achetez via ces liens, nous recevons une commission sans surcout pour vous. Cela nous aide a financer notre atelier."*

3. **Mentions legales** (a ajouter aux CGU existantes)
   - Declarer l'activite d'affiliation
   - Lister les programmes partenaires
   - Preciser que les prix sont indicatifs

4. **RGPD**
   - Pas de cookies tiers supplementaires (les liens affilies redirigent vers le site partenaire qui gere ses propres cookies)
   - Les `affiliate_clicks` ne stockent aucune donnee personnelle (juste le sessionId anonyme)

### Sanctions en cas de non-conformite

- Jusqu'a **2 ans d'emprisonnement**
- Jusqu'a **300 000EUR d'amende**
- Controlee par la DGCCRF

### Implementation technique de la conformite

```jsx
// Bandeau permanent sur la page boutique
<div className="text-xs text-stone-400 text-center py-4 border-t border-stone-200/10">
  <span className="inline-flex items-center gap-1">
    <Info size={12} />
    Page contenant des liens d'affiliation —
    <a href="/mentions-legales#affiliation" className="underline">En savoir plus</a>
  </span>
</div>

// Sur chaque carte produit
<span className="text-[9px] text-stone-400">Lien partenaire</span>
```

---

## 8. ROADMAP D'IMPLEMENTATION

### Phase 0 — Preparation (hors dev)
> **Duree estimee** : 1-2 semaines
> **Qui** : Proprietaire du site

- [ ] S'inscrire sur Amazon Partenaires France
- [ ] S'inscrire sur Awin (donne acces a ManoMano + Leroy Merlin + Castorama)
- [ ] Obtenir les tags/IDs d'affiliation
- [ ] Selectionner 15-20 premiers produits avec leurs liens affilies
- [ ] Preparer les images produits (photos propres ou autorisees par les programmes)

### Phase 1 — Fondations (Sonnet 4.6)
> **Complexite** : Moyenne | **Fichiers** : 4 nouveaux + 3 modifies

**Etape 1.1 — Schema Firestore & Regles**
- Creer les regles Firestore pour `affiliate_products` et `affiliate_clicks`
- Tester les regles en local avec l'emulateur

**Etape 1.2 — Admin CRUD**
- Creer `src/features/admin/AdminShop.jsx`
  - Formulaire : nom, marque, categorie, gamme, prix, URL affiliee, image, description, conseil pro
  - Liste des produits avec filtres
  - Toggle published/draft
  - Compteur de clics par produit
- Ajouter l'onglet "Boutique" dans `Router.jsx` (admin tabs)

**Etape 1.3 — Fetch des donnees**
- Ajouter le listener `onSnapshot` pour `affiliate_products` dans `App.jsx`
- Passer les donnees au Router

### Phase 2 — Page Boutique Client (Sonnet 4.6)
> **Complexite** : Moyenne-Haute | **Fichiers** : 4 nouveaux + 2 modifies

**Etape 2.1 — Composants boutique**
- Creer `src/pages/ShopView.jsx` (page principale)
- Creer `src/components/shop/ShopProductCard.jsx`
- Creer `src/components/shop/ShopFilters.jsx`
- Creer `src/components/shop/ShopHero.jsx`

**Etape 2.2 — Routing & Navigation**
- Ajouter `view = 'shop'` dans App.jsx
- Ajouter le case dans Router.jsx avec lazy loading
- Ajouter "L'Atelier" dans GlobalMenu.jsx
- Deep link : `?page=shop` (URL partageable)

**Etape 2.3 — Tracking des clics**
- Au clic sur "Voir l'offre" : `addDoc` dans `affiliate_clicks` + `increment` sur le produit
- `window.open(affiliateUrl, '_blank')` pour ouvrir dans un nouvel onglet
- Lien `rel="noopener noreferrer sponsored"` (SEO + securite)

### Phase 3 — Integration Home + SEO (Sonnet 4.6)
> **Complexite** : Basse | **Fichiers** : 2 modifies

**Etape 3.1 — Section "Nos Essentiels" sur la Home**
- Ajouter une section dans `HomeView.jsx` affichant 3-4 produits `featured: true`
- Scroll horizontal sur mobile, grille sur desktop
- CTA "Decouvrir l'Atelier"

**Etape 3.2 — SEO & Mentions legales**
- Meta tags pour la page boutique (react-helmet-async)
- Bandeau mention affiliation
- Mise a jour des mentions legales/CGU

### Phase 4 — Dashboard Stats Admin (Sonnet 4.6)
> **Complexite** : Basse-Moyenne | **Fichiers** : 1 nouveau + 1 modifie

**Etape 4.1 — Statistiques affiliation**
- Creer `src/features/admin/AdminShopStats.jsx` (ou integrer dans AdminShop)
  - Nombre de clics total / par produit / par categorie
  - Clics par jour (graphique, reutiliser le pattern SVG de AdminAnalytics)
  - Top 5 produits les plus cliques
  - Repartition par programme (Amazon vs ManoMano vs ...)
  - Estimation revenus (clics x taux conversion moyen x commission moyenne)

---

## 9. KPIs & METRIQUES A SUIVRE

### Metriques automatiques (dans l'admin)

| Metrique | Source | Calcul |
|----------|--------|--------|
| Clics totaux | `affiliate_clicks` count | Direct |
| Clics/produit | `affiliate_products.clickCount` | Direct |
| Clics/jour | `affiliate_clicks` group by date | Agregation |
| Taux de clic (CTR) | Clics / Vues page boutique | Analytics sessions |
| Top categories | `affiliate_clicks` group by category | Agregation |
| Programme le plus clique | `affiliate_clicks` group by program | Agregation |

### Metriques manuelles (dashboards partenaires)

| Metrique | Source | Frequence |
|----------|--------|-----------|
| Taux de conversion | Dashboard Amazon/Awin | Hebdomadaire |
| Revenus generes | Dashboard Amazon/Awin | Mensuel |
| Commission moyenne | Calcul : revenus / ventes | Mensuel |
| Revenu / clic | Calcul : revenus / clics totaux | Mensuel |

### Objectifs a 3 mois

- 15+ produits dans le catalogue
- 100+ clics/mois
- 1ere commission recue
- Taux de clic > 10% (visiteurs boutique qui cliquent)

### Objectifs a 6 mois

- 40+ produits (couvrant toutes les categories)
- 500+ clics/mois
- 50-200EUR de commissions/mois
- Au moins 2 programmes actifs (Amazon + 1 autre)

---

## 10. RISQUES & MITIGATIONS

| Risque | Impact | Probabilite | Mitigation |
|--------|--------|-------------|------------|
| Commission trop faible pour justifier l'effort | Moyen | Moyen | Commencer petit (20 produits), valider le ROI avant d'investir plus |
| Amazon resilie le compte partenaire (inactivite) | Faible | Faible | Generer au moins 3 ventes/mois (seuil Amazon) |
| Liens affilies casses (produit retire) | Moyen | Moyen | Check mensuel des liens, page 404 gracieuse sur clic mort |
| Non-conformite legale | Eleve | Faible | Mentions obligatoires integrees des la v1 |
| Degradation UX (trop commercial) | Moyen | Faible | Design editorial/curation, pas "marketplace generique" |
| Images produit non autorisees | Moyen | Moyen | Utiliser les images API Amazon Product Advertising, ou photos maison |

---

## RESUME EXECUTIF

### Ce qu'il faut retenir

1. **L'affiliation est le bon choix** pour le trafic actuel — 10x plus rentable que la pub display
2. **Le fit produit/audience est parfait** — les acheteurs de meubles restaures sont des clients naturels pour les produits d'entretien
3. **Zero risque financier** — pas de stock, pas de livraison, pas de SAV sur ces produits
4. **Implementation legere** — 4 nouveaux fichiers + 3 modifications, pas de backend supplementaire
5. **Conformite legale obligatoire** — mentions d'affiliation visibles, loi de juin 2023
6. **Amazon + Awin** comme duo de depart couvrent 90% du catalogue

### Prochaine action

Quand le proprietaire aura :
1. Les comptes Amazon Partenaires et Awin actifs
2. Une liste de 15-20 produits avec liens affilies
3. Les images produits

-> Lancer la Phase 1 de la roadmap avec Sonnet 4.6.

---

## PROMPT ROADMAP POUR SONNET 4.6

Le prompt ci-dessous est concu pour etre donne a Claude (Sonnet 4.6) dans une nouvelle conversation, avec le contexte du projet. Il couvre les 4 phases en un seul prompt structure.

```
Tu travailles sur le projet "Tous a Table" (React 18 + Firebase + Tailwind).
Ton objectif : implementer une boutique d'affiliation "L'Atelier" pour des produits
d'entretien et renovation de meubles.

Lis d'abord : _DOCS/AUDIT_AFFILIATION_BOUTIQUE.md (l'audit complet)

## PHASE 1 — Fondations

### 1.1 Firestore Rules
Dans `firestore.rules`, ajoute les regles pour :
- `artifacts/{appId}/public/data/affiliate_products/{productId}` : lecture publique, CRUD admin (isArtisan())
- `affiliate_clicks/{clickId}` : creation si auth != null avec validation de schema (productId, productName, affiliateProgram, category, tier, timestamp, sessionId, referrer), lecture admin

### 1.2 Admin CRUD — `src/features/admin/AdminShop.jsx`
Cree le composant d'administration des produits affilies. Inspire-toi du pattern de AdminForm.jsx + AdminItemList.jsx mais dans un seul fichier (formulaire + liste).

Schema produit :
- name (string), brand (string), description (textarea)
- category (select: patines_cires, peintures, huiles, resines, preparation, outils)
- tier (select: essentiel, premium, expert)
- price (number, prix indicatif)
- affiliateUrl (string, lien affilie)
- affiliateProgram (select: amazon, manomano, leroymerlin, rakuten, direct)
- imageUrl (string ou upload Firebase Storage)
- whyWeRecommend (textarea court)
- proTip (textarea court)
- tags (input comma-separated)
- featured (toggle boolean)
- status (published/draft)

Design : meme style dark premium (#161616, white/5) que AdminDashboard.jsx.
Inclus : compteur de clics par produit, filtres par categorie/gamme, tri par clics/date.

### 1.3 Router + App.jsx
- Dans Router.jsx : ajouter un onglet admin { id: 'shop', label: 'Boutique', icon: ShoppingBag }
  et le case correspondant dans le rendu admin
- Dans App.jsx : ajouter un listener onSnapshot pour la collection affiliate_products
  (meme pattern que items/boardItems), passer au Router

## PHASE 2 — Page Boutique Client

### 2.1 ShopView.jsx — `src/pages/ShopView.jsx`
Page principale de la boutique. Structure :
- Hero section : titre "L'Atelier", sous-titre, ambiance editoriale
- Barre de filtres : categories (onglets) + gammes (badges cliquables)
- Grille de produits : 2 cols mobile, 3 cols tablette, 4 cols desktop
- Bandeau legal affiliation en bas
- Design coherent avec GalleryView/MarketplaceLayout (style architectural, stone palette, serif headings)

### 2.2 ShopProductCard.jsx — `src/components/shop/ShopProductCard.jsx`
Carte produit avec :
- Image avec hover scale (comme ProductCard existant)
- Marque en uppercase stone-400
- Nom produit en serif
- Badge gamme (essentiel=stone, premium=amber, expert=dark)
- Prix indicatif
- Court texte "whyWeRecommend" (tronque 2 lignes)
- CTA "Voir l'offre" avec ExternalLink icon
- Mention "Lien partenaire" en 9px
- Au clic : addDoc dans affiliate_clicks + increment clickCount + window.open(url, '_blank')
- Attribut rel="noopener noreferrer sponsored" sur le lien

### 2.3 Navigation
- Dans GlobalMenu.jsx : ajouter "L'Atelier" comme item de menu (entre Marketplace et Commandes)
- Dans App.jsx : ajouter view='shop' et la navigation
- Deep link : supporter ?page=shop dans le hash routing existant

## PHASE 3 — Integration Home + SEO

### 3.1 Section Home
Dans HomeView.jsx, ajouter une section "Nos Essentiels" :
- Affiche 3-4 produits affiliate avec featured=true
- Scroll horizontal mobile, grille desktop
- CTA "Decouvrir l'Atelier" -> view='shop'
- Placer apres les StackedCards, avant le FAQ

### 3.2 SEO
- Ajouter les meta tags pour /shop via react-helmet-async (SEO component existant)
- Bandeau mention affiliation conforme a la loi francaise de juin 2023

## PHASE 4 — Dashboard Stats

Integrer dans AdminShop.jsx (ou composant separe) :
- KPIs : clics totaux, clics aujourd'hui, top produit, programme le plus clique
- Graphique clics/jour (reutiliser le pattern SVG custom de AdminAnalytics/AdminDashboard)
- Tableau top 10 produits par clics
- Repartition par categorie (pie chart ou barres)

## REGLES IMPORTANTES
- Utilise le design system existant (stone palette, Cormorant Garamond serif, Plus Jakarta Sans)
- Dark mode support obligatoire (prop darkMode)
- Responsive obligatoire (mobile-first)
- Code splitting : lazy() pour ShopView dans Router.jsx
- Pas de nouvelle dependance npm
- Patterns GPU existants (will-change, translate3d) pour les animations
- ZERO fake data hardcodee — tout vient de Firestore
```

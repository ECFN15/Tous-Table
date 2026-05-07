# Roadmap SEO refonte 2026 - Tous a Table

Date : 6 mai 2026  
Objectif : transformer le site en vraie architecture ecommerce indexable, sans toucher a la base Firestore prod ni aux meubles deja publies.

## Principe de securite

- Aucune importation sandbox vers prod.
- Aucune migration Firestore prod pour cette refonte SEO.
- Les meubles prod restent lus tels quels.
- Les anciennes fiches sont rangees cote interface par le mapping legacy deja ajoute dans le code.
- Le deploiement final vise le Hosting et, si necessaire, la Function sitemap/shareMeta seulement.

## Reference Google retenue

Les decisions suivent les recommandations Google Search Central :

- URLs ecommerce lisibles et stables, pas de fragments `#` pour du contenu indexable.
- Canonicals coherents avec les URLs du sitemap.
- Sitemap XML valide, echappe, avec uniquement des URLs de prod.
- Donnees structurees JSON-LD utiles : `Product`, `BreadcrumbList`, `LocalBusiness` / `FurnitureStore`.
- Navigation interne crawlable avec liens `<a href>`.
- Pages categorie utiles pour les utilisateurs, pas seulement des filtres vides.

Sources principales :

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites
- https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure
- https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce
- https://developers.google.com/search/docs/appearance/structured-data/product
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

## Phase 0 - Audit et correctifs urgents

Etat : fait.

- Audit SEO exporte dans `_DOCS/SEO_AUDIT_EXPORT_2026.md`.
- Sitemap XML direct corrige : echappement XML, cache court, URLs produit propres dans la Function.
- Verification legacy env vars Functions apres nettoyage : `functionsWithLegacyEnv=0`, `legacyEnvTotal=0`.
- Firebase CLI remis sur l'alias sandbox apres operations prod.

Risque restant : la version Hosting du sitemap doit etre redeployee si le code sitemap change encore.

## Phase 1 - Refonte URL propre

Etat : commence localement, pas encore deploiement Hosting.

Objectif :

- `/` devient l'entree marketplace.
- `/a-propos` conserve la page vitrine / atelier / histoire.
- `/meubles-anciens` devient la collection meubles.
- `/meubles-anciens/buffets`, `/tables-de-ferme`, `/armoires`, `/commodes-chevets`, `/chaises-bancs`, `/autres` deviennent les pages categories.
- `/planches-a-decouper-anciennes` devient la collection planches.
- `/comptoir` remplace `?page=shop`.
- `/produit/slug-id` remplace `?product=id`.

Travail deja fait localement :

- Ajout de `src/utils/seoRoutes.js`.
- Routage initial adapte dans `src/App.jsx`.
- Ancien routage query/hash nettoye.
- `Router.jsx` mappe `about` vers l'ancienne page vitrine.
- `GalleryView.jsx` et `MarketplaceLayout.jsx` synchronisent les categories avec l'URL.
- `ProductCard.jsx` expose des liens produit crawlables.
- `ArchitecturalProductDetail.jsx`, `HomeView.jsx`, `ShopView.jsx` alignent les URLs SEO.
- `GlobalMenu.jsx`, `Footer.jsx`, `MarketplaceDiscovery.jsx`, `ArchitecturalHeader.jsx` pointent vers les nouvelles routes.
- `CheckoutPaymentStep.jsx` et `AuthContext.jsx` ne renvoient plus vers les anciens `?page=...`.
- `functions/src/seo/seoTools.js` genere le sitemap sur les nouvelles URLs.

Gate avant deploy :

- `npm run build` OK.
- Tests preview sur `/`, `/a-propos`, `/meubles-anciens`, categories, `/comptoir`, une fiche produit.
- Controle Search Console apres deploy : inspection URL de la racine, d'une categorie et d'un produit.

## Phase 2 - Contenu SEO categorie

Etat : a faire apres validation route.

Chaque page categorie doit avoir :

- H1 unique et naturel.
- Intro courte orientee achat : meuble ancien restaure, usage, livraison.
- Produits filtrables visibles.
- Canonical propre.
- `BreadcrumbList`.
- Maillage interne vers autres categories.

Exemples de cibles :

- `/meubles-anciens/buffets` : "Buffets anciens restaures".
- `/meubles-anciens/tables-de-ferme` : "Tables de ferme anciennes".
- `/meubles-anciens/armoires` : "Armoires anciennes".
- `/meubles-anciens/commodes-chevets` : "Commodes et chevets anciens".
- `/meubles-anciens/chaises-bancs` : "Chaises et bancs anciens".

## Phase 3 - SEO local, national et frontalier

Etat : a faire en contenu dedie, pas en simple bourrage de mots-cles.

Pages recommandees :

- `/livraison-meubles-anciens-caen-ifs`
- `/livraison-meubles-anciens-normandie`
- `/livraison-meubles-anciens-france`
- `/livraison-meubles-anciens-belgique-suisse-luxembourg`

Positionnement :

- Local : Ifs, Caen, agglomeration caennaise, rayon environ 20 km.
- National : transporteur partout en France.
- Frontalier : livraison possible vers Belgique, Suisse, Luxembourg, selon devis transporteur.

Important : ces pages ne doivent etre indexees que quand elles contiennent du vrai texte utile, pas avant.

## Phase 4 - Donnees structurees

Etat : partiel.

A renforcer :

- `Product` sur fiche produit : URL canonique propre, prix, devise, disponibilite, image, description.
- `BreadcrumbList` sur categorie et fiche.
- `LocalBusiness` / `FurnitureStore` sur `/a-propos` et pages locales.
- Eventuellement `Organization` avec politique de livraison/retour si le contenu existe.

Validation :

- Rich Results Test Google.
- Schema Markup Validator.
- Search Console > Ameliorations.

## Phase 5 - Deploiement et controle

Ordre recommande :

1. Build prod avec le bon environnement.
2. Preview locale des routes propres.
3. Deploy Function sitemap/shareMeta si le sitemap a change.
4. Deploy Hosting.
5. Controle live :
   - `/`
   - `/a-propos`
   - `/meubles-anciens`
   - une categorie
   - une fiche meuble existante
   - `/comptoir`
   - panier/checkout manuel
6. Search Console :
   - soumettre `/sitemap.xml`
   - inspection URL racine, categorie, produit
   - demander indexation des pages clefs

Rollback :

- Hosting rollback via Firebase Hosting release.
- Function rollback uniquement si sitemap/shareMeta pose probleme.
- Aucune rollback data necessaire, car pas d'ecriture Firestore prod.

## Priorite concrete

1. Finaliser et tester les routes propres commencees localement.
2. Deployer sitemap + Hosting quand le build est valide.
3. Ajouter le contenu categorie et les breadcrumbs.
4. Ajouter les pages livraison local/national/frontalier.
5. Mesurer via Search Console sur 2 a 6 semaines.

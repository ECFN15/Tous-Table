# Audit SEO export - Tous a Table Made in Normandie

Date : 6 mai 2026  
Site audite : https://tousatable-madeinnormandie.fr  
Objectif : renforcer le referencement local Ifs / Caen, national France, et pays frontaliers, en priorisant la vente de meubles anciens restaures.

## Score actuel

Score SEO actuel estime : **54 / 100**.

Score apres correction technique sitemap deja deployee sur la Function directe : **60 / 100**, avec une reserve temporaire car `/sitemap.xml` via Hosting peut encore servir l'ancien cache pendant quelques heures.

Score cible realiste apres refonte technique : **85 / 100+**.

### Detail du score

| Axe | Score | Etat |
|---|---:|---|
| Indexabilite technique | 12 / 20 | `robots.txt` OK, sitemap existe, mais URLs en query params et dependance forte au rendu JS. |
| Structure URL / architecture | 6 / 20 | Trop de `?page=gallery`, `?product=id`, hash navigation; pas de vraies pages categories. |
| Metadata / canonicals | 10 / 15 | Base correcte, mais canonicals dynamiques trop fragiles et URLs produit non descriptives. |
| Structured data | 9 / 15 | `FurnitureStore` et `Product` existent, mais souvent injectes cote React; pas de BreadcrumbList ni pages categories serveur. |
| Contenu local / national | 8 / 15 | Ifs/Caen/France presents dans la meta, mais pas de pages dediees solides. |
| Ecommerce discovery | 5 / 10 | Produits dans sitemap, mais URLs non lisibles; categories non indexables individuellement. |
| Performance / crawl JS | 4 / 5 | Build OK, mais SPA lourde et contenu catalogue charge apres JS/Firestore. |

## Constats actuels

### Points forts

- Domaine HTTPS propre.
- `robots.txt` autorise le crawl et reference le sitemap.
- `sitemap` dynamique liste la racine, la galerie et les produits publies.
- Donnees catalogue accessibles via `publicCatalog` : 28 meubles, 29 planches, 44 produits affiliation, 13 tutoriels.
- Schema `FurnitureStore` present sur la page vitrine.
- Schema `Product` present sur les fiches produit cote React.
- Le site mentionne deja Ifs, Caen, Normandie, France et pays frontaliers.

### Points faibles prioritaires

1. **Architecture URL faible pour un ecommerce**
   - Actuel : `/?page=gallery`, `/?page=shop`, `/?product=<id>`.
   - Google recommande des URLs descriptives, coherentes entre liens internes, sitemap et canonical.
   - Les filtres categories publics ne generent pas de pages indexables.

2. **Navigation trop SPA pour un SEO fort**
   - Beaucoup de navigation se fait via state React, hash, `onClick`.
   - Google peut rendre JavaScript, mais les signaux les plus fiables restent les liens HTML crawlables, canonicals stables, sitemap stable et contenu directement identifiable.

3. **Homepage pas alignee avec l'intention commerciale**
   - Aujourd'hui la racine est une page vitrine immersive.
   - Pour vendre, la meilleure page d'atterrissage est la marketplace / galerie, avec une intro courte orientee "meubles anciens restaures, livraison France".
   - La page vitrine doit devenir une page de confiance : `/a-propos` ou `/atelier`.

4. **Sitemap corrige mais cache Hosting a surveiller**
   - Bug trouve : les `&` des URLs images Firebase etaient non echappes dans XML.
   - Fix deploye dans `functions/src/seo/seoTools.js` avec `escapeXml()`.
   - Function directe valide : 59 URLs, 57 produits, XML parse OK.
   - Cache Function reduit a `public, max-age=300, s-maxage=300`.
   - `/sitemap.xml` via Hosting peut encore servir l'ancien cache temporairement.

5. **Donnees structurees incompletes**
   - Ajouter `BreadcrumbList` sur categories et produits.
   - Renforcer `Product.offers` : prix, devise, disponibilite, URL canonique, et si possible shipping/return policy.
   - Garder `FurnitureStore` / `LocalBusiness` sur `/a-propos`, racine et pages locales.

## Position recommandee sur la homepage

Oui, c'est une bonne idee de faire ouvrir le site directement sur la marketplace.

Mais il ne faut pas juste faire `setView('gallery')` par defaut. La bonne version SEO est :

- `/` = marketplace indexable, avec hero court + produits + categories.
- `/a-propos` = ancienne vitrine / histoire / atelier / savoir-faire.
- `/meubles-anciens` = collection mobilier.
- `/meubles-anciens/buffets`
- `/meubles-anciens/tables-de-ferme`
- `/meubles-anciens/armoires`
- `/meubles-anciens/commodes-chevets`
- `/meubles-anciens/chaises-bancs`
- `/meubles-anciens/autres`
- `/planches-a-decouper-anciennes`
- `/comptoir` = produits entretien bois.
- `/livraison-meubles-anciens-france`
- `/livraison-meubles-anciens-caen-ifs`
- `/atelier-restauration-meubles-normandie`
- `/produit/<slug-produit>-<id>`

L'ancienne page home doit rester accessible depuis le menu lateral sous :

- `A propos`
- `L'atelier`
- `Savoir-faire`

## Mapping SEO cible

| URL cible | Intention | Mot-cle principal | Zone | Indexation |
|---|---|---|---|---|
| `/` | Acheter / voir les meubles disponibles | meubles anciens restaures | France | index |
| `/meubles-anciens` | Collection meubles | meuble ancien restaure | France | index |
| `/meubles-anciens/tables-de-ferme` | Categorie | table de ferme chene | France | index |
| `/meubles-anciens/buffets` | Categorie | buffet ancien chene | France | index |
| `/meubles-anciens/armoires` | Categorie | armoire ancienne restauree | France | index |
| `/meubles-anciens/commodes-chevets` | Categorie | commode ancienne restauree | France | index |
| `/meubles-anciens/chaises-bancs` | Categorie | chaises anciennes restaurees | France | index |
| `/planches-a-decouper-anciennes` | Collection planches | planche a decouper ancienne | France | index |
| `/produit/<slug>-<id>` | Fiche produit | nom produit + meuble ancien | France | index si publie |
| `/comptoir` | Affiliation / conseil entretien | entretien meuble bois massif | France | index |
| `/livraison-meubles-anciens-france` | Livraison nationale | livraison meuble ancien France | France | index |
| `/livraison-meubles-anciens-caen-ifs` | Local | meuble ancien Caen Ifs | Ifs/Caen + 20 km | index |
| `/atelier-restauration-meubles-normandie` | Autorite / savoir-faire | restauration meuble ancien Normandie | Normandie | index |
| `/a-propos` | Confiance / marque | Tous a Table Made in Normandie | Marque | index |
| `/admin`, `/checkout`, `/my-orders`, `/login` | Prive / transactionnel | - | - | noindex |

## Cibles geographiques

### Local fort

Priorite locale :

- Ifs
- Caen
- Fleury-sur-Orne
- Mondeville
- Herouville-Saint-Clair
- Cormelles-le-Royal
- Bretteville-sur-Odon
- Ouistreham
- Bayeux
- Deauville
- Calvados
- Normandie

Angle de contenu :

- Atelier situe a Ifs.
- Retrait / rendez-vous local.
- Livraison locale autour de Caen, environ 20 km.
- Mobilier normand, bois massif, restauration artisanale.

### France

Angle national :

- Livraison par transporteur dans toute la France.
- Emballage soigne, pieces uniques, photos detaillees.
- Tables de ferme, buffets, armoires, commodes, meubles de metier.

### Pays frontaliers

Ne pas creer de pages pays si le site reste uniquement francais et sans process logistique detaille.

Mentionner proprement dans les pages livraison :

- Belgique
- Luxembourg
- Suisse
- Allemagne
- Espagne
- Italie

Si le client veut vraiment attaquer ces pays, creer plus tard des pages dediees seulement si on a contenu utile : delais, transporteurs, conditions, exemples, langues, devis.

## Plan d'action robuste

### Phase 1 - Fondations techniques

1. Remplacer les routes query/hash par des routes propres :
   - `/?page=gallery` -> `/`
   - `/?page=shop` -> `/comptoir`
   - `/?product=id` -> `/produit/slug-id`
2. Garder des redirects 301 depuis les anciennes URLs vers les nouvelles.
3. Mettre les memes URLs partout :
   - liens internes
   - sitemap
   - canonical
   - Open Graph
   - Product schema `offers.url`
4. Tous les liens importants doivent etre des `<a href="...">`, pas seulement des `onClick`.
5. Ajouter `noindex` aux pages privees : admin, checkout, login, my-orders.

### Phase 2 - Sitemap et indexation

1. Generer un sitemap XML valide avec :
   - racine
   - categories
   - pages livraison/locales
   - fiches produit publiees uniquement
   - images produit echappees en XML
2. Ajouter `lastmod` fiable base sur `updatedAt`.
3. Reduire le cache du sitemap pendant la phase de migration.
4. Soumettre dans Google Search Console :
   - `/sitemap.xml`
   - inspection manuelle de `/`
   - inspection de 2 categories
   - inspection de 3 produits
   - inspection de `/livraison-meubles-anciens-france`
   - inspection de `/livraison-meubles-anciens-caen-ifs`

### Phase 3 - Pages categories puissantes

Chaque page categorie doit avoir :

- H1 unique.
- Texte intro court, utile, non bourre de mots cles.
- Liste de produits filtres.
- Liens vers categories soeurs.
- FAQ courte.
- `BreadcrumbList`.
- Title/meta dedies.

Exemple `/meubles-anciens/tables-de-ferme` :

- Title : `Tables de ferme anciennes restaurees en chene | Livraison France`
- H1 : `Tables de ferme anciennes restaurees`
- Angles : chene massif, pieces uniques, livraison France, atelier Ifs/Caen.

### Phase 4 - Fiches produit

Chaque produit doit avoir une URL stable :

`/produit/table-de-ferme-xxl-chene-1wZl7PVhOyTp0TXAWpWj`

Schema `Product` :

- `name`
- `image`
- `description`
- `brand`
- `sku` ou `productID`
- `category`
- `offers.price`
- `offers.priceCurrency = EUR`
- `offers.availability`
- `offers.url`
- optionnel : `itemCondition`, `shippingDetails`, `hasMerchantReturnPolicy`

Important : si un produit est vendu, garder la page indexable pendant un temps si elle apporte de la valeur, mais proposer des produits similaires. Ne pas supprimer brutalement les URLs vendues si elles commencent a ranker.

### Phase 5 - Local SEO

Pages a creer :

1. `/livraison-meubles-anciens-caen-ifs`
   - Ifs, Caen, rayon 20 km.
   - Livraison locale, retrait atelier, rendez-vous.
   - Schema `LocalBusiness`.

2. `/atelier-restauration-meubles-normandie`
   - savoir-faire, photos atelier, restauration.
   - renforce E-E-A-T : experience, preuves, processus.

3. `/livraison-meubles-anciens-france`
   - transporteur, emballage, delais, zones, pays frontaliers.
   - contenu national utile.

### Phase 6 - Mesure

Outils a utiliser :

- Google Search Console :
  - Sitemaps
  - Pages indexees / exclues
  - Inspection URL
  - Performances par requete
  - Rich results
- Rich Results Test Google :
  - page produit
  - page categorie
  - page locale
- PageSpeed Insights :
  - `/`
  - `/meubles-anciens/tables-de-ferme`
  - page produit
- Google Business Profile :
  - verifier nom, adresse, telephone, lien site
  - ajouter photos atelier/meubles
  - publier posts regulierement

## Sources Google utilisees

- SEO Starter Guide : https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Ecommerce SEO : https://developers.google.com/search/docs/specialty/ecommerce
- URL ecommerce : https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites
- Sitemaps : https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Canonicals : https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Product structured data : https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Lazy loading JS : https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading
- LocalBusiness structured data : https://developers.google.com/search/docs/appearance/structured-data/local-business
- Breadcrumb structured data : https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

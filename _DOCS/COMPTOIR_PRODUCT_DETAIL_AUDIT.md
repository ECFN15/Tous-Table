# Audit Comptoir - fiches detail produits affilies

Date : 7 mai 2026  
Perimetre : page publique `/comptoir`, catalogue public `affiliate_products`, tutoriels `shop_tutorials`, tracking client et opportunite de fiches detail avant sortie Amazon.  
Important : audit en lecture seule. Aucune ecriture Firestore prod, aucun deploy.

---

## Avis court

Oui, creer une fiche detail Comptoir avant le renvoi Amazon est une bonne idee.

Le tracking montre deja que les visiteurs cliquent sur Le Comptoir et sur des produits precis. Aujourd'hui, le clic carte ouvre Amazon immediatement via `trackAffiliateClick`. Cela maximise le depart rapide, mais perd une partie de la valeur editoriale de Tous a Table : conseil d'atelier, rassurance, explication du bon usage, prevention des erreurs et securite produit.

La meilleure version n'est pas une page interstitielle automatique. Il faut une vraie fiche utile :

- carte Comptoir -> fiche detail interne ;
- fiche detail -> gros CTA volontaire "Acheter sur Amazon" ;
- mention visible de lien remunere pres du CTA ;
- tracking separe entre `shop_detail_view` et `affiliate_shop_detail` ;
- conservation d'un event clair dans `AdminAnalytics.jsx`.

Une fiche detail est particulierement utile pour les produits techniques : decapant, decireur, sel d'oseille, huile-cire, racloir, masque FFP3, colle, resine epoxy. Ces produits demandent souvent des precautions, un contexte d'usage, ou une correction de libelle avant d'etre presentes proprement.

---

## Sources projet inspectees

- `AGENTS.md`
- `_DOCS/COMMANDS.md`
- `SEOlivre.md`
- `auditdataseo.md`
- `src/App.jsx`
- `src/pages/ShopView.jsx`
- `src/components/shop/ShopProductCard.jsx`
- `src/utils/tracking.js`
- `src/components/shared/AnalyticsProvider.jsx`
- `src/features/admin/AdminAnalytics.jsx`
- `src/utils/seoRoutes.js`
- endpoint public `https://us-central1-tousatable-client.cloudfunctions.net/publicCatalog`

---

## Etat actuel observe

### Catalogue Comptoir

Etat lu le 7 mai 2026 depuis `publicCatalog` :

- 44 produits publies dans `affiliate_products`.
- 13 tutoriels publies dans `shop_tutorials`.
- Les produits sont filtres cote front avec `status === 'published'`.
- Les clics sortants passent par `trackAffiliateClick`.
- `ShopProductCard` ouvre directement `product.affiliateUrl` dans un nouvel onglet.
- Le journey session recoit aujourd'hui `affiliate_shop_grid`, `affiliate_shop_tutorial` ou `affiliate_gallery_detail`.

### Tutoriels

Les tutoriels Firestore utilisent maintenant un champ `productId`, ce qui est mieux que le matching par nom. Mais les donnees actuelles contiennent encore des erreurs :

| Categorie | Tutoriel | ProductId | Produit resolu | Statut |
|---|---|---|---|---|
| accessoires | Choisir le bon pinceau pour vos finitions bois | `FqgzmcqqVU1S13Irrn2W` | Libéron Pinceau Plat 'Le Spalter' 40mm | OK, libelle produit a verifier |
| cires | Effet patine avec la patine Libéron | `q0sdpAOy5LBcrCadFHRv` | Libéron Teinte Antiquaire | OK |
| cires | Cire Black Bison Libéron | `O5uxnoMnD5kew6mkx2Ap` | Libéron Cire Black Bison "Antiquaire" | OK mais doublon catalogue probable |
| cires | Peinture Rust-Oleum Chalky Finish | `CrTsSg5woDt7TFGBUmI0` | Kirschen Coffret 6 Ciseaux Pro | Erreur critique |
| cires | Créer une table rivière en résine époxy | `6pKe1iPGrUJ1v7fDWC6q` | ID introuvable | Erreur critique |
| huiles | Application Rubio Monocoat Oil Plus 2C | `Myj3UKhijTH4lMcOx5Uv` | Rubio Monocoat Oil Plus 2C | OK |
| huiles | Comment appliquer Osmo PolyX Oil | `NdCeO23HWsYTQ012F8St` | Osmo Polyx-Oil 3032 MAT | Produit a renommer/corriger |
| huiles | John Boos Mystery Oil & Board Cream | `HxO6wzN5vJP1pbMuYkKc` | John Boos Mystery Oil | OK |
| outils | Affutage d'un racloir d'ebeniste | `Vg71zBP2nPFFhWu6xTdg` | Bahco 474 Cabinet Scraper | OK |
| outils | Les racloirs : affuter, preparer, utiliser | `KmtEL1eniy4RiLT06q8i` | Kit Premium Kirschen | OK |
| renovation | Decapant bois V33 | vide | Aucun produit | A relier au V33 existant |
| renovation | Decaper efficacement un meuble en bois | vide | Aucun produit | A relier ou remplacer |
| savons | Entretien quotidien surfaces bois huilees | `HMKO41S5LH34YeF5SpeB` | Osmo Wash & Care | OK |

---

## Recommandation tunnel et UX

### Route proposee

Ajouter une route detail dediee, par exemple :

```txt
/comptoir/{slug}-{productId}
```

Ne pas reutiliser `/produit/...`, deja reserve aux meubles/planches.

### Comportement propose

- Sur la grille Comptoir, le CTA principal devient "Voir la fiche" ou "Decouvrir".
- Sur la fiche, le CTA principal devient "Acheter sur Amazon".
- Le lien Amazon reste un vrai clic utilisateur, pas une redirection automatique.
- Un bouton secondaire peut revenir au Comptoir.
- Si le produit apparait dans une fiche meuble, le clic peut ouvrir la fiche Comptoir avec un parametre de contexte interne, par exemple `source=gallery_detail`, sans exposer de tracking sale dans l'URL publique.

### Contenu minimal d'une fiche

Chaque fiche devrait contenir :

- grande image produit ;
- marque, nom corrige, prix indicatif ;
- "A quoi ca sert" ;
- "Pourquoi on l'a mis au Comptoir" ;
- "Comment l'utiliser" ;
- "Astuce atelier" ;
- "A eviter / precautions" ;
- produits ou meubles associes ;
- CTA achat ;
- disclosure affiliation.

### Tracking conseille

Garder les evenements actuels, mais ajouter un niveau d'intention :

```txt
shop_detail_view          // visite d'une fiche Comptoir
affiliate_shop_detail     // clic achat depuis fiche Comptoir
affiliate_shop_grid       // seulement si on garde un achat direct depuis la grille
affiliate_shop_tutorial   // clic achat depuis tutoriel
affiliate_gallery_detail  // clic achat depuis fiche meuble
```

Si une route publique ou un libelle de journey change, verifier `src/features/admin/AdminAnalytics.jsx`.

### SEO

Les fiches Comptoir peuvent aider le SEO longue traine, mais seulement si le contenu est utile et distinct des fiches Amazon.

Points d'attention :

- ne pas copier les textes Amazon ou les avis clients ;
- ne pas afficher de prix dynamique non maitrise comme certitude permanente ;
- utiliser `rel="sponsored noopener noreferrer"` sur les liens sortants ;
- ajouter canonical sur la fiche ;
- eventuellement ajouter un schema `Product` uniquement si les informations visibles correspondent au schema.

Google Merchant Center rappelle que les donnees structurees doivent correspondre aux valeurs affichees au client et, pour certains usages, etre presentes dans le HTML renvoye par le serveur. Le site etant SPA, ne pas surestimer l'effet rich result sans prerender/SSR.

### Affiliation Amazon

Amazon demande une declaration claire pres des liens partenaires et une identification visible comme Partenaire Amazon. Amazon indique aussi que la session eligible commence lorsque le client clique sur le lien special vers Amazon. Une fiche detail interne est donc OK si l'utilisateur clique ensuite volontairement sur le CTA Amazon.

Liens utiles :

- Amazon Partenaires - identification et disclosure : https://partenaires.amazon.fr/help/node/topic/GPXFHVYZMTGPUMPE
- Amazon Partenaires - conditions de participation : https://partenaires.amazon.fr/help/operating/participation
- Amazon Partenaires - politiques programme : https://partenaires.amazon.fr/help/operating/policies/

---

## Corrections donnees prioritaires

### Priorite 1 - corriger les erreurs qui peuvent tromper le client

| Probleme | Impact | Action conseillee |
|---|---|---|
| Tutoriel Rust-Oleum lie au produit Kirschen `CrTsSg5woDt7TFGBUmI0` | Produit affiche sans rapport avec la video | Relier au produit Rust-Oleum `4lywJnKX3TcTML301cZA` |
| Tutoriel resine epoxy lie a `6pKe1iPGrUJ1v7fDWC6q`, ID introuvable | Pas de produit lie | Relier a Resin Pro `5JdaPBeW3nciiFkzZxY7` |
| Tutoriel V33 sans `productId` | Produit existant non exploite | Relier a `0KYju4e5GufRe7B1tkZR` |
| Osmo `3032 MAT` | Le code 3032 correspond a satinee, pas mate | Renommer ou remplacer par la vraie reference mate 3062 |
| Racleur 65mm marque Hazet mais nom BAHCO | Marque incoherente | Verifier EAN/image ; probable Bahco 665 |
| Libéron Metal Poudre brand `Resin Pro` | Marque fausse | Corriger en Libéron |
| John Boos brand `John` | Marque incomplete | Corriger en John Boos |

### Priorite 2 - nettoyer les doublons et libelles

| Probleme | Action conseillee |
|---|---|
| Deux Black Bison Libéron proches | Fusionner, ou separer clairement pate 500ml vs liquide 0,5L |
| `Libéron\`` contient un backtick | Corriger la marque |
| Laine d'acier Libéron `0000` | Verifier : source officielle plutot `N°000` |
| Pinceau `Le Spalter` 40mm | Verifier : source officielle plutot `Pinceau Plat 40mm` |
| Bitume de Judee marque `Les Frères Nordin\`` | Retirer le backtick |

### Priorite 3 - ameliorer la taxonomie

L'interne `category` peut rester simple, mais les fiches detail ont besoin d'un champ editorial plus precis :

```js
{
  productType: 'huile-cire' | 'cire' | 'peinture' | 'teinte' | 'resine' | 'nettoyant-doux' | 'decapant' | 'outil' | 'securite',
  safetyLevel: 'normal' | 'attention' | 'fort',
  detailStatus: 'ready' | 'needs-data-fix' | 'needs-source-check'
}
```

Exemples :

- Les peintures Libéron/Rust-Oleum ne sont pas des cires.
- Resin Pro n'est pas une cire, mais une resine epoxy.
- Blanchon Decapant Degraissant et Libéron Decireur ne sont pas des savons doux.
- Les racloirs d'ebeniste a morfil ne doivent pas etre confondus avec les grattoirs carbure de decapage.

---

## Audit produit par produit

Notation :

- 5/5 : tres bon candidat fiche detail.
- 4/5 : bon candidat, petites corrections possibles.
- 3/5 : utile, mais libelle/SKU/categorie a verifier.
- 2/5 : ne pas publier en fiche forte sans correction.

### Huiles

| Produit actuel | Note | Usage et angle fiche | Points forts / conseils | Sources |
|---|---:|---|---|---|
| Blanchon - Huile cire bois brut 1 litre | 4/5 | Protection decorative de parquets, planchers, boiseries et meubles, rendu bois brut. | Appliquer tres fin, deux couches, lustrer. Attention aux chiffons/pads imbibes : les rincer ou les traiter comme dechets a risque. | [FT Blanchon](https://www.blanchon.com/media/docs-pdf/FT_Huile_Cire_Web_02_19.pdf), [Blanchon](https://www.blanchon.com/professionnels/produits-interieurs/protection-decoration/huiles-cires.html?synt_packing=248) |
| Blanchon - Huile cire chene clair 1 litre | 4/5 | Meme usage, avec nuance chene clair pour rechauffer le bois. | Faire un essai discret : le rendu depend beaucoup de l'essence et du poncage. | [FT Blanchon](https://www.blanchon.com/media/docs-pdf/FT_Huile_Cire_Web_02_19.pdf) |
| Howard Butcher Block Conditioner 355ml | 5/5 | Entretien planches, billots, ustensiles et plans de travail bois. | Huile minerale alimentaire + cire d'abeille + carnauba. Ideal apres une huile de planche. | [Howard](https://www.howardproducts.com/product/butcher-block-conditioner/) |
| John Boos Board Cream 148ml | 5/5 | Creme de finition pour planches, billots et plans de travail bois. | A utiliser apres Mystery Oil pour creer une barriere plus hydrophobe. Corriger la marque en John Boos. | [John Boos](https://www.johnboos.com/products/boos-block-board-cream-for-butcher-blocks-and-cutting-boards?Ounces=5+oz.) |
| John Boos Mystery Oil 473ml | 5/5 | Huile penetrante d'entretien courant pour planches et billots. | Bon produit routine. Laisser penetrer, essuyer l'excedent. Corriger la marque en John Boos. | [John Boos](https://www.johnboos.com/products/mystery-oil-for-butcher-blocks-cutting-boards?Ounces=16+oz.) |
| Osmo Polyx-Oil 3032 MAT incolore 750ml | 2/5 | Produit a corriger avant fiche. | 3032 correspond a incolore satinee ; pour mate, verifier 3062. | [Osmo](https://www.osmo.fr/finitions/finitions-pour-linterieur/finitions-pour-sols/huile-cire-original) |
| Osmo Polyx-Oil 3032 Satinee 750ml | 5/5 | Protection huile-cire incolore satinee pour parquets, escaliers, meubles, OSB, liege. | Deux couches fines sur bois propre et sec. Produit fort pour fiche detail. | [Osmo](https://www.osmo.fr/finitions/finitions-pour-linterieur/finitions-pour-sols/huile-cire-original) |
| Rubio Monocoat Oil Plus 2C Pure 130ml | 5/5 | Huile interieure monocouche pour sols, plans, meubles et escaliers. | Bois brut obligatoire, retirer l'excedent, chiffons a immerger dans l'eau apres usage. | [Rubio Monocoat](https://store.rubiomonocoat.fr/products/huile-plus-2c) |
| Star Brite Teak Oil Premium 950ml | 4/5 | Huile teck/bois durs pour mobilier exterieur et usage marine. | Bon angle "mobilier exterieur". Ne pas presenter comme produit contact alimentaire. | [Star brite](https://shop.starbrite.com/products/star-brite-premium-golden-teak-oil-ideal-for-boats-furniture) |

### Cires, patines, peintures et finitions decoratives

| Produit actuel | Note | Usage et angle fiche | Points forts / conseils | Sources |
|---|---:|---|---|---|
| Bitume de Judee Patine a l'Ancienne 125mL | 4/5 | Patine decorative pour ombrer reliefs, moulures, sculptures et donner un effet vieilli. | Produit technique et dangereux : ventilation, gants, fixer ensuite selon support. Corriger marque/backtick. | [Freres Nordin](https://freresnordin.fr/cires-pour-parquet-escalier/34-bitume-de-judee-3466022529016.html) |
| Libéron Black Bison Cire antiquaire 500g | 4/5 | Cire pate pour meubles et boiseries, patine et lustrage. | Libéron parle plutot de 500ml : verifier libelle. Doublon probable avec l'autre Black Bison. | [Libéron](https://www.liberon.fr/produit/cire-antiquaire-black-bison/) |
| Libéron Cire Black Bison "Antiquaire" 500ml | 3/5 | Meme famille Black Bison, possiblement pate ou liquide selon reference. | Dedupliquer ou separer clairement pate vs liquide. | [Libéron](https://www.liberon.fr/produit/cire-antiquaire-black-bison/) |
| Libéron Peinture a base de caseine Blanc Albatre 500ML | 5/5 | Peinture mate pour relooker meubles, objets et boiseries. | Ce n'est pas une cire. Ajouter conseils preparation selon bois brut/verni/melamine. | [Libéron](https://www.liberon.fr/products/peinture-meuble-signe-caseine-mat-blanc-albatre) |
| Libéron Peinture decorative Le Metal Poudre Fonte 500 ML | 5/5 | Peinture decorative effet metal mat. | Marque actuelle fausse : remplacer `Resin Pro` par Libéron. Ce n'est pas une cire. | [Libéron](https://www.liberon.fr/produit/peinture-le-metal-poudre/) |
| Libéron Teinte Antiquaire Merisier / Chene 0,5L | 4/5 | Teinte bois avant cire, vernis ou finition de protection. | Corriger `Libéron\``. Expliquer qu'une teinte ne protege pas seule. | [PDF Libéron](https://www.liberon.fr/wp-content/uploads/2018/06/Liberon-2018-Finitions-antiquaire-teinter.pdf) |
| Resin Pro - Resine Epoxy Ultra Transparente 3.2 Kg | 4/5 | Resine bi-composant pour creations, revetements, bijoux, tables bois/resine. | A sortir de `cires` ou ajouter type `resine`. Peser precisement, protections, eviter humidite. | [ResinPro](https://resinpro.fr/products/resines-transparentes-resin-pro/?add-to-cart=189954), [FT ResinPro](https://resinpro.fr/SDS/RESINE%20EPOXY%20TRANSPARENTE%20RESIN%20PRO%20TDS%20FR.pdf) |
| Rust-Oleum Chalky Finish 750ML | 5/5 | Peinture meuble effet craie/mat, renovation et upcycling. | Doit etre protegee par cire ou vernis/lacquer. A relier au bon tutoriel Firestore. | [Rust-Oleum](https://rustoleumcolours.co.uk/chalky-finish-furniture-paint/) |

### Savons, nettoyants et produits de preparation

| Produit actuel | Note | Usage et angle fiche | Points forts / conseils | Sources |
|---|---:|---|---|---|
| Blanchon Decapant Degraissant Parquet 1L | 4/5 | Nettoyage intensif avant renovation de parquets vitrifies, stratifies, PVC. | Categorie `savons` trompeuse. Produit fort : precautions, ventilation, gants. | [Blanchon](https://www.blanchon.com/professionnels/produits-interieurs/entretien/parquets-vitrifies/decapant-degraissant.html) |
| Libéron Decireur Professionnel 500ml | 4/5 | Retire anciennes cires, saletes incrustees et gras avant restauration. | A classer preparation/renovation plutot que savon doux. Produit solvanté inflammable. | [Libéron](https://www.liberon.fr/products/le-decireur) |
| Osmo Wash & Care 8016 1L | 5/5 | Nettoyage regulier des sols bois huiles/cires, meubles, portes, lambris. | Nettoyant doux et tres coherent pour la categorie savons. Ne pas surdoser. | [Osmo](https://www.osmo.com/finishes/interior-finishes/finishes-for-stairs-and-staircases/wash-and-care) |
| Rampal-Latour Savon Noir Liquide 5L | 4/5 | Nettoyant multi-usages ; variante huile de lin interessante pour sols/parquets. | Verifier la variante exacte : olive vs lin/amande. La fiche detail doit eviter une promesse trop large. | [Rampal olive](https://rampal-latour.fr/products/savon-noir-a-lhuile-dolive-5l-ecodetergent), [Rampal lin](https://www.rampal-latour.fr/products/savon-noir-a-lhuile-de-lin-amande-5l-ecodetergent) |
| Starwax Fabulous Savon de Marseille en Copeaux 750g | 4/5 | Savon en copeaux pour recettes menageres et nettoyage doux. | Peu lie a la renovation meuble, mais bon produit naturel. Expliquer comment le diluer. | [Starwax](https://www.starwax.fr/products/starwax-fabulous-savon-de-marseille-en-copeaux) |
| Starwax Nettoyant Pinceaux & Outils 1L | 4/5 | Nettoie et renove pinceaux, rouleaux et outils de peinture. | Plus atelier que savon. Ajouter gants/lunettes et essai prealable. | [Starwax](https://www.starwax.fr/products/starwax-nettoyant-renovateur-pinceaux-rouleaux-et-outils-1l) |

### Renovation et retouches

| Produit actuel | Note | Usage et angle fiche | Points forts / conseils | Sources |
|---|---:|---|---|---|
| Liberon 50g cire a reboucher - Chene moyen | 3/5 | Reboucher petits trous, rayures et trous de vers sur bois cire/verni. | Fiche officielle exacte difficile a retrouver. Verifier SKU/EAN avant fiche forte. | [Libéron glossaire](https://www.liberon.fr/glossaire/cire-a-reboucher/), [revendeur](https://camdentools.com/fr-FR/product/liberon-batonnet-de-cire-a-reboucher-chene-moyen-50g-LIBWFSMON-FR) |
| Libéron Crayon de Retouche Lot de 3 teintes | 5/5 | Masquer griffures et petites eraflures sur meubles/boiseries. | Produit tres pedagogique : choisir teinte proche, retirer excedent a la laine d'acier 000. | [Libéron](https://www.liberon.fr/products/les-crayons-de-retouche-chene) |
| Libéron Pate a bois Merisier 150g | 5/5 | Reboucher trous, fentes et eclats avant finition. | Expliquer difference avec cire a reboucher : pate pour support a retravailler/poncer. | [Libéron](https://www.liberon.fr/produit/pate-a-bois/) |
| Libéron Ring Remover / Popote 125mL | 3/5 | Potentiellement traces blanches d'eau/chaleur ou renovation de vernis. | Donnee ambigue : Ring Remover UK 125ml, Popote FR 0,5L, Renovateur FR 250/500ml. Verifier reference. | [Ring Remover UK](https://liberon.co.uk/product/ring-remover/), [Popote FR](https://www.liberon.fr/products/la-popote-des-antiquaires), [Renovateur FR](https://www.liberon.fr/products/le-renovateur) |
| Starwax Fabulous Acide Oxalique / Sel d'Oseille 400g | 5/5 | Degriser/eclaircir bois, enlever taches de rouille, encre, traces noires. | Produit fort : gants, essai discret, rincage abondant, stockage au sec. | [Starwax](https://www.starwax.fr/products/starwax-fabulous-sel-doseille) |
| V33 Decapant Bois Gel Express 1L | 5/5 | Decaper peintures, vernis, lasures, vitrificateurs sur bois. | Candidat fiche tres utile. Gel, couche epaisse, rincage, sechage. Relier au tutoriel V33. | [V33](https://www.v33.fr/special-bois-decapant-gel-express-r.html) |

### Accessoires

| Produit actuel | Note | Usage et angle fiche | Points forts / conseils | Sources |
|---|---:|---|---|---|
| 3M bloc de poncage caoutchouc pro 9292 | 4/5 | Poncer a la main avec pression plus reguliere qu'a la main nue. | Le terme `pro` semble marketing ; nom officiel plutot 3M Rubber Sanding Block 9292. | [3M](https://www.3m.com/3M/en_US/p/d/b10013802/) |
| Furniture Clinic Chiffons non pelucheux | 4/5 | Nettoyage, lustrage, application de cires/huiles sur meubles bois. | Separateur d'usages : un chiffon par etape. Attention chiffons imbibes d'huile/solvant. | [Furniture Clinic](https://www.furnitureclinic.co.uk/wood-care-products/wood-tools-accessories/lint-free-cleaning-cloth) |
| Libéron Coton a mecher professionnel 200g | 4/5 | Application de teintes, cire, vernis au tampon, lustrage fin. | Le presenter comme accessoire d'application, pas seulement nettoyage. | [Libéron](https://www.liberon.fr/products/le-coton-a-mecher) |
| Libéron Laine d'Acier Grade 0000 150g | 3/5 | Egrenage/lustrage fin, faire penetrer une cire, polir certains supports. | Verifier le grade : source officielle Libéron reference plutot N°000. | [Libéron](https://www.liberon.fr/products/la-laine-d-acier-n-000) |
| Libéron Pinceau Plat 'Le Spalter' 40mm | 3/5 | Application peinture/finitions sur petites surfaces. | Source officielle dit `Pinceau Plat 40mm`, pas vraiment `Spalter`. Verifier visuel/EAN. | [Libéron](https://www.liberon.fr/products/le-pinceau-plat-40-mm) |
| Masques 3M Aura 9332+ FFP3 Lot de 5 | 5/5 | Protection poussières fines de poncage et travaux bois. | Tres bon produit securite. Preciser : ne protege pas des vapeurs solvants/gaz ; attention contrefacons. | [3M France](https://www.3mfrance.fr/3M/fr_FR/p/d/v100570014/), [3M contrefacon](https://multimedia.3m.com/mws/media/2158265O/3m-9330-and-9332-counterfeit-communication-letter.pdf) |
| Titebond III Ultimate Wood Glue 473ml | 5/5 | Collage bois interieur/exterieur, assemblages exposes a l'humidite. | Pas pour immersion continue ni usage structurel. Nettoyage a l'eau avant sechage. | [Titebond PDF](https://www.titebond.com/App_Static/literature/glues/FF681_TBIIIUltimateBrochureTB.pdf) |

### Outils

| Produit actuel | Note | Usage et angle fiche | Points forts / conseils | Sources |
|---|---:|---|---|---|
| Bahco 474 Cabinet Scraper / Racloir d'ebeniste | 5/5 | Raclage fin du bois, egalisation, finition avant huile/cire. | Expliquer le morfil : sans affilage correct, le client ne comprendra pas l'outil. | [Bahco](https://www.bahco.com/au_en/cabinet-scrapers-with-plastic-edge-protector-pb_474_.html) |
| Bahco 625 Grattoir de Poche de Precision | 4.5/5 | Grattage precis des moulures, fenetres, coins et reprises de peinture. | Lame carbure agressive : tester sur supports tendres. | [Bahco](https://www.bahco.com/int_en/ergotm-precision-paint-scrapers-with-dual-component-handle-pb_625_.html) |
| Bessey Presse a Vis Tout Acier 600mm/120mm | 5/5 | Serrage puissant pour collage, assemblage, menuiserie et metal. | Reference probable GZ60K. Utiliser cales, ne pas sur-serrer, ne pas utiliser en levage. | [Bessey](https://bessey.de/fr-fr/bessey-tool/produits/technique-de-serrage/presses-a-vis-tout-acier/presse-a-vis-tout-acier-avec-poignee-a-garrot-gz-k) |
| Hazet 821-2 Grattoir Triangulaire Finition Pro | 3.5/5 | Ebavurage et finition mecanique, moins bois pur que les autres outils. | A positionner clairement : peut marquer le bois si mal employe. | [Hazet](https://www.hazet.de/en/products/hand-tools/grinding-/-separation-and-cutting-thread-repair/scraper/product/ean-4000896033690) |
| Kirschen Racloir Col de Cygne Professionnel | 4.5/5 | Raclage courbes, profils, moulures, zones concaves/convexes. | Ajouter conseil affiloir/morfil et protection anti-corrosion. | [Kirschen](https://www.kirschen-shop.de/en/3802000_Cabinet-Scraper-swan-neck_p3802.html) |
| Kirschen Two Cherries Coffret 6 Ciseaux Pro | 5/5 si SKU confirme | Ciseaux bois pour assemblages, reprises, chanfreins, ajustage. | Confirmer version coffret bois ou trousse cuir. Conseiller affutage avant usage fin. | [Kirschen](https://www.kirschen-shop.de/en/1101000_Firmer-Chisel-Set-with-hornbeam-handles-in-wooden-box_p1101.html), [Two Cherries](https://twocherriesusa.com/product/set-of-six-chisels-in-wooden-box/) |
| Kit Premium Kirschen 3 Racloirs + Affiloir | 5/5 | Kit complet pour finition bois : plat, courbe, col de cygne + affiloir. | Le mot premium est marketing ; expliquer comment dresser l'arete et former le morfil. | [Kirschen](https://www.kirschen-shop.de/en/-TWO-CHERRIES-Scraper-burnisher_c21.html), [The Carpentry Store](https://www.thecarpentrystore.com/p/kirschen-3824000-cabinet-scraper-set-with-scraper-burnisher/4016649038249) |
| Racleur lame 65mm manche suppl. BAHCO | 3/5 avant correction | Probable Bahco 665, racleur lourd pour peinture, colle, vernis, rouille. | Corriger marque actuelle Hazet. Verifier image/EAN 7311518221607. | [Bahco 665](https://www.bahco.com/int_en/ergotm-heavy-duty-paint-scrapers-with-dual-component-handle-pb_665_.html), [Leroy Merlin](https://www.leroymerlin.fr/produits/racleur-lame-l-65mm-manche-suppl-97436478.html) |

---

## Structure de donnees cible pour les fiches

Ajouter ou preparer ces champs dans `affiliate_products` avant implementation UI :

```js
{
  slug: string,
  shortTitle: string,
  correctedBrand: string,
  productType: string,
  detailStatus: 'ready' | 'needs-data-fix' | 'needs-source-check',
  detailIntro: string,
  customerDescription: string,
  useCases: string[],
  strengths: string[],
  atelierTips: string[],
  safetyNotes: string[],
  avoidIf: string[],
  sourceUrls: string[],
  disclosureLabel: 'lien remunere',
  lastSourceCheckAt: timestamp
}
```

Ne pas ecrire ces champs en prod sans validation explicite.

### Fichier importable prepare

Le contenu structure pret pour import est dans :

```txt
_DOCS/COMPTOIR_PRODUCT_DETAIL_IMPORT_DATA.json
```

Ce fichier contient, pour chaque produit :

- `productId` : ID Firestore actuel ;
- `currentName` et `currentBrand` : valeur lue dans le catalogue public ;
- `detailDraft` : contenu editorial importable sans toucher aux champs coeur ;
- `auditMeta` : niveau de confiance, statut, besoin de revue humaine ;
- `proposedCoreFixes` : corrections proposees pour `name`, `brand` ou `category`, a appliquer seulement apres validation.

Validation locale :

```bash
node scripts/validate-comptoir-detail-data.mjs
node scripts/validate-comptoir-detail-data.mjs --check-live
```

Import dry-run sandbox :

```bash
node scripts/import-comptoir-detail-data.cjs
```

Import sandbox :

```bash
node scripts/import-comptoir-detail-data.cjs --target=sandbox --apply
```

Import sandbox avec corrections coeur :

```bash
node scripts/import-comptoir-detail-data.cjs --target=sandbox --apply --apply-core-fixes
```

Import prod : interdit sans accord explicite utilisateur. Le script refuse de toute facon une ecriture prod sans le flag de confirmation :

```bash
node scripts/import-comptoir-detail-data.cjs --target=prod --apply --i-understand-prod-write
```

---

## Plan d'implementation recommande

1. Corriger les donnees critiques en sandbox ou via admin apres validation.
2. Ajouter les champs editoriaux sur 8 a 12 produits pilotes, pas les 44 d'un coup.
3. Creer la route `/comptoir/{slug}-{productId}`.
4. Creer un composant `ShopProductDetail` dedie, sans reutiliser la fiche meuble.
5. Modifier `ShopProductCard` pour ouvrir la fiche interne.
6. Ajouter CTA achat sur la fiche avec `trackAffiliateClick({ source: 'shop_detail' })`.
7. Mettre a jour `AdminAnalytics.jsx` pour afficher `affiliate_shop_detail`.
8. Ajouter tests build + smoke mobile.
9. Mettre a jour `SEOlivre.md` si les routes SEO/schema sont modifiees.
10. Lancer `npm run verify:seo-roadmap` puis `npm run build`.

---

## Reste a valider humainement

- Quels produits doivent etre pilotes en premier : top clics admin ou produits les plus techniques ?
- Garder ou non un bouton achat direct sur les cartes Comptoir.
- Ajouter une disclosure affiliation globale dans le footer ou sur chaque fiche.
- Corriger Firestore prod uniquement apres validation.
- Decider si les fiches Comptoir doivent etre indexables tout de suite ou lancees en `noindex` le temps de stabiliser les contenus.

---

## Migration prod du 2026-05-07

Objectif : reprendre le fonctionnement valide en sandbox sur la production, sans importer les donnees sandbox et sans toucher aux images produit prod.

Actions realisees :

- audit prod read-only ajoute via `scripts/audit-comptoir-prod.cjs` ;
- dry-run prod de `scripts/import-comptoir-detail-data.cjs --target=prod` : 44 documents existants, 44 updates possibles ;
- import prod applique uniquement sur `detailDraft`, `auditMeta` et `proposedCoreFixes` avec `--target=prod --apply --i-understand-prod-write` ;
- aucune application de `--apply-core-fixes`, donc pas de modification des champs coeur `name`, `brand`, `category`, `imageUrl`, `price`, `affiliateUrl` ;
- controle post-import : 44 produits publies, 44 fiches completes, 0 image manquante, 0 image en erreur HTTP, 0 mismatch `publicCatalog` ;
- correction UI : les CTA tutoriels Comptoir ouvrent maintenant la fiche produit au lieu d'aller directement vers Amazon.

Commandes de validation passees :

```bash
node scripts/validate-comptoir-detail-data.mjs --check-live
node scripts/audit-comptoir-prod.cjs --target=prod --check-images --require-details
npm run verify:seo-roadmap
npm run build
npm run preflight:prod
```

Resultat important :

- `Complete detailDraft on published expected docs: 44/44`
- `Published expected docs without imageUrl: 0`
- `Image HTTP check failures: 0`

Reste a surveiller :

- 11 produits gardent `auditMeta.needsHumanReviewBeforePublish = true` pour tracer les variantes ou sources a revoir avant d'appliquer d'eventuelles corrections coeur.
- Les fiches Comptoir dynamiques fonctionnent cote SPA ; sitemap/shareMeta serveur ne listent pas encore chaque fiche produit Comptoir individuellement.

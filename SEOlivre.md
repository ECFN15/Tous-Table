# SEOlivre - Tous a Table

Ce fichier est le journal de bord SEO du projet.  
Chaque agent qui modifie une partie importante du SEO doit le lire avant d'agir, puis ajouter une entree claire apres l'implementation.

Regle de travail :

- Ne jamais deployer en production sans accord explicite.
- Ne jamais modifier Firestore prod pour une amelioration SEO sans validation humaine.
- Ne pas casser l'interface marketplace, meubles ou planches : ces pages gardent leur design et leur grille.
- Prioriser les changements invisibles, les URLs propres, les schemas, le sitemap et le contenu editorial uniquement quand il s'integre au design existant.
- Pour chaque etape, noter : objectif, fichiers touches, impact SEO, risque UI, tests effectues, reste a faire.

## Table des chapitres

1. Audit initial et socle technique
2. Architecture URL propre
3. Sitemap et partage social
4. Marketplace, meubles et planches
5. Le Comptoir
6. SEO local Ifs / Caen / Normandie
7. SEO national France et pays frontaliers
8. Donnees structurees
9. Search Console et suivi post-deploiement

---

## Chapitre 1 - Audit initial et socle technique

Date : 6 mai 2026  
Statut : fait

Objectif :

- Reprendre l'etat SEO global du site apres les changements de routing, marketplace et production.
- Documenter les risques avant de poursuivre.

Fichiers / documents :

- `_DOCS/SEO_AUDIT_EXPORT_2026.md`
- `_DOCS/SEO_ROADMAP_REFACTOR_2026.md`

Constats :

- Le site avait une base correcte mais trop dependante des query params et du rendu SPA.
- Les pages e-commerce fortes n'avaient pas encore d'URLs propres.
- Le sitemap devait etre aligne avec les nouvelles routes.
- La racine devait devenir l'entree marketplace, avec la page vitrine deplacee vers `/a-propos`.

Impact SEO :

- Base de decision pour la refonte.
- Roadmap claire : architecture, sitemap, contenu categorie, local/national, schemas, suivi Search Console.

Risque UI :

- Aucun changement UI dans cette etape.

Tests :

- Audit manuel code + documentation Google Search Central.

Reste a faire :

- Completer le contenu SEO visible sur les pages qui peuvent le recevoir sans casser l'interface.

---

## Chapitre 2 - Architecture URL propre

Date : 6 mai 2026  
Statut : commence localement

Objectif :

- Remplacer les anciennes URLs `?page=...`, `?product=...` et hash par des routes propres.

Routes cibles :

- `/` : marketplace principale.
- `/a-propos` : page vitrine, histoire, atelier.
- `/meubles-anciens` : collection meubles.
- `/meubles-anciens/buffets`
- `/meubles-anciens/tables-de-ferme`
- `/meubles-anciens/armoires`
- `/meubles-anciens/commodes-chevets`
- `/meubles-anciens/chaises-bancs`
- `/meubles-anciens/autres`
- `/planches-a-decouper-anciennes`
- `/comptoir`
- `/produit/slug-id`

Fichiers touches :

- `src/utils/seoRoutes.js`
- `src/App.jsx`
- `src/Router.jsx`
- `src/pages/GalleryView.jsx`
- `src/designs/architectural/MarketplaceLayout.jsx`
- `src/designs/architectural/components/ProductCard.jsx`
- `src/designs/architectural/ArchitecturalProductDetail.jsx`
- `src/components/layout/GlobalMenu.jsx`
- `src/components/layout/Footer.jsx`
- `functions/src/seo/seoTools.js`

Impact SEO :

- URLs plus lisibles pour Google et les utilisateurs.
- Canonicals et sitemap peuvent converger vers les memes URLs.
- Les fiches produit deviennent descriptives via slug.

Risque UI :

- Moyen au depart car le routing touche la navigation.
- Mesure prise : ne pas changer les layouts, seulement les chemins et callbacks.

Tests :

- `npm run build` OK.
- Preview locale : `/`, `/a-propos`, categories, `/comptoir`, `/produit/test-id` en 200.
- Recherche locale : anciens patterns `?page=gallery`, `?page=shop`, `?product`, `#gallery` nettoyes.

Reste a faire :

- Refaire un smoke test visuel complet avant tout deploy Hosting.

---

## Chapitre 3 - Sitemap et partage social

Date : 7 mai 2026  
Statut : renforce localement, aucun deploy

Objectif :

- Consolider le sitemap et les metas de partage sans toucher aux donnees prod.
- Eviter les titres generiques et les descriptions corrompues dans les apercus Open Graph.
- Garder les URLs sitemap alignees avec les nouvelles routes propres.

Fichiers touches :

- `index.html`
- `public/manifest.json`
- `functions/src/seo/seoTools.js`
- `src/components/shared/SEO.jsx`
- `SEOlivre.md`

Changements :

- `src/components/shared/SEO.jsx` :
  - default `siteTitle` nettoye en ASCII : `Tous a Table Made in Normandie` ;
  - default description remplacee par un texte plus propre autour de l atelier a Ifs, meubles anciens restaures, bois massif, livraison locale, France et pays frontaliers ;
  - suppression des caracteres corrompus dans les metas par defaut.
- `index.html` :
  - head statique nettoye en ASCII ;
  - title, description, keywords, Open Graph et Twitter description alignes avec le positionnement meubles anciens restaures ;
  - JSON-LD statique `FurnitureStore` conserve et nettoye ;
  - point d entree React `/src/main.jsx`, fonts, favicon, manifest et canonical conserves.
- `public/manifest.json` :
  - nom et short name nettoyes en ASCII ;
  - positionnement aligne sur `Meubles anciens restaures` ;
  - `start_url` fixe sur `/`.
- `functions/src/seo/seoTools.js` :
  - fichier reecrit proprement en ASCII pour eliminer les caracteres corrompus ;
  - conservation du sitemap XML dynamique existant ;
  - conservation des URLs produits propres via `/produit/slug-id` ;
  - ajout de metas de partage par route pour :
    - `/`
    - `/meubles-anciens`
    - toutes les categories meubles ;
    - `/planches-a-decouper-anciennes`
    - `/comptoir`
    - `/a-propos`
    - `/livraison-meubles-anciens-france`
  - `shareMeta` accepte maintenant `path`, `url` ou `product` pour choisir la meta ;
  - extraction prudente de l ID produit depuis `/produit/slug-id` ;
  - ajout de `og:site_name`, `og:type`, metas Twitter detaillees et canonical ;
  - cache court conserve : `public, max-age=300, s-maxage=300`.

Impact SEO :

- Les apercus sociaux et robots qui utilisent la Function de partage ne tombent plus sur `Ma Boutique`.
- Les pages fortes ont un title/description coherent avec leur intention de recherche.
- Le sitemap reste coherent avec la nouvelle architecture routee.

Limite actuelle :

- `shareMeta` est exportee cote Functions, mais les URLs publiques normales restent servies par Hosting vers `index.html`.
- Les pages React mettent bien a jour leurs metas via `SEO.jsx`, mais certains robots sociaux ne rendent pas toujours le JavaScript.
- Si l'objectif devient des apercus sociaux dynamiques parfaits pour chaque fiche produit, il faudra ajouter une strategie dediee :
  - soit une URL de partage explicite type `/share?product=...` ;
  - soit une solution SSR/prerender ;
  - soit une logique edge/hosting plus avancee selon les contraintes Firebase.

Risque UI :

- Nul : changement invisible, uniquement metas/sitemap/share.
- Aucun changement marketplace, meubles, planches ou Firestore.

Tests :

- `node --check functions/src/seo/seoTools.js` OK.
- `npm run build` OK.
- Recherche locale : plus de `Ma Boutique` ni de sequences mojibake dans `functions/src/seo/seoTools.js` et `src/components/shared/SEO.jsx`.
- Recherche locale `index.html` : title/OG/schema statiques propres, build Vite OK.
- Manifest public verifie et nettoye en ASCII.
- Preview local sur port 4192 :
  - `/`, `/a-propos`, `/comptoir`, `/livraison-meubles-anciens-france`, `/meubles-anciens`, `/meubles-anciens/buffets`, `/planches-a-decouper-anciennes`, `/produit/test-id` repondent en 200 ;
  - HTML statique de `/` verifie : title, description et schema `FurnitureStore` presents ;
  - serveur preview arrete apres verification.

Reste a faire :

- Ne deployer la Function `sitemap/shareMeta` qu avec accord explicite.
- Apres deploy : tester `/sitemap.xml`, inspecter une categorie, une fiche produit et la page livraison dans Search Console.
- Decider plus tard si les apercus sociaux produit doivent etre dynamiques hors React.

---

## Chapitre 5 - Le Comptoir

Date : 6 mai 2026  
Statut : en cours localement

Objectif :

- Transformer `/comptoir` en page SEO forte autour de la boutique bois, entretien meuble ancien, soin du bois massif et restauration, sans mettre le mot "affiliation" dans le SEO principal.
- Garder l'identite UI "Le Comptoir".
- Ne pas toucher aux pages meubles et planches.

Fichiers touches :

- `src/pages/ShopView.jsx`

Changements :

- Meta title remplace par : `Le Comptoir - Boutique Bois & Entretien Meuble Ancien`.
- Meta description remplacee sans mention "affiliation".
- Ajout d'un schema JSON-LD invisible :
  - `CollectionPage`
  - `BreadcrumbList`
  - `FAQPage`
- Ajout d'une section editoriale courte apres le hero :
  - boutique bois
  - entretien meuble ancien
  - huiles, cires, savons, accessoires
  - selection courte et utile
- Ajout d'une FAQ visible en bas de page :
  - produits pour meuble ancien
  - protection table bois massif
  - usage pour meubles restaures et planches en bois

Impact SEO :

- La page peut viser des recherches informationnelles et transactionnelles autour de l'entretien du bois.
- Les donnees structurees renforcent la comprehension de la page.
- La FAQ donne du contenu indexable sans perturber la grille marketplace.

Risque UI :

- Faible a moyen : ajout de deux blocs visibles uniquement sur le Comptoir.
- Les pages meubles et planches ne sont pas touchees.
- Le layout existant du Comptoir est conserve.

Tests :

- `npm run build` OK.
- Bundle `ShopView-*.js` verifie : title/description/schema presents.
- Verification bundle : `Boutique Affiliation` / `Boutique affiliation` absents des metas Comptoir.
- Preview HTTP `/comptoir` verifiee en 200 pendant le controle local precedent.

Reste a faire :

- Ajouter si necessaire un maillage discret vers `/meubles-anciens` et `/a-propos`.
- Valider visuellement que les nouveaux blocs ne cassent pas le rythme de la page.

---

## Chapitre 4 - Marketplace, meubles et planches

Date : 6 mai 2026  
Statut : SEO invisible commence

Objectif :

- Ameliorer les signaux SEO de la marketplace sans toucher a la grille, aux cartes, aux animations ni au design des pages meubles/planches.

Fichiers touches :

- `src/pages/GalleryView.jsx`
- `src/utils/furnitureCategory.js`

Changements :

- Titres et descriptions SEO dynamiques selon la collection :
  - marketplace meubles
  - buffets
  - tables de ferme
  - armoires
  - commodes et chevets
  - chaises et bancs
  - autres meubles
  - planches a decouper anciennes
- Ajout d'un schema JSON-LD invisible :
  - `CollectionPage`
  - `BreadcrumbList`
- Ajout d'un `ItemList` JSON-LD invisible sur les collections :
  - liste limitee aux 24 premiers produits publies/filtrables ;
  - categorie meuble respectee avec le meme mapping legacy que l'interface ;
  - URLs produits propres via `/produit/slug-id`.
- Ajout de `src/utils/furnitureCategory.js` pour reprendre cote SEO la meme logique que l'affichage : `category` Firestore, puis mapping legacy par ID, puis fallback par nom.
- Les routes et canonicals restent alignes avec `src/utils/seoRoutes.js`.

Impact SEO :

- Chaque categorie transmet un signal plus clair a Google.
- Le breadcrumb aide a comprendre la hierarchie entre accueil, meubles anciens et categorie.
- `ItemList` aide Google a comprendre quels produits appartiennent a la collection ou categorie.
- Aucune modification de donnees Firestore.

Risque UI :

- Tres faible : changement invisible dans les metas et les schemas seulement.
- La grille marketplace, les meubles et les planches ne sont pas modifies visuellement.

Tests :

- `npm run build` OK.
- Bundle `GalleryView-*.js` verifie : titres categories, `CollectionPage`, `BreadcrumbList` presents.
- Bundle `GalleryView-*.js` verifie : `ItemList`, `numberOfItems`, `itemListElement`, `Product` presents.
- Aucun test visuel necessaire pour cette etape : changement invisible SEO uniquement.

Reste a faire :

- Ajouter plus tard du contenu categorie visible uniquement si le design le permet et apres validation humaine.

---

## Chapitre 6 - SEO local Ifs / Caen / Normandie

Date : 6 mai 2026  
Statut : page livraison commencee localement

Objectif :

- Creer une page discrete et utile sur la livraison des meubles anciens, sans toucher a la structure visuelle marketplace/meubles/planches.
- Couvrir le local Ifs / Caen, la Normandie, la France entiere et les pays frontaliers sur devis.

Fichiers touches :

- `src/pages/DeliveryView.jsx`
- `src/utils/seoRoutes.js`
- `src/Router.jsx`
- `src/App.jsx`
- `src/components/layout/Footer.jsx`
- `functions/src/seo/seoTools.js`

Changements :

- Nouvelle route locale : `/livraison-meubles-anciens-france`.
- Page accessible discretement depuis le footer, colonne `Aide`, lien `Livraison`.
- Page construite comme contenu editorial responsive :
  - hero livraison atelier
  - zones : Ifs/Caen, Normandie, France entiere, pays frontaliers
  - methode de transport
  - FAQ livraison
- Suppression du bloc central de demande de devis : le prix se fixe directement entre client, vendeur et transporteur selon le meuble et le trajet.
- Ajout au sitemap local via `functions/src/seo/seoTools.js`.
- Ajout de schemas invisibles sur la page :
  - `WebPage`
  - `BreadcrumbList`
  - `FAQPage`

Impact SEO :

- Cible les requetes autour de livraison meuble ancien, transport meuble ancien France, livraison meuble Caen / Ifs.
- Rassure les clients nationaux sans surcharger les pages produits.
- Soutient le positionnement local et national dans une seule page forte.

Risque UI :

- Faible : nouvelle page isolee.
- Pas de modification de grille, cartes, animations ou pages meubles/planches.
- Le lien est discret dans le footer.

Tests :

- `npm run build` OK.
- Bundle `DeliveryView-*.js` verifie : route, title SEO, schemas et contenu transport presents.
- Verification bundle : le bloc `Demander un devis` et la phrase `Pour estimer la livraison` sont absents apres suppression.
- Preview locale tentee puis interrompue; serveur de test nettoye. A refaire visuellement avant deploy.

Reste a faire :

- Eventuellement ajouter un lien discret depuis les fiches produit apres validation visuelle.
- Ajouter Search Console apres deploy, uniquement avec accord.

---

## Chapitre 8 - Donnees structurees

Date : 6 mai 2026  
Statut : en cours

Objectif :

- Ajouter progressivement des schemas utiles et alignes avec le contenu reel visible.

Etat actuel :

- `/comptoir` : `CollectionPage`, `BreadcrumbList`, `FAQPage`.
- Marketplace / categories / planches : `CollectionPage`, `BreadcrumbList`.
- Fiches produit : `Product`, `Offer`, `BreadcrumbList`.
- `/a-propos` : `WebPage`, `WebSite`, `FurnitureStore`, `LocalBusiness`, `BreadcrumbList`, `FAQPage`.

Regle :

- Ne pas ajouter de schema qui promet un contenu absent de la page.
- Ne pas utiliser les schemas comme substitut a un vrai contenu visible.

Tests :

- A faire apres deploy : Rich Results Test et Search Console.

---

## Chapitre 8B - Fiches produit

Date : 6 mai 2026  
Statut : schema invisible renforce localement

Objectif :

- Renforcer les fiches produit sans modifier leur interface.
- Aider Google a comprendre le produit, son prix, sa disponibilite, son etat d objet ancien et sa place dans la collection.

Fichiers touches :

- `src/designs/architectural/ArchitecturalProductDetail.jsx`
- `SEOlivre.md`

Changements :

- Schema `Product` transforme en `@graph`.
- Ajout / renforcement :
  - `Product`
  - `Offer`
  - `BreadcrumbList`
  - `sku`
  - `category`
  - `material`
  - `itemCondition: UsedCondition`
  - `seller: FurnitureStore`
- Gestion prudente du prix : le prix est emis uniquement s il existe et si le produit n est pas en `priceOnRequest`.
- Disponibilite basee sur `sold` et `stock`.

Impact SEO :

- Meilleure lecture des fiches produits comme pages ecommerce.
- Breadcrumb produit coherent avec `/meubles-anciens` ou `/planches-a-decouper-anciennes`.

Risque UI :

- Nul : JSON-LD invisible uniquement.

Tests :

- `npm run build` OK.
- Bundle `ProductDetail-*.js` verifie : `BreadcrumbList`, `UsedCondition`, `itemCondition`, `seller`, `sku`, `category`, `priceOnRequest` presents.

---

## Chapitre 6B - Page A propos et SEO local atelier

Date : 6 mai 2026  
Statut : schema invisible renforce localement

Objectif :

- Renforcer `/a-propos` comme page de confiance locale autour de l atelier de restauration a Ifs / Caen.
- Garder la page vitrine strictement identique visuellement.

Fichiers touches :

- `src/pages/HomeView.jsx`
- `SEOlivre.md`

Changements :

- Remplacement du schema inline `FurnitureStore` ancien par un `@graph` plus robuste :
  - `WebPage`
  - `WebSite`
  - `FurnitureStore`
  - `LocalBusiness`
  - `BreadcrumbList`
  - `FAQPage`
- Ajout des signaux locaux et metiers :
  - Ifs
  - Caen
  - Normandie
  - France
  - restauration de meubles anciens
  - tables de ferme, buffets, armoires, bois massif

Impact SEO :

- Google comprend mieux que `/a-propos` est la page atelier / entreprise locale.
- Les signaux locaux soutiennent les futures pages livraison et la marketplace.

Risque UI :

- Nul : changement invisible uniquement dans JSON-LD.

Tests :

- `npm run build` OK.
- Bundle `index-*.js` verifie :
  - `FurnitureStore` present ;
  - `LocalBusiness` present ;
  - `/a-propos#webpage` present ;
  - `FAQPage` present ;
  - `Caen` present.

---

## Chapitre 10 - Cloture audit visuel local avant pause

Date : 6 mai 2026, soir  
Statut : fait localement, aucun deploy

Objectif :

- Verifier que les ajouts SEO visibles ne cassent pas l'interface existante.
- Controler en priorite les pages ajoutees ou enrichies :
  - `/livraison-meubles-anciens-france`
  - `/comptoir`
  - `/meubles-anciens/buffets`
- Garder intact le design marketplace, meubles et planches.

Regle appliquee :

- Aucun deploy production.
- Aucune ecriture Firestore.
- Aucune migration data.
- Les corrections visuelles ont ete limitees aux nouveaux blocs SEO/livraison/Comptoir.

Corrections issues de l'audit :

1. Page livraison

- Fichier : `src/pages/DeliveryView.jsx`
- Probleme detecte en capture mobile : titre et paragraphe hero coupes horizontalement.
- Probleme detecte en capture laptop 1366x768 : titre trop massif, hero coupe verticalement.
- Correction :
  - retours de ligne controles sur mobile pour le titre et l'intro ;
  - reduction du padding vertical hero ;
  - taille desktop laptop reduite, tres grand titre reserve au `2xl`.
- Risque UI :
  - faible, page nouvelle et isolee ;
  - aucune page meuble/planche modifiee.

2. Comptoir

- Fichier : `src/pages/ShopView.jsx`
- Probleme detecte en capture mobile : texte visible corrompu par mojibake sur plusieurs mots accentues.
- Probleme detecte en capture mobile : paragraphe hero coupe a droite.
- Correction :
  - nettoyage des textes visibles en ASCII propre ;
  - remplacement des caracteres corrompus dans les familles, tutoriels, commentaires visibles et footer transparence ;
  - retours de ligne controles sur mobile pour le paragraphe hero.
- Important SEO :
  - le SEO principal reste formule comme `Boutique Bois & Entretien Meuble Ancien` ;
  - ne pas mettre `affiliation` dans les metas principales ;
  - la mention de transparence reste en bas de page, discrete et hors angle SEO principal.
- Risque UI :
  - faible a moyen, car la page Comptoir a du contenu visible ;
  - la grille produits et les cartes ne sont pas restructurees.

3. Marketplace / meubles

- Route auditee : `/meubles-anciens/buffets`.
- Capture mobile : la page charge, hero et boutons principaux visibles.
- Decision :
  - ne pas retoucher la composition existante ;
  - le rendu editorial avec image croppee et grand texte reste volontairement conserve.
- Point a surveiller :
  - sur viewport 390px, le dernier bouton du header est tres proche du bord droit dans Chrome headless. Ce point semble global au header, pas lie au SEO. Ne pas le corriger sans validation visuelle humaine, car le header existe sur toutes les pages publiques.

Tests effectues :

- `npm run build` OK apres les corrections.
- Routes locales testees en preview, toutes en 200 :
  - `/`
  - `/a-propos`
  - `/comptoir`
  - `/livraison-meubles-anciens-france`
  - `/meubles-anciens`
  - `/meubles-anciens/buffets`
  - `/planches-a-decouper-anciennes`
  - `/produit/test-id`
- `git diff --check` OK hors warnings CRLF habituels Windows.
- Recherche `rg` sur `ShopView.jsx` et `DeliveryView.jsx` : plus de sequences mojibake visibles.
- Captures temporaires supprimees.
- Serveur `vite preview` local arrete.

Etat avant pause :

- Build local OK.
- Pages publiques critiques en 200.
- Aucun deploy.
- Prod intacte.
- Les meubles client ne sont pas touches en base.
- Le rangement des anciens meubles reste gere cote code par le mapping/fallback existant, sans migration Firestore prod.

Reste a faire avant tout deploy prod :

- Refaire un smoke test navigateur manuel sur vrai Chrome visible :
  - accueil marketplace ;
  - galerie meubles ;
  - filtres categories ;
  - page produit ;
  - Comptoir ;
  - page livraison ;
  - panier ;
  - menu mobile.
- Verifier visuellement le header mobile sur iPhone/Android reel ou emulateur stable.
- Faire valider par humain que la nouvelle page livraison et les blocs Comptoir s'integrent bien au design.
- Ne deployer Hosting prod qu'apres accord explicite.

---

## Chapitre 11 - Prochaine phase gatee : contenu categorie visible

Date : 7 mai 2026  
Statut : plan pret, implementation bloquee volontairement avant validation UI

Pourquoi cette phase est gatee :

- La roadmap demande du contenu SEO visible par categorie.
- Ces changements toucheraient la page marketplace/meubles, que le client veut garder intacte visuellement.
- Aucune implementation visible ne doit etre lancee sans validation humaine sur le placement, la densite et le rendu responsive.

Objectif SEO :

- Donner a chaque categorie une intro utile et indexable sans transformer la page en landing page.
- Renforcer les requetes :
  - buffets anciens restaures ;
  - tables de ferme anciennes ;
  - armoires anciennes ;
  - commodes et chevets anciens ;
  - chaises et bancs anciens ;
  - meubles anciens en bois massif ;
  - livraison meuble ancien France / Normandie / Caen.

Principe UI a respecter :

- Ne pas casser le hero actuel.
- Ne pas modifier les cartes produits.
- Ne pas changer le masonry, les filtres, le tri ou les animations.
- Ne pas ajouter de gros bloc marketing au-dessus de la grille.
- Integrer le texte dans une zone discrete, editorialement premium, idealement proche de la barre categorie ou sous la premiere zone produit.
- Mobile : texte court, sans pousser les produits trop bas.
- Desktop : texte lisible mais secondaire face a la collection.

Plan d'implementation propose, a valider avant code :

1. Creer une map de contenu categorie invisible/visible dans `src/pages/GalleryView.jsx` ou un fichier dedie type `src/data/categorySeoContent.js`.
2. Ajouter une micro-intro visible uniquement quand une categorie precise est active, pas sur tous les filtres avances.
3. Texte cible :
   - 2 a 4 lignes maximum sur desktop ;
   - 2 paragraphes courts maximum sur mobile ;
   - pas de bourrage de mots-cles ;
   - mention livraison seulement de maniere naturelle.
4. Ajouter un maillage interne discret :
   - autres categories meubles ;
   - `/livraison-meubles-anciens-france` ;
   - `/a-propos` si pertinent.
5. Garder les schemas actuels `CollectionPage`, `BreadcrumbList`, `ItemList` et ne pas dupliquer les signaux.

Fichiers probables :

- `src/pages/GalleryView.jsx`
- eventuellement `src/data/categorySeoContent.js`
- eventuellement `src/designs/architectural/MarketplaceLayout.jsx` si le bloc doit etre rendu dans le layout existant
- `SEOlivre.md`

Risques :

- UI : moyen si le bloc est trop haut ou trop large.
- Mobile : moyen si le texte repousse la grille.
- SEO : faible si le contenu reste utile et specifique.

Gate de validation avant implementation :

- Choisir l'emplacement exact du bloc :
  - option A : sous la barre categories/filtres, avant la grille ;
  - option B : apres les 8 ou 12 premiers produits ;
  - option C : bloc repliable discret en bas de page.
- Valider le style :
  - editorial minimal ;
  - compact ;
  - aucun effet hero ;
  - aucun card nesting.
- Valider les textes par categorie avant deploy.

Tests requis apres implementation :

- `npm run build`.
- Preview local :
  - `/meubles-anciens/buffets`
  - `/meubles-anciens/tables-de-ferme`
  - `/meubles-anciens/armoires`
  - `/meubles-anciens/commodes-chevets`
  - `/meubles-anciens/chaises-bancs`
  - `/meubles-anciens/autres`
  - `/planches-a-decouper-anciennes`
- Captures mobile 390x844 et laptop 1366x768.
- Verification manuelle :
  - pas de chevauchement ;
  - pas de texte coupe ;
  - grille produits intacte ;
  - filtres toujours ergonomiques ;
  - header mobile non aggrave.

Decision actuelle :

- Ne pas coder cette phase tant que l'emplacement et le style ne sont pas valides.
- Continuer uniquement sur des changements invisibles, documentation ou verification tant que la validation UI n'est pas donnee.

---

## Chapitre 12 - Point d'arret et reprise propre

Date : 7 mai 2026  
Statut : pause volontaire, aucun deploy

Etat actuel :

- Le socle SEO invisible est en place localement :
  - routes propres ;
  - canonicals ;
  - metas par page ;
  - sitemap/shareMeta cote Functions ;
  - schemas JSON-LD ;
  - ItemList sur les collections ;
  - page livraison locale/nationale ;
  - Comptoir renforce sans angle "affiliation".
- Le design marketplace, meubles et planches n'a pas ete volontairement refondu.
- Les meubles prod ne sont pas modifies en base.
- Le rangement des anciens meubles reste gere par le code via ordre prudent :
  - `category` Firestore si present ;
  - mapping legacy par ID ;
  - fallback par nom ;
  - `autre`.
- Aucun deploy Hosting ou Functions n'a ete fait pendant cette phase.

Ce qui est validable sans coder demain :

1. Relire ce livre SEO du chapitre 10 au chapitre 12.
2. Choisir l'emplacement du futur contenu categorie visible :
   - option A : sous la barre categories/filtres, avant la grille ;
   - option B : apres les 8 ou 12 premiers produits ;
   - option C : bloc discret/repliable en bas de page.
3. Valider que le lien livraison reste uniquement discret dans le footer ou s'il faut un lien aussi depuis les fiches produit.
4. Valider si le Comptoir garde le nom `Le Comptoir` ou si le wording public doit devenir `Shop`/`Boutique`.

Ce qu'il ne faut pas faire sans validation :

- Ne pas ajouter de gros bloc texte au-dessus de la grille meubles.
- Ne pas modifier les cartes produits.
- Ne pas changer le masonry, les filtres ou les animations marketplace.
- Ne pas deployer en prod.
- Ne pas ecrire dans Firestore prod.

Prochaine action recommandee :

1. Faire un smoke visuel local complet sur Chrome :
   - `/`
   - `/meubles-anciens`
   - `/meubles-anciens/buffets`
   - `/planches-a-decouper-anciennes`
   - `/produit/test-id`
   - `/comptoir`
   - `/livraison-meubles-anciens-france`
   - `/a-propos`
2. Capturer mobile 390x844 et laptop 1366x768.
3. Si tout est intact, seulement ensuite proposer une micro-implementation du contenu categorie visible.
4. Apres validation humaine, lancer `npm run build` puis refaire preview.

Critere de reprise :

- La roadmap ne reprend en code visible que lorsque l'emplacement et le style du contenu categorie sont valides.
- Tant que ce n'est pas valide, seules les verifications, la documentation et les corrections invisibles restent autorisees.

---

## Chapitre 13 - Audit de couverture avant reprise

Date : 7 mai 2026  
Statut : audit documentaire fait, objectif global non clos

Objectif audite :

- Reprendre la roadmap SEO la ou elle etait arretee.
- Ne pas casser l'interface marketplace/meubles/planches.
- Ne pas deployer sans accord.
- Ne pas modifier la base prod.
- Documenter precisement ce qui reste a faire.

Checklist prompt vers artefacts :

| Exigence | Artefact verifie | Evidence locale | Etat |
|---|---|---|---|
| Routes propres SEO | `src/utils/seoRoutes.js`, `src/App.jsx`, `src/Router.jsx` | Routes `/meubles-anciens`, categories, `/planches-a-decouper-anciennes`, `/comptoir`, `/a-propos`, `/livraison-meubles-anciens-france` retrouvees par `rg` | OK local |
| Sitemap routes | `functions/src/seo/seoTools.js` | Routes principales et categories presentes dans `STATIC_ROUTES` | OK local |
| Partage social/metas | `functions/src/seo/seoTools.js`, `src/components/shared/SEO.jsx`, `index.html` | `shareMeta`, metas par route, title/description statiques propres | OK local, deploy Functions requis plus tard |
| Comptoir SEO sans angle affiliation | `src/pages/ShopView.jsx` | `CollectionPage`, `BreadcrumbList`, `FAQPage`, contenu boutique bois/entretien | OK local |
| Marketplace schemas invisibles | `src/pages/GalleryView.jsx` | `CollectionPage`, `BreadcrumbList`, `ItemList`, `Product` retrouves | OK local |
| Fiches produit schemas invisibles | `src/designs/architectural/ArchitecturalProductDetail.jsx` | `Product`, `Offer`, `UsedCondition`, `FurnitureStore`, `BreadcrumbList` retrouves | OK local |
| SEO local Ifs/Caen/livraison | `src/pages/DeliveryView.jsx`, `src/components/layout/Footer.jsx`, `functions/src/seo/seoTools.js` | Page livraison existe, lien footer present, route sitemap presente | OK local |
| Page A propos / atelier | `src/pages/HomeView.jsx` | `FurnitureStore`, `LocalBusiness`, `BreadcrumbList`, `FAQPage` presents | OK local |
| Meubles prod intacts | Process | Aucune commande d'ecriture Firestore/deploy; uniquement code local et docs | OK |
| UI marketplace intacte | Process + limite volontaire | Aucun contenu categorie visible code apres Chapitre 11; prochaines modifications visibles gatees | Non valide visuellement, gate obligatoire |
| Prod deploy | Process | Aucun deploy Hosting/Functions lance | OK |
| Documentation reprise | `SEOlivre.md` | Chapitres 10, 11, 12 et 13 documentent pause, gate, prochaine action | OK |

Commandes de verification lancees pour cet audit :

- `rg -n "livraison-meubles-anciens-france|meubles-anciens|planches-a-decouper-anciennes|comptoir|a-propos" src/utils/seoRoutes.js src/Router.jsx src/App.jsx src/components/layout/Footer.jsx functions/src/seo/seoTools.js`
- `rg -n "CollectionPage|BreadcrumbList|ItemList|FAQPage|Product|FurnitureStore|LocalBusiness|UsedCondition" src/pages src/designs/architectural src/components/shared functions/src/seo/seoTools.js index.html`
- `Test-Path SEOlivre.md`
- `Test-Path src/pages/DeliveryView.jsx`
- `Test-Path src/utils/furnitureCategory.js`
- `Test-Path src/utils/seoRoutes.js`
- `Test-Path _DOCS/SEO_ROADMAP_REFACTOR_2026.md`
- `git status --short --branch`

Points encore non couverts :

- Smoke visuel navigateur complet apres les derniers changements locaux.
- Captures mobile 390x844 et laptop 1366x768.
- Validation humaine de l'emplacement du contenu categorie visible.
- Rich Results Test Google apres deploy.
- Search Console apres deploy.
- Deploy Hosting/Functions, uniquement apres accord explicite.

Conclusion d'audit :

- La reprise SEO a avance jusqu'au point ou la suite devient visible dans l'UI.
- Le prochain travail code doit attendre validation, car il touche la page marketplace que le client veut conserver intacte.
- Le goal global de roadmap SEO ne doit pas etre marque termine : il reste des gates visuels et post-deploy.

---

## Chapitre 14 - Handoff prochain agent

Date : 7 mai 2026  
Statut : point d'arret final pour reprise demain

Demande utilisateur au moment de l'arret :

- Documenter `SEOlivre.md`.
- Dire exactement ou la roadmap s'arrete.
- Mettre la roadmap a jour pour que le prochain agent reparte sur une base propre.
- Ne pas continuer a coder ce soir.

Etat technique au point d'arret :

- `npm run build` a ete relance et passe OK.
- Warning restant : chunks > 500 kB, non bloquant SEO/deploy.
- Une preview locale a ete lancee sur le port `4194`, puis stoppee avant arret.
- Aucun smoke visuel complet n'a ete termine apres ce dernier build.
- Aucun deploy prod.
- Aucune ecriture Firestore prod.
- Aucun import sandbox vers prod.

Travail SEO local deja fait :

- Routes propres :
  - `/`
  - `/meubles-anciens`
  - `/meubles-anciens/buffets`
  - `/meubles-anciens/tables-de-ferme`
  - `/meubles-anciens/armoires`
  - `/meubles-anciens/commodes-chevets`
  - `/meubles-anciens/chaises-bancs`
  - `/meubles-anciens/autres`
  - `/planches-a-decouper-anciennes`
  - `/comptoir`
  - `/a-propos`
  - `/livraison-meubles-anciens-france`
  - `/produit/slug-id`
- SEO invisible :
  - titles/descriptions/canonicals ;
  - JSON-LD `CollectionPage`, `BreadcrumbList`, `ItemList`, `Product`, `Offer`, `FAQPage`, `FurnitureStore`, `LocalBusiness` ;
  - sitemap/shareMeta cote Functions ;
  - index/manifest nettoyes.
- SEO visible deja ajoute :
  - Comptoir : contenu boutique bois/entretien + FAQ ;
  - Livraison : page editoriale dediee ;
  - A propos : schema local renforce.

Point exact ou la roadmap s'arrete :

- La prochaine phase utile est le contenu SEO visible par categorie sur la marketplace.
- Cette phase est bloquee volontairement car elle touche la page meubles/marketplace que l'utilisateur ne veut surtout pas casser.
- Aucun bloc texte categorie ne doit etre code avant validation humaine de l'emplacement et du style.

Decision a prendre demain avant de coder :

1. Choisir l'emplacement du contenu categorie :
   - option A : sous la barre categories/filtres, avant la grille ;
   - option B : apres les 8 ou 12 premiers produits ;
   - option C : bloc discret/repliable en bas de page.
2. Choisir si la page Comptoir garde le nom `Le Comptoir` ou devient `Shop`/`Boutique` dans les libelles visibles.
3. Choisir si la page livraison reste seulement dans le footer ou si un lien discret est ajoute aux fiches produit.

Premiere action recommandee au prochain agent :

1. Lire `SEOlivre.md` chapitres 10 a 14.
2. Lancer :
   - `npm run build`
   - `npm run preview -- --host 127.0.0.1 --port 4194`
3. Faire un smoke visuel local sur :
   - `/`
   - `/meubles-anciens`
   - `/meubles-anciens/buffets`
   - `/planches-a-decouper-anciennes`
   - `/produit/test-id`
   - `/comptoir`
   - `/livraison-meubles-anciens-france`
   - `/a-propos`
4. Capturer au minimum :
   - mobile 390x844 ;
   - laptop 1366x768.
5. Verifier :
   - pas de chevauchement ;
   - menu mobile intact ;
   - header intact ;
   - grille meubles intacte ;
   - cartes produits intactes ;
   - filtres toujours ergonomiques ;
   - pas de texte coupe ;
   - aucune regression evidente sur Comptoir et Livraison.
6. Stopper la preview locale apres test.

Regles de securite a conserver :

- Ne jamais deployer en prod sans accord explicite.
- Ne jamais ecrire dans Firestore prod pour le SEO.
- Ne jamais importer de donnees sandbox vers prod.
- Ne pas changer les cartes meubles, planches, masonry, filtres ou animations sans validation.
- Tout changement visible marketplace doit etre petit, reversible et teste mobile/tablette/laptop/desktop.

Definition de "pret pour la suite" :

- Smoke visuel local OK.
- Emplacement du contenu categorie valide.
- Style du contenu categorie valide.
- Textes categories valides ou au moins limites a des micro-copies prudentes.

Definition de "pret deploy SEO" :

- Smoke visuel local OK.
- `npm run build` OK.
- Preview locale OK.
- Accord explicite utilisateur.
- Deploy Functions si sitemap/shareMeta doit partir.
- Deploy Hosting seulement apres validation finale.
- Apres deploy : Rich Results Test, inspection Search Console, verification sitemap.

---

## Chapitre 15 - Tracking Comptoir et analytics affiliation

Date : 7 mai 2026  
Statut : implemente localement, aucun deploy

Objectif :

- Adapter le tracking utilisateur apres les nouvelles pages SEO et routes propres.
- Fiabiliser le suivi des visites directes sur `/comptoir`.
- Mieux tracer les clics "Decouvrir" du Comptoir vers les liens externes, notamment Amazon.
- Ajouter dans l'onglet admin "Boutique Affiliation" un graphe des visiteurs du Comptoir avec les intervalles demandes : 1H, 5H, 1J, 2 semaines, 1 mois, 3 mois, 6 mois, 1 an.
- Ajouter une estimation du temps moyen passe sur Le Comptoir.

Fichiers touches :

- `src/components/shared/AnalyticsProvider.jsx`
- `src/utils/tracking.js`
- `src/features/admin/AdminAnalytics.jsx`
- `SEOlivre.md`

Changements :

- `AnalyticsProvider.jsx` :
  - reecriture propre en ASCII ;
  - conservation des gardes anti-double session ;
  - enregistrement de la vue initiale juste apres `initLiveSession`, pour que les arrivees directes sur `/comptoir`, `/livraison-meubles-anciens-france`, `/a-propos`, etc. apparaissent dans le parcours ;
  - deduplication de la meme vue via une cle stable ;
  - conservation du tracking des clics affiliation dans le journey sous `affiliate_shop_grid`, `affiliate_shop_tutorial` ou `affiliate_gallery_detail`.
- `tracking.js` :
  - ajout de `referrer: window.location.pathname || '/'` dans `affiliate_clicks`, champ deja autorise par les rules ;
  - l'ouverture externe reste prioritaire et ne depend pas de l'ecriture Firestore.
- `AdminAnalytics.jsx` :
  - ajout de labels lisibles pour les nouvelles pages du parcours : Marketplace, Fiche produit, Le Comptoir, Livraison, A propos, Checkout, Mes commandes ;
  - ajout de labels pour les clics affiliation : Clic Comptoir, Clic Tutoriel Comptoir, Clic depuis fiche meuble ;
  - ajout des filtres boutique : 1H, 5H, 1J, 2 Sem., 1 Mois, 3 Mois, 6 Mois, 1 An ;
  - ajout d'un graphe "Visiteurs sur Le Comptoir" calcule depuis les sessions ayant une etape Comptoir ou un clic Comptoir ;
  - ajout des KPIs boutique : visiteurs Comptoir uniques, temps moyen Comptoir estime, clics Amazon, produits cliques ;
  - conservation du graphe d'evolution des clics sortants.

Impact SEO / data :

- Les nouvelles routes SEO deviennent visibles dans les parcours admin au lieu de rester des noms techniques.
- Les visites directes du Comptoir sont comptabilisables apres initialisation de session, ce qui etait fragile avant.
- Le Comptoir peut maintenant etre lu comme une page avec trafic propre, temps moyen estime et clics sortants, pas seulement comme une collection de clics affilies.

Limites :

- Les graphes admin restent calcules sur les sessions chargees par `AdminAnalytics` (`limit(1000)`) et les clics charges (`limit(3000)`).
- Le temps moyen Comptoir est une estimation basee sur les durees entre etapes de journey. Pour les anciennes sessions sans etape `shop`, le calcul utilise prudemment les clics Comptoir comme signal de repli.
- Aucune migration historique Firestore n'a ete faite.

Risque UI :

- Faible a moyen : changement limite a l'onglet admin "Boutique Affiliation" et au rendu des libelles de parcours.
- Aucune modification visuelle des pages publiques Comptoir, marketplace, meubles ou planches.

Tests :

- `npm run build` OK.
- Aucun deploy.
- Aucune ecriture Firestore prod.

Reste a faire :

- Smoke test admin visuel sur l'onglet "Boutique Affiliation".
- Verifier en environnement local/sandbox qu'une arrivee directe sur `/comptoir` cree bien une etape `shop` dans `analytics_sessions.journey` apres heartbeat.
- Verifier qu'un clic "Decouvrir" cree un document `affiliate_clicks` avec `source`, `sessionId` si disponible et `referrer`.

---

## Chapitre 16 - Contenu categorie visible marketplace

Date : 7 mai 2026  
Statut : implemente localement, aucun deploy

Objectif :

- Reprendre la phase gatee du chapitre 11 apres validation implicite de reprise.
- Ajouter du contenu SEO visible par categorie sans transformer la marketplace en landing page.
- Garder intactes les cartes produits, le masonry, les filtres, le tri et les animations.
- Ne pas creer de nouvelle page : les routes propres existantes restent identiques.

Fichiers touches :

- `src/data/categorySeoContent.js`
- `src/designs/architectural/MarketplaceLayout.jsx`
- `SEOlivre.md`

Changements :

- Ajout de `src/data/categorySeoContent.js` :
  - micro-contenu pour buffets, tables de ferme, chaises/bancs, armoires, commodes/chevets, autres meubles ;
  - micro-contenu pour les planches a decouper anciennes ;
  - liens internes discrets vers categories liees, livraison, Comptoir ou A propos.
- Ajout du composant `CategorySeoIntro` dans `MarketplaceLayout.jsx` :
  - rendu sous les categories/filtres, juste avant la grille ;
  - structure non cardee, simple `border-y`, pour rester secondaire face aux produits ;
  - responsive mobile en une colonne, desktop en deux colonnes ;
  - texte court, sans bourrage de mots-cles.
- Affichage conditionnel :
  - visible sur les pages categories meubles ;
  - visible sur `/planches-a-decouper-anciennes` ;
  - masque sur `/meubles-anciens` general ;
  - masque des qu un filtre avance matiere/prix est actif, pour ne pas melanger contenu categorie et resultats filtres.

Impact SEO :

- Les pages categories ont maintenant un contenu indexable visible, coherent avec leurs titles/descriptions et schemas existants.
- Le maillage interne renforce les liens entre categories, livraison, Comptoir et page atelier.
- Aucun schema n a ete modifie : le contenu visible soutient les schemas deja presents sans dupliquer les signaux.

Impact admin data :

- Aucune nouvelle route et aucun changement de nom de page n'ont ete ajoutes.
- L'onglet data admin n'a donc pas besoin d'un nouveau mapping de page pour cette etape.
- Rappel maintenu : si une prochaine etape cree ou renomme une page, `src/features/admin/AdminAnalytics.jsx` devra etre mis a jour avec le libelle de parcours correspondant.

Risque UI :

- Faible a moyen : contenu visible sur marketplace, mais limite a un bloc compact sous les filtres.
- Les cartes produits, le masonry, le tri et les filtres ne sont pas modifies.
- Le bloc disparait quand les filtres avancés s appliquent.

Tests :

- `npm run build` OK.
- Preview locale lancee sur `http://127.0.0.1:4195`.
- Routes testees en HTTP 200 :
  - `/meubles-anciens/buffets`
  - `/meubles-anciens/tables-de-ferme`
  - `/meubles-anciens/armoires`
  - `/meubles-anciens/commodes-chevets`
  - `/meubles-anciens/chaises-bancs`
  - `/meubles-anciens/autres`
  - `/planches-a-decouper-anciennes`
- Verification bundle : les textes categories sont presents dans `dist/assets/GalleryView-*.js`.
- `git diff --check` OK hors warnings CRLF Windows.

Limite de verification :

- Capture initiale mobile/laptop via Chrome headless effectuee sur `/meubles-anciens/buffets`.
- La capture scrollee exacte du bloc categorie n'a pas ete retenue comme preuve finale car le pilotage CDP local a timeoute. Verification visuelle humaine recommandeee sur la preview avant deploy.

Reste a faire :

- Smoke visuel manuel sur la preview :
  - mobile 390px ;
  - laptop 1366px ;
  - categories meubles ;
  - planches ;
  - filtres matiere/prix pour verifier que le bloc se masque.
- Ne pas deployer Hosting avant accord explicite.

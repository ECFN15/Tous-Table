# Rapport produits Comptoir - nouveau lot Amazon

Date : 11 mai 2026  
Perimetre : nouveaux candidats pour etoffer `/comptoir` sur les 6 sections existantes.  
Statut : **pret en import brouillon local**, aucune ecriture Firestore prod, aucun deploy.

## Synthese

Le lot ajoute **36 nouveaux produits candidats**, soit **6 produits par section** :

- Huiles : 6
- Cires, peintures et effets : 6
- Savons et nettoyants : 6
- Accessoires essentiels : 6
- Decapage et retouches : 6
- Outils et materiel pro : 6

Les donnees importables sont dans :

```txt
_DOCS/COMPTOIR_NEW_PRODUCT_CANDIDATES_2026-05.json
```

Important : les liens Amazon sont des **recherches affiliees avec le tag `tousatable-21`**, pas des ASIN definitifs. Les produits sont donc volontairement en `draft`. Avant publication, il faut remplacer chaque recherche par le lien Amazon exact, verifier le prix, l'image, le vendeur et la disponibilite.

## Validation locale

Commandes passees :

```bash
npm run verify:comptoir-new-products
node scripts/import-comptoir-new-products.cjs
git diff --check -- _DOCS/COMPTOIR_NEW_PRODUCT_CANDIDATES_2026-05.json scripts/validate-comptoir-new-products.mjs scripts/import-comptoir-new-products.cjs package.json
```

Resultats :

- JSON valide : 36 nouveaux produits.
- Slugs uniques : 36.
- Repartition : `{"accessoires":6,"cires":6,"huiles":6,"outils":6,"renovation":6,"savons":6}`.
- Dry-run import sandbox : 36 documents brouillon seraient crees, 0 collision d'ID.
- `git diff --check` OK, avec seulement un warning CRLF attendu sur `package.json`.

## Huiles

### 1. Osmo TopOil 3058 Incolore Mat

- Section : Huiles.
- Usage : plans de travail, tables, bureaux, planches et plateaux interieurs en bois massif.
- Points positifs : finition huile-cire haut de gamme, rendu naturel, entretien local plus simple qu'un vernis.
- Conseil : appliquer deux couches tres fines sur bois brut ponce, essuyer l'excedent.
- Precautions : chiffons et pads huiles a traiter comme risque d'auto-echauffement.
- Source : https://www.osmo.fr/finitions/finitions-pour-linterieur/finitions-pour-plans-de-travail/topoil

### 2. Osmo Wood Wax Finish 3101 Transparent

- Section : Huiles.
- Usage : meubles, lambris, boiseries et objets interieurs.
- Points positifs : finition decorative qui laisse lire le bois, bonne alternative a une peinture opaque.
- Conseil : tirer dans le sens du fil et tester la nuance sur chute.
- Precautions : eviter les anciennes finitions fermees non poncees.
- Source : https://osmouk.com/product/wood-wax-finish/

### 3. Rubio Monocoat WoodCream Transparent

- Section : Huiles.
- Usage : bois exterieurs verticaux, bardage, portes, volets, elements de jardin.
- Points positifs : ouvre le Comptoir aux bois exterieurs avec une marque experte.
- Conseil : reserver aux surfaces verticales et preparer le bois avant application.
- Precautions : ne pas presenter comme finition de plateau horizontal.
- Source : https://www.rubiomonocoatusa.com/products/woodcream

### 4. Blanchon Huile Environnement Biosourcee

- Section : Huiles.
- Usage : parquets, planchers et grandes surfaces bois preparees.
- Points positifs : marque francaise professionnelle, bonne option pour renovation de sol.
- Conseil : travailler par zones regulieres et respecter les temps de sechage.
- Precautions : ne pas appliquer sur cire ancienne.
- Source : https://www.blanchon.com/professionnels/huile-environnement.html/

### 5. Syntilor Huile Plan de Travail Biosourcee

- Section : Huiles.
- Usage : plans de travail, tables de cuisine et meubles bois de cuisine.
- Points positifs : produit specialise, accessible, coherent pour les usages quotidiens.
- Conseil : poncer de facon homogene avant application.
- Precautions : verifier le contact alimentaire selon reference exacte.
- Source : https://www.syntilor.com/huile-plan-de-travail-biosource.html

### 6. V33 Huile Plan de Travail Incolore

- Section : Huiles.
- Usage : plans de travail, tables et meubles de cuisine en bois.
- Points positifs : reference facile a trouver, bon produit grand public.
- Conseil : controler que le bois est absorbant avant application.
- Precautions : ne pas appliquer sur support brillant ou ferme.
- Source : https://www.v33.fr/huile-plan-de-travail-huile-bois-interieur.html

## Cires, Peintures Et Effets

### 7. Liberon Vernis Bistrot Satin Chene Clair

- Usage : plateaux, buffets, objets et meubles soumis a l'usage quotidien.
- Points positifs : meilleure resistance qu'une cire simple, bon produit pour meubles sollicites.
- Conseil : depoussierer entre couches et travailler hors poussiere.
- Precautions : decireur obligatoire si le meuble est cire.
- Source : https://www.liberon.fr/collections/le-vernis-bistrot

### 8. Liberon Peinture Meuble Signe Effet Chaule Kaolin

- Usage : patine claire sur meubles, moulures et objets bois.
- Points positifs : effet decoratif fort, bon contenu avant/apres.
- Conseil : essuyer les reliefs par petites zones pour creer l'usure.
- Precautions : proteger ensuite les zones tres sollicitees.
- Source : https://www.liberon.fr/products/peinture-meuble-signe-effet-chaule-kaolin

### 9. Liberon Liquide a Dorer Or Riche

- Usage : filets, moulures, cadres, miroirs et details sculptes.
- Points positifs : angle restauration de detail tres utile.
- Conseil : appliquer par petites touches plutot que couvrir massivement.
- Precautions : produit decoratif technique, pas de contact alimentaire.
- Source : https://www.liberon.fr/produit/le-liquide-a-dorer/

### 10. Rust-Oleum Furniture Finishing Wax Clear

- Usage : protection de meubles peints, surtout apres Chalky Finish.
- Points positifs : complement logique au Rust-Oleum deja present.
- Conseil : attendre le sechage complet de la peinture, cirer finement.
- Precautions : protection legere, pas pour plan de travail humide.
- Source : https://www.wood-finishes-direct.com/product/rust-oleum-furniture-finishing-wax-clear

### 11. Watco Satin Finishing Wax

- Usage : finition satinee de meubles interieurs et objets bois.
- Points positifs : cire simple, douce, sobre, bonne pour surfaces peu exposees.
- Conseil : lustrer progressivement avec tres peu de produit.
- Precautions : pas pour zones exposees a l'eau.
- Source : https://www.rustoleum.com/product-catalog/consumer-brands/watco/satin-finishing-wax

### 12. Blanchon Renovateur Metallisant Metamat

- Usage : ravivage et protection d'entretien de parquets vitrifies mats.
- Points positifs : produit technique professionnel, evite parfois une renovation lourde.
- Conseil : degraisser et nettoyer avant application.
- Precautions : ne repare pas un vernis traverse jusqu'au bois.
- Source : https://www.blanchon.com/parqueteurs/media/docs-pdf/FT_Renovateur_Metallisant_sat_mat_Web_07_19.pdf

## Savons Et Nettoyants

### 13. Osmo Liquid Wax Cleaner 3029

- Usage : entretien ponctuel des surfaces huilees-cirees, meubles et parquets compatibles.
- Points positifs : nettoie et ravive en un geste, coherent avec TopOil/Polyx.
- Conseil : utiliser tres peu de produit en local.
- Precautions : verifier compatibilite sur finitions non Osmo.
- Source : https://www.osmo.com/finishes/interior-finishes/finishes-for-walls-and-ceilings/liquid-wax-cleaner

### 14. Blanchon Nettoyant Intensif Parquets Huiles

- Usage : decrassage fort de parquets huiles avant entretien ou renovation.
- Points positifs : clarifie la difference entre savon doux et nettoyage intensif.
- Conseil : tester la dilution et rincer correctement.
- Precautions : pas un nettoyant hebdomadaire.
- Source : https://www.blanchon.com/professionnels/nettoyant-intensif.html/

### 15. Rubio Monocoat Surface Care Spray

- Usage : entretien pret a l'emploi des surfaces traitees Rubio.
- Points positifs : tres pratique pour tables et petits meubles.
- Conseil : pulveriser peu et essuyer avec microfibre propre.
- Precautions : pas un decapant, ne pas utiliser sur bois brut.
- Source : https://store.rubiomonocoat.de/products/surface-care

### 16. Rubio Monocoat Universal Soap

- Usage : nettoyage regulier de grandes surfaces traitees Rubio.
- Points positifs : format concentre, coherent avec Oil Plus 2C.
- Conseil : respecter strictement la dilution.
- Precautions : ne jamais laisser d'eau stagner sur le bois.
- Source : https://www.rubiomonocoat.fr/products/universal-soap

### 17. Furniture Clinic Wood Cleaner

- Usage : nettoyage de meubles avant entretien, cire ou creme compatible.
- Points positifs : bon produit de diagnostic avant soin du bois.
- Conseil : travailler avec chiffon blanc pour controler la salissure retiree.
- Precautions : ne remplace pas un decireur.
- Source : https://www.furnitureclinic.co.uk/wood-care-products/wood-cleaners/wood-cleaner

### 18. Starwax Nettoyant Degrisant Bois Exterieurs

- Usage : bois exterieurs ternis, mobilier de jardin, terrasses et caillebotis.
- Points positifs : prepare correctement avant huile ou saturateur.
- Conseil : brosser dans le sens des fibres puis rincer.
- Precautions : gants et lunettes au brossage.
- Source : https://www.starwax.fr/products/starwax-nettoyant-degrisant-pour-bois-exterieurs

## Accessoires Essentiels

### 19. Mirka Abranet Assortiment Feuilles Abrasives

- Usage : poncage propre, egrenage et preparation avant finition.
- Points positifs : reference atelier, moins d'encrassement, tres bon rendu.
- Conseil : ne pas sauter trop vite les grains.
- Precautions : masque et aspiration meme avec maille abrasive.
- Source : https://www.mirka.com/en/products/top-brands/abranet/

### 20. 3M Xtract Cubitron II Net Disc 710W

- Usage : poncage excentrique avec aspiration, plateaux, panneaux, portes.
- Points positifs : coupe rapide, poussiere mieux extraite, marque fiable.
- Conseil : laisser l'abrasif couper sans appuyer.
- Precautions : attention aux placages fins.
- Source : https://eaa.3m.com/3M/en_US/p/d/b5005271034/

### 21. 3M Scotch-Brite Hand Pad 7448 Ultra Fine

- Usage : egrenage, matage leger, travail des reliefs.
- Points positifs : alternative propre a la laine d'acier dans certains cas.
- Conseil : garder des pads separes pour finitions claires et foncees.
- Precautions : depoussierer apres passage.
- Source : https://www.3m.com/3M/en_US/p/d/b40071748/

### 22. Rubio Monocoat White Applicator Pad

- Usage : application et retrait d'excedent d'huiles Rubio.
- Points positifs : limite les erreurs d'application de Oil Plus 2C.
- Conseil : prevoir plusieurs pads pour les grandes surfaces.
- Precautions : traiter les pads huiles comme dechets inflammables potentiels.
- Source : https://www.rubiomonocoatusa.com/products/white-applicator-pad

### 23. Osmo Floor Brush 150 mm

- Usage : application reguliere de finitions Osmo sur surfaces larges.
- Points positifs : meilleur outil qu'un pinceau trop etroit pour plateaux/parquets.
- Conseil : tirer des couches fines dans le sens du fil.
- Precautions : nettoyer immediatement apres usage.
- Source : https://www.osmo.com/uk/finishes/accessories/floor-brush

### 24. Starrett C11MH-300 Equerre Combinee 300 mm

- Usage : tracage, controle d'equerrage, reglage d'atelier.
- Points positifs : outil durable, precision reconnue, tres utile en ebenisterie.
- Conseil : verifier l'equerrage par retournement de temps en temps.
- Precautions : ne pas utiliser comme levier ou outil de frappe.
- Source : https://www.starrett.co.uk/products/precision-hand-tools/combination-squares/c11mhc-300-combination-square/

## Decapage Et Retouches

### 25. Syntilor Decapant Gel Special Bois

- Usage : decapage de vernis, peintures, lasures et anciennes finitions.
- Points positifs : gel pratique sur vertical, alternative au V33 existant.
- Conseil : appliquer epais, laisser agir, retirer dans le sens des fibres.
- Precautions : produit inflammable/irritant, EPI et ventilation.
- Source : https://www.syntilor.com/decapant-gel-special-bois-1.html

### 26. Syntilor Degriseur Nettoyant Bois

- Usage : bois exterieurs grises, terrasses, volets et mobilier.
- Points positifs : preparation claire avant protection exterieure.
- Conseil : mouiller le bois avant application et rincer.
- Precautions : proteger plantes et supports voisins.
- Source : https://www.syntilor.com/degriseur-nettoyant.html

### 27. Rubio Monocoat Tannin Remover

- Usage : taches noires, tanins, reactions eau/acide sur bois traite compatible.
- Points positifs : excellent produit de diagnostic pour tables en chene marquees.
- Conseil : traiter localement puis reprendre la finition si besoin.
- Precautions : test obligatoire, gants et lunettes.
- Source : https://www.rubiomonocoat.fr/products/tannin-remover

### 28. Rubio Monocoat Grease Remover

- Usage : taches grasses recentes sur surfaces traitees Rubio.
- Points positifs : tres utile sur tables et plans huile-cire.
- Conseil : intervenir vite, puis nettoyer avec Surface Care.
- Precautions : pas pour bois brut ou finitions non compatibles.
- Source : https://www.rubiomonocoat.fr/products/grease-remover

### 29. V33 Traitement Bois Meubles et Parquets

- Usage : traitement preventif/curatif insectes et risques biologiques sur bois.
- Points positifs : repond aux meubles anciens attaques ou douteux.
- Conseil : traiter avant rebouchage, cire ou finition decorative.
- Precautions : produit biocide, EPI et ventilation stricte.
- Source : https://www.v33.fr/meubles-parquets-traitement-bois.html

### 30. V33 Vernis Meubles et Boiseries Incolore Satin

- Usage : protection filmogene de meubles, portes et boiseries.
- Points positifs : plus protecteur qu'une cire pour usages courants.
- Conseil : couches fines, depoussierage soigneux.
- Precautions : moins reparable qu'une huile, support cire a decaper.
- Source : https://www.v33.fr/vernis-meubles-et-boiseries-vernis-bois-interieur-chene-clair.html

## Outils Et Materiel Pro

### 31. Narex Richter Ciseaux a Bois Bevel Edge

- Usage : parage, ajustage, assemblages et travaux fins.
- Points positifs : tres bonne alternative aux Kirschen existants.
- Conseil : affutage initial et protection des tranchants.
- Precautions : ne pas faire levier avec un ciseau fin.
- Source : https://www.leevalley.com/en-us/shop/tools/hand-tools/chisels/mortise/117916-narex-richter-mortise-chisels

### 32. Stanley SweetHeart No. 4 Smoothing Bench Plane

- Usage : rabotage de finition, plateaux, chants et reprises propres.
- Points positifs : classique d'atelier, reduit le poncage et la poussiere.
- Conseil : affuter, regler fin, observer le sens du fil.
- Precautions : outil qui demande apprentissage.
- Source : https://www.stanleytools.com/product/12-136/no-4-sweetheart-smoothing-bench-plane

### 33. Gyokucho Razorsaw Ryoba 210 mm

- Usage : coupe fine en traction, delignage leger et tronconnage.
- Points positifs : double denture, trait fin, excellente scie manuelle.
- Conseil : ne pas forcer, laisser les dents travailler en traction.
- Precautions : lame fine fragile en torsion.
- Source : https://www.gyokucho.co.jp/wp-content/uploads/catalog2021.pdf

### 34. Shinto Saw Rasp 9 pouces

- Usage : degrossir courbes, chants, pieds et formes organiques.
- Points positifs : rapide, deux faces, moins d'encrassement qu'une rape classique.
- Conseil : finir au racloir ou abrasif fin pour effacer les stries.
- Precautions : peut marquer tres vite les bois tendres.
- Source : https://www.woodcraft.com/products/shinto-shinto-saw-rasp-9

### 35. Veritas Variable Burnisher

- Usage : former un morfil controle sur racloir d'ebeniste.
- Points positifs : rend les racloirs du Comptoir beaucoup plus exploitables.
- Conseil : dresser l'arete du racloir avant l'affilage.
- Precautions : attention aux aretes coupantes des racloirs.
- Source : https://www.leevalley.com/en-us/shop/tools/sharpening/32633-veritas-variable-burnisher

### 36. Bessey K Body REVO KRE Serre-Joint Parallele

- Usage : collages de plateaux, caissons et assemblages precis.
- Points positifs : mors paralleles, pression stable, reference atelier.
- Conseil : montage a blanc et cales martyr avant encollage.
- Precautions : ne pas sur-serrer et verifier l'equerrage.
- Source : https://besseytools.com/en-us/bessey-tools-north-america/products/clamping-tools/parallel-clamps-and-case-clamps/k-body-variable-jaw-kre-vo-ec36db28915c22c968a8c90a8a9246ec

## Backlog Qualitatif Des Agents

Les agents ont aussi remonte de bons candidats non inclus dans le premier JSON pour ne pas gonfler le lot sans verification ASIN :

- Osmo Cire Deco 3111 Blanc.
- Blanchon Teinte a Bois Chene Fume.
- Blanchon Fond Dur Aqua.
- Liberon Cire Effet Patine Blanc Colombe.
- Liberon Teinte a Effet Bois Flotte.
- Freres Nordin Mattine Gomme Laque.
- Owatrol Dilunett.
- Owatrol Net-Trol.
- Owatrol Aquanett.
- Mauler Decireur bois surpuissant.
- Sinto Repare Bois bi-composant.
- Blanchon Liant Mastic a Bois.
- Bostik PU Bois Exterieur D4.
- Bosch Professional Expert C470.
- Festool Granat D150.
- 3M demi-masque 6502QLKIT A2P3.
- 3M SecureFit 400.
- 3M PELTOR X4A.
- Bahco 2700-22-XT7-HP.

Ces produits peuvent former un deuxieme lot apres revue Amazon.fr et verification anti-doublon.

## Commandes D'Import

Dry-run sandbox :

```bash
node scripts/import-comptoir-new-products.cjs
```

Import sandbox en brouillon :

```bash
node scripts/import-comptoir-new-products.cjs --target=sandbox --apply
```

Import prod interdit sans accord explicite utilisateur. La commande est gardee :

```bash
node scripts/import-comptoir-new-products.cjs --target=prod --apply --i-understand-prod-write
```

Les produits restent `draft` meme apres import. Publication a faire seulement apres validation ASIN, image, prix, vendeur et disponibilite.

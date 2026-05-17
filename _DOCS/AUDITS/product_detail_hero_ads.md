# Page detail produit — audit hero desktop ads

Date : 17 mai 2026

Perimetre : `src/designs/architectural/ArchitecturalProductDetail.jsx`, premier ecran des fiches meubles/planches publiques.

## Objectif

Revamper uniquement le premier ecran desktop de la fiche produit afin de :

- garder les informations produit principales dans le viewport desktop 1920x1080 ;
- preparer des emplacements Google Ads autour de l'image principale ;
- adapter le cadre image aux formats portrait et paysage ;
- ne pas modifier les modules situes plus bas, notamment `Vous aimerez aussi`, `Tuto Atelier` et les piliers de rassurance.

## Audit structurel FrontSymmetry

- Parent hero : conteneur racine du premier ecran, en flow, avant les sections basses.
- Colonne image : enfant gauche du hero, anciennement `lg:w-1/2` avec hauteur fixe `calc(100vh - 6rem)`.
- Colonne informations : enfant droit du hero, anciennement `lg:w-1/2`, contenu centre verticalement.
- Sections basses : soeurs apres le hero, hors du conteneur modifie.
- Risque identifie : modifier le `padding` ou la hauteur globale du parent pouvait pousser les sections basses et ne garantissait pas que le contenu tienne dans le viewport.
- Strategie retenue : transformer seulement le hero en grille desktop bornee, avec `lg:overflow-hidden`, et compacter les sous-blocs internes sans changer les textes ni les CTA.

## Changements appliques

- Ajout de `ProductDetailAdSlot` pour les emplacements publicitaires de test : haut de l'image, lateral gauche, lateral droit.
- Hero desktop passe en grille : colonne media fluide + colonne informations bornee a droite.
- Colonne gauche : grille interne desktop avec bouton retour, slot annonce horizontal, deux slots verticaux et image principale.
- Image principale : detection des dimensions naturelles via `onLoad`, stockage local dans `imageSizes`, puis choix dynamique entre cadre portrait et cadre paysage.
- Portrait : image en `object-contain`, cadre vertical limite en largeur pour eviter l'ecrasement.
- Paysage : image en `object-cover`, cadre horizontal conserve.
- Colonne droite : compactage des espacements, description bornee par `clamp`, titre/prix/specs ajustes pour tenir dans le premier ecran desktop.

## Non-regression attendue

- Aucune route publique modifiee.
- Aucune donnee Firestore modifiee.
- Aucun changement sur les sections situees sous le hero.
- Le lightbox conserve le comportement existant.
- Le bouton d'acquisition, les encheres, la livraison, les specs et le texte produit restent affiches.

## Verification

- `git diff --check -- src/designs/architectural/ArchitecturalProductDetail.jsx` : OK.
- `npm run build` : OK, avec warnings Vite existants de CSS/chunks volumineux sans lien bloquant avec ce changement.
- Preview locale detectee sur `http://localhost:5173` et ouverte via browser preview.

## Ajustement visuel du 17 mai 2026 16:57

- Bouton `Retour Collection` et annonce haute regroupes sur la meme ligne desktop.
- Annonce haute raccourcie pour ne plus occuper toute la largeur de la colonne image.
- Colonne gauche remontee avec `lg:pt-3` et marge basse augmentee avec `lg:pb-10`.
- Bloc media limite par `lg:max-h-[760px]` afin que l'image et les annonces laterales ne touchent plus le bas de l'ecran.
- Espaces lateraux entre annonces verticales et image supprimes via une disposition `flex` sans gap desktop.
- Verification relancee : `git diff --check` OK et `npm run build` OK.

## Ajustement formats mixtes du 17 mai 2026 17:02

- Les fleches de navigation ne sont plus ancrees au cadre image variable : elles sont placees sur un `stage` central stable entre les annonces.
- Le `stage` central garde une zone d'interaction constante meme quand une publication alterne entre formats paysage et portrait.
- Le cadre image utilise le ratio naturel charge (`naturalWidth / naturalHeight`) via `aspectRatio`, afin de supprimer les bandes noires en haut/bas sur les formats paysage atypiques.
- La taille des images est plafonnee (`lg:max-w-[760px]` pour les paysages, `lg:max-h-[660px]` pour les portraits) pour eviter les images trop grandes et les superpositions avec les annonces.
- Verification relancee : `git diff --check` OK et `npm run build` OK.

## Reste a valider visuellement

- Calibrage exact sur le produit long vu en capture, en 1920x1080.
- Rendu des images tres verticales et tres horizontales avec les vrais assets du catalogue.
- Dimensions finales des emplacements Google Ads avant integration d'un script publicitaire reel.

# Normalisation des images admin

Date: 2026-05-07

## Contexte

Un client pouvait importer certaines photos depuis mobile et obtenir des cases blanches dans le formulaire mobilier/planches. Le contournement manuel etait de faire une capture d'ecran puis de reimporter cette capture.

Le probleme a ete reproduit avec l'option photo haute performance / haute efficacite activee sur mobile: la photo importee etait en HEIF. Le navigateur pouvait accepter le fichier dans le champ d'import, mais l'apercu et/ou le pipeline canvas pouvaient produire une case blanche.

Le contournement par capture d'ecran fonctionnait parce que la capture ressortait dans un format plus classique et mieux supporte par le navigateur, typiquement PNG/JPEG.

## Cause confirmee

La cause confirmee est le format HEIF/HEIC issu du mode photo haute efficacite.

Deux points etaient necessaires pour regler le cas reel:

- convertir explicitement les fichiers HEIF/HEIC en JPEG avant de les envoyer dans le canvas;
- autoriser les workers `blob:` dans la CSP Firebase Hosting, car la librairie de conversion HEIF utilise un worker. Sans `worker-src 'self' blob:`, l'interface pouvait rester bloquee sur "Conversion...".

## Decision

Les images importees dans `src/features/admin/AdminForm.jsx` passent par un sas de normalisation avant publication:

- le navigateur decode l'image;
- les fichiers HEIC/HEIF sont d'abord convertis en JPEG via `heic2any`;
- l'image est redessinee dans un canvas;
- le canvas exporte un fichier stable en WebP haute qualite, avec fallback JPEG;
- l'apercu admin est remplace par cette version normalisee;
- l'upload Firebase Storage utilise uniquement le fichier normalise;
- si la normalisation echoue, la publication est bloquee pour cette image.

La normalisation est dans `src/utils/imageUtils.js`.

La correction qui a vraiment debloque le cas HEIF en production est donc le couple:

1. dependance `heic2any` + detection `.heic/.heif` ou MIME `image/heic` / `image/heif`;
2. CSP Hosting dans `firebase.json` avec `worker-src 'self' blob:`.

## Qualite

Parametres actuels:

- dimension maximale: 1920 px sur le plus grand cote;
- qualite: 0.9;
- format prefere: `image/webp`;
- fallback: `image/jpeg`;
- conversion HEIC/HEIF intermediaire: `heic2any` vers JPEG;
- la CSP Hosting autorise `worker-src 'self' blob:` pour les workers de `heic2any`;
- timeout conversion HEIC/HEIF: 45 secondes;
- fond blanc pour aplatir proprement les images avec transparence.

Ces valeurs gardent une qualite suffisante pour les fiches meubles/planches tout en evitant les fichiers trop lourds.

## Limites connues

La conversion HEIC/HEIF depend de `heic2any` et peut echouer sur certains fichiers tres atypiques ou corrompus. Dans ce cas, l'image reste bloquee avec un message clair au lieu d'etre publiee sous forme de case blanche.

## Fichiers touches

- `src/utils/imageUtils.js`
- `src/features/admin/AdminForm.jsx`
- `firebase.json`
- `AGENTS.md`
- `_DOCS/IMAGE_UPLOAD_NORMALIZATION.md`
- `package.json`
- `package-lock.json`

## Verification

A lancer apres modification:

```bash
npm run build
```

Verification manuelle recommandee:

- importer une photo JPEG Android standard;
- importer une tres grande photo mobile;
- importer une image PNG avec transparence;
- importer une photo HEIF/HEIC prise avec le mode photo haute efficacite et verifier qu'elle est convertie, visible en apercu, puis publiee sans case blanche;
- verifier que l'etat "Conversion..." disparait bien apres la conversion;
- verifier la creation d'un meuble et d'une planche sans toucher au comportement de la grille publique.

## Verification terrain

Le 2026-05-07, le probleme a ete reproduit avec une photo HEIF issue du mode haute efficacite, puis valide comme corrige apres ajout de la conversion `heic2any` et de la directive CSP `worker-src 'self' blob:`.

Deploiements effectues apres validation:

- production Hosting: projet `tousatable-client`;
- sandbox Hosting: projet `tatmadeinnormandie`.

## Extension sandbox du 2026-05-29 - ratios images catalogue

Objectif: tester en sandbox un placement masonry plus stable sans mesurer les cartes pendant le scroll.

Changements:

- `src/utils/imageUtils.js` expose `getImageFileDimensions(file)` pour lire largeur, hauteur et ratio hauteur/largeur apres normalisation.
- `src/features/admin/AdminForm.jsx` conserve ces metriques sur les nouvelles images et ecrit `imageDimensions`, `primaryImageWidth`, `primaryImageHeight`, `primaryImageAspectRatio` a la publication.
- Le recadrage admin recalcule aussi les metriques de l'image recadree.
- `src/designs/architectural/components/ProductCard.jsx` et `src/designs/architectural/MarketplaceLayout.jsx` utilisent ces champs avant le fallback 4/5 ou le cache runtime.
- Script sandbox: `scripts/backfill-sandbox-image-ratios.cjs`.

Migration sandbox:

- Commande appliquee: `node scripts/backfill-sandbox-image-ratios.cjs --apply`.
- Projet ecrit: `tatmadeinnormandie` uniquement.
- Resultat: 103 documents enrichis sur 111; 8 documents ignores car leur image principale repond en HTTP 404.
- Aucune ecriture Firestore prod, aucune modification rules.

Verification:

- `npm run build` OK.
- `firebase deploy --only hosting --project tatmadeinnormandie` OK.
- Verification navigateur: `/meubles-anciens` charge sans erreur console et le tri par defaut reste `Selection variee`.

## Deploiement prod du 2026-05-29 - ratios images catalogue

Changements deployes en production:

- Pipeline admin: les nouvelles publications ecrivent `imageDimensions`, `primaryImageWidth`, `primaryImageHeight`, `primaryImageAspectRatio`.
- Galerie publique: les cartes utilisent ces metriques avant le cache runtime ou le fallback 4/5.
- Script de backfill: `scripts/backfill-sandbox-image-ratios.cjs` accepte maintenant `--prod` en dry-run et exige `--prod --apply --confirm-prod-write` pour ecrire en prod.

Migration production:

- Dry-run prod: 84 documents scannes, 84 mises a jour prevues, 0 echec.
- Application prod: 84 documents enrichis, 0 echec.
- Dry-run final prod: 84 documents deja enrichis, 0 mise a jour restante.

Verification:

- `npm run preflight:prod` OK.
- `firebase deploy --only hosting --project tousatable-client` OK.
- `npm run audit:public-seo` OK, 32 checks.
- `publicCatalog` prod HTTP 200.
- Verification navigateur prod: `/meubles-anciens` charge sans erreur console; la premiere ligne utilise des ratios stockes et un tri varie stable.

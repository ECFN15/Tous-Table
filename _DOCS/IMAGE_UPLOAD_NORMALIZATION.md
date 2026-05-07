# Normalisation des images admin

Date: 2026-05-07

## Contexte

Un client pouvait importer certaines photos depuis mobile et obtenir des cases blanches dans le formulaire mobilier/planches. Le contournement manuel etait de faire une capture d'ecran puis de reimporter cette capture.

Le comportement pointe vers des fichiers photo mobiles lisibles par l'appareil, mais fragiles pour le pipeline web: HEIC/HEIF, HDR/Ultra HDR, profils couleur, metadata complexe, ou images tres lourdes.

## Decision

Les images importees dans `src/features/admin/AdminForm.jsx` passent par un sas de normalisation avant publication:

- le navigateur decode l'image;
- les fichiers HEIC/HEIF sont d'abord convertis en JPEG via `heic2any`;
- l'image est redessinee dans un canvas;
- le canvas exporte un fichier stable en WebP haute qualite, avec fallback JPEG;
- l'aperçu admin est remplace par cette version normalisee;
- l'upload Firebase Storage utilise uniquement le fichier normalise;
- si la normalisation echoue, la publication est bloquee pour cette image.

La normalisation est dans `src/utils/imageUtils.js`.

## Qualite

Parametres actuels:

- dimension maximale: 1920 px sur le plus grand cote;
- qualite: 0.9;
- format prefere: `image/webp`;
- fallback: `image/jpeg`;
- conversion HEIC/HEIF intermediaire: `heic2any` vers JPEG;
- fond blanc pour aplatir proprement les images avec transparence.

Ces valeurs gardent une qualite suffisante pour les fiches meubles/planches tout en evitant les fichiers trop lourds.

## Limites connues

La conversion HEIC/HEIF depend de `heic2any` et peut echouer sur certains fichiers tres atypiques ou corrompus. Dans ce cas, l'image reste bloquee avec un message clair au lieu d'etre publiee sous forme de case blanche.

## Fichiers touches

- `src/utils/imageUtils.js`
- `src/features/admin/AdminForm.jsx`
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
- tenter un fichier HEIC/HEIF si disponible et verifier que la publication est bloquee avec un message lisible;
- verifier la creation d'un meuble et d'une planche sans toucher au comportement de la grille publique.

# Mapping categories meubles prod legacy

## Pourquoi ce fichier existe

Le site utilise `src/data/legacyFurnitureCategories.js` pour classer certains meubles de production par ID stable.

Ce mapping est une securite de transition :

- il evite d'ecrire dans Firestore prod uniquement pour corriger une categorie ;
- il permet aux anciens meubles publies avant la normalisation du champ `category` de rester affiches dans les bons filtres ;
- il bloque un deploiement prod si un meuble prod n'est pas classe, via `npm run verify:prod-furniture` inclus dans `npm run preflight:prod`.

Le mapping est uniquement cote frontend. Il ne doit jamais etre reinjecte automatiquement dans Firestore.

## Probleme actuel

Le systeme est sur mais pas ideal.

Quand un nouveau meuble existe en production et que son ID n'est pas encore dans `src/data/legacyFurnitureCategories.js`, le preflight prod echoue avec une sortie du type :

```text
missing: ["ID_DU_MEUBLE"]
```

Cela force une modification de code avant de pouvoir deployer, meme si le meuble possede deja un champ `category` dans Firestore.

Exemple rencontre le 2026-05-16 :

- `A89ATxl7ULCgYpRIHZcI` : Console en rotin, categorie `autre`
- `vnEaQJ75pTTYwglvCll0` : Table exterieur sur mesures, categorie `table`

Ces deux IDs ont ete ajoutes au mapping local pour debloquer le preflight, sans ecriture Firestore prod.

## Methode actuelle avant deploy prod

1. Lancer `npm run preflight:prod`.
2. Si `verify:prod-furniture` signale des IDs manquants, ne pas deployer.
3. Lire les documents prod concernes en lecture seule.
4. Ajouter les IDs manquants dans `src/data/legacyFurnitureCategories.js`.
5. Relancer `npm run preflight:prod`.
6. Deployer uniquement si le preflight est vert.

## TODO long terme

Objectif : supprimer la dependance au mapping manuel pour les nouveaux meubles, tout en gardant une compatibilite propre pour les anciens documents.

### 1. Auditer les donnees prod

- Verifier que chaque document `furniture` prod possede un champ `category` valide.
- Categories valides attendues : `buffet`, `table`, `chaise`, `armoire`, `commode`, `autre`.
- Identifier les anciens meubles sans `category` ou avec une valeur invalide.

### 2. Migrer proprement les categories manquantes

- Preparer un script de migration explicite, relu avant execution.
- Ne jamais lancer cette migration sans accord utilisateur.
- La migration doit uniquement ecrire le champ `category` manquant ou invalide sur les meubles prod concernes.
- Journaliser uniquement les IDs et les categories appliquees, jamais de secret.

### 3. Adapter le code frontend

- Garder `getFurnitureCategory(item)` comme point d'entree unique.
- Prioriser `item.category` quand il est valide.
- Utiliser `LEGACY_FURNITURE_CATEGORY_BY_ID` uniquement comme fallback pour les anciens documents.
- Ne pas supprimer le mapping tant qu'il reste au moins un meuble legacy non migre.

### 4. Adapter le gate `verify:prod-furniture`

Le gate doit accepter un meuble prod si :

- son champ Firestore `category` est valide ;
- ou son ID est present dans `LEGACY_FURNITURE_CATEGORY_BY_ID`.

Le gate doit continuer a echouer si :

- un meuble n'a ni categorie Firestore valide ni fallback mapping ;
- une categorie est hors liste ;
- le mapping contient des IDs qui n'existent plus en prod, sauf decision explicite de garder une archive.

### 5. Nettoyer progressivement

- Apres migration complete, reduire le mapping aux seuls vrais cas historiques.
- Documenter la date de migration dans ce fichier.
- Mettre a jour `_DOCS/DEPLOIEMENT_PROD_RUNBOOK.md` et `_DOCS/PROD_READINESS_STATUS.md`.

## Decision actuelle

Court terme : conserver le mapping, car il protege les deploiements prod sans ecrire dans Firestore.

Long terme : migrer les categories dans Firestore prod et transformer le mapping en fallback legacy uniquement.

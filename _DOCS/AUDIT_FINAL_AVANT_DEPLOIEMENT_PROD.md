# Audit final avant deploiement prod

Date: 2026-05-06

Verdict: deploiement controle Functions puis Hosting effectue le 2026-05-06 avec `--project tousatable-client`.

Ce document fige l'audit avant deploiement. Objectif: verifier que les meubles du client restent intacts en production, tout en etant bien ranges dans la nouvelle interface de galerie/categories.

## Regle principale

- Ne pas importer la sandbox vers la prod.
- Ne pas ecrire dans Firestore prod pour classer les anciens meubles.
- Ne pas lancer `firebase deploy` sans `--project tousatable-client`.
- Ne pas utiliser `npm --prefix functions run deploy` pour la prod, car ce script n'a pas de projet explicite.

## Etat du CLI Firebase

Le projet courant du CLI est `tatmadeinnormandie` (sandbox).

Conclusion: toute commande prod doit etre complete:

```bash
firebase deploy --only functions --project tousatable-client
firebase deploy --only hosting --project tousatable-client
```

## Protection des meubles prod

La strategie ne modifie pas les documents `furniture` en production.

Les meubles deja publies sont ranges par l'interface dans cet ordre:

1. `item.category` si le champ existe deja dans Firestore.
2. mapping par ID stable via `src/data/legacyFurnitureCategories.js`.
3. fallback par nom via `getFurnitureCategory()`.
4. `autre`.

Le mapping legacy est un fichier frontend. Il ne fait aucune ecriture Firestore.

Un fallback HTTP `publicCatalog` est aussi deploye cote Functions. Il lit uniquement les collections publiques via Admin SDK et hydrate le frontend si une lecture Firestore publique est bloquee cote navigateur par App Check/reCAPTCHA. Il ne modifie aucune donnee.

## Verification des 28 meubles prod

Commande executee:

```bash
npm run verify:prod-furniture
```

Resultat:

- Projet lu: `tousatable-client`.
- Namespace: `tat-made-in-normandie`.
- Collection: `artifacts/tat-made-in-normandie/public/data/furniture`.
- Meubles prod: 28.
- IDs dans le mapping: 28.
- Manquants: 0.
- Extras: 0.
- Categories invalides: 0.

Repartition:

- `table`: 13
- `buffet`: 7
- `armoire`: 3
- `commode`: 2
- `chaise`: 1
- `autre`: 2

Conclusion: les 28 meubles actuels du client sont couverts par le mapping sans modification de base.

## Nouveaux meubles admin

Dans `src/features/admin/AdminForm.jsx`:

- la categorie est obligatoire a la creation d'un nouveau meuble;
- le champ est stocke dans `furniture.category`;
- les planches ne recoivent pas de champ `category`;
- un ancien meuble edite peut rester sans categorie, pour eviter une ecriture forcee sur le legacy.

Conclusion: les nouveaux meubles utiliseront la vraie categorie Firestore; les anciens restent intacts.

## Build et bundle prod

Commande executee:

```bash
npm run preflight:prod
```

Le preflight couvre:

- verification `.env.prod`;
- mapping meubles prod;
- syntaxe Functions;
- build prod;
- scan du bundle prod;
- audit Functions env prod sans afficher les valeurs sensibles.

Resultat: OK.

Scan bundle:

- 38 fichiers scannes;
- pas de config sandbox;
- pas de cle Stripe test;
- pas de placeholder Stripe;
- pas de loader `js.stripe.com` actif avec carte desactivee.

## Stripe et checkout

Decision actuelle: les paiements carte ne font pas partie du lancement.

Protections en place:

- `VITE_STRIPE_CARD_PAYMENTS_ENABLED=false`;
- `CheckoutView` force `stripeEnabled=false`;
- `paymentMethod` demarre en `deferred`;
- meme si Firestore indique `stripeEnabled=true`, le build garde la carte desactivee;
- `main.jsx` ne charge Stripe que si la carte est activee et qu'une cle `pk_` existe.

Conclusion: le checkout reste sur paiement differe (virement/Wero), sans carte.

## Functions

Correction locale:

- `syncSession` ignore une session manquante et retourne `{ success: true, missing: true }`;
- `syncSessionBeacon` ignore une session manquante et repond `204`;
- le cas 500 sur document absent est traite.

Controle:

```bash
npm run verify:functions-syntax
```

Resultat: OK via `npm run preflight:prod`.

## Ce que les commandes recommandees ne touchent pas

Avec:

```bash
firebase deploy --only functions --project tousatable-client
firebase deploy --only hosting --project tousatable-client
```

On ne deploie pas:

- Firestore data;
- migration de meubles;
- import sandbox;
- Firestore rules;
- Storage rules.

On deploie seulement:

- Functions;
- Hosting depuis `dist`.

## Risques restants

Risque meuble prod: faible. Aucune ecriture data n'est prevue ni necessaire pour les categories.

Risques operationnels:

- les Functions prod ont encore des legacy env vars attachees;
- nettoyage/rotation recommandes apres deploiement controle;
- le smoke test prod doit etre fait immediatement apres Hosting.

## Smoke test post-deploiement

Verifier immediatement:

- home;
- galerie;
- filtres `buffet`, `table`, `chaise`, `armoire`, `commode`, `autre`;
- fiche produit directe;
- images/prix/dimensions/CTA panier;
- panier;
- checkout virement/Wero;
- Comptoir;
- admin login;
- publication test d'un nouveau meuble avec categorie;
- absence de 500 `syncSessionBeacon`.

## Rollback

Hosting:

- Firebase Console -> Hosting -> Releases -> Roll back vers la release precedente.

Functions:

- revenir au commit precedent;
- redeployer uniquement Functions:

```bash
firebase deploy --only functions --project tousatable-client
```

Data:

- pas de rollback data prevu pour les categories, car aucune ecriture Firestore prod n'est faite.

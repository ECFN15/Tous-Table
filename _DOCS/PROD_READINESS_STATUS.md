# Readiness production - Etat actuel

Date: 2026-05-08

Verdict: deploye en production le 2026-05-08 sur Hosting uniquement, en ciblant explicitement `--project tousatable-client`. Les Functions n'ont pas ete redeployees car les changements etaient frontend.

Decision paiement: les paiements carte ne font pas partie du lancement actuel. `.env.prod` force `VITE_STRIPE_CARD_PAYMENTS_ENABLED=false`, le reglage prod `sys_metadata/payment_settings` est deja `stripeEnabled=false` en lecture seule, et Stripe JS n'est importe dynamiquement que si une vraie cle `pk_` est fournie.

## Ce qui est pret

- Build sandbox/local: OK via `npm run build`.
- Mapping categories meubles prod: OK via `npm run verify:prod-furniture`.
- Anciens meubles prod: couverts par mapping ID frontend, sans ecriture Firestore.
- Nouveaux meubles: `item.category` reste prioritaire.
- `syncSessionBeacon`: correction locale pour traiter une session absente comme non fatale.
- `publicCatalog`: fallback HTTP public deploye pour hydrater galerie/comptoir si App Check/reCAPTCHA bloque une lecture Firestore publique cote navigateur.
- Garde build prod: `npm run build:prod` bloque si la config n'est pas prod. Stripe live est exige uniquement si `VITE_STRIPE_CARD_PAYMENTS_ENABLED=true`.
- Stripe frontend: la promesse Stripe retourne `null` sans vraie cle `pk_`, donc le loader Stripe n'est pas appele pour le lancement sans carte.
- Preflight unique: `npm run preflight:prod`.
- Syntaxe Functions: `npm run verify:functions-syntax`.
- Bundle prod: `npm run verify:prod-bundle`.
- Audit Functions env: `npm run audit:functions-env -- --project=tousatable-client`.
- Runbook prod: `_DOCS/DEPLOIEMENT_PROD_RUNBOOK.md`.

## Preuves recentes

Deploiement Hosting du 2026-05-08 - checkout virement/Wero et footer mobile :

- Accord utilisateur explicite : demande "deploy en prod [production_workflow.md](.agent/workflows/production_workflow.md)".
- Workflow lu : `.agent/workflows/production_workflow.md`.
- Runbook prod lu : `_DOCS/DEPLOIEMENT_PROD_RUNBOOK.md`.
- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK, release Hosting publiee.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/meubles-anciens` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/comptoir` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/admin` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Deploiement volontairement limite : Hosting uniquement ; aucune Function, aucune regle Firestore/Storage et aucune ecriture Firestore prod.

Deploiement Functions analytics + Hosting du 2026-05-08 - reprise session 1h et KPI unique :

- Accord utilisateur explicite : demande "deploy en prod ! .agent\workflows\production_workflow.md".
- Workflow lu : `.agent\workflows\production_workflow.md`.
- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only functions:initLiveSession,functions:syncSession,functions:syncSessionBeacon,functions:updateUserSessions --project tousatable-client` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Audit Functions prod apres deploy : 30 Functions, 30 avec legacy env vars, 90 legacy env vars au total, 11 secrets attaches ; aucune valeur sensible affichee.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/meubles-anciens` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/comptoir` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/admin` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Deploiement volontairement limite : Functions analytics ciblees + Hosting ; aucune regle Firestore/Storage redeployee et aucune ecriture Firestore prod.

Deploiement Functions analytics + Hosting du 2026-05-08 - fiabilite visiteurs uniques :

- Accord utilisateur explicite : demande "ok deploy en prod avec .agent\workflows\production_workflow.md".
- Workflow lu : `.agent\workflows\production_workflow.md`.
- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only functions:initLiveSession,functions:syncSession,functions:syncSessionBeacon,functions:updateUserSessions --project tousatable-client` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Audit Functions prod apres deploy : 30 Functions, 30 avec legacy env vars, 90 legacy env vars au total, 11 secrets attaches ; aucune valeur sensible affichee.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/meubles-anciens` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/comptoir` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/admin` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Deploiement volontairement limite : Functions analytics ciblees + Hosting ; aucune regle Firestore/Storage redeployee et aucune ecriture Firestore prod.

Deploiement Hosting du 2026-05-08 - reveal mobile preloader titre :

- Accord utilisateur explicite : demande "push en prod".
- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK, release Hosting publiee.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/meubles-anciens` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/comptoir` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/admin` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Non deploye volontairement : Functions et Firestore rules, car la passe ne concernait que le frontend Hosting.

Deploiement Hosting du 2026-05-08 - optimisations mobiles Comptoir/recommandations :

- Accord utilisateur explicite : demande "deploy en prod".
- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK, release Hosting publiee.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/meubles-anciens` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/comptoir` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/admin` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Non deploye volontairement : Functions et Firestore rules, car la passe ne concernait que le frontend Hosting.

Deploiement Hosting + Firestore rules du 2026-05-08 - retrait newsletter :

- Accord utilisateur explicite : demande "deploy en prod".
- `npm run preflight:prod` : OK.
- `firebase deploy --only hosting,firestore:rules --project tousatable-client` : OK.
- Firestore rules compilees et publiees : `newsletter_subscribers` bloque cote client (`allow read, create, update, delete: if false`).
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/meubles-anciens` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/comptoir` HTTP 200.
- Smoke public : `https://tousatable-madeinnormandie.fr/admin` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Verification bundle local `dist`/`src` : aucune reference active a `NewsletterModal`, `AdminNewsletter`, `newsletter_subscribers`, `newsletterSubscribed`, `newsletterDismissed` ou `showNewsletter`.

Deploiement Hosting du 2026-05-08 - preloader et marketplace :

- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK, release Hosting publiee.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.

`npm run preflight:prod` du 2026-05-08 apres ajustements preloader :

- Firebase prod valide.
- Mapping meubles prod valide : 29 meubles prod, mapping 29, aucun manquant, aucun extra, aucune categorie invalide.
- SEO roadmap : 16 checks passes.
- Analytics reliability : OK.
- Syntaxe Functions : OK.
- Build prod : OK.
- Bundle prod : OK, aucune config sandbox ni loader Stripe actif.
- Audit Functions prod : 30 Functions, 30 avec legacy env vars, 90 legacy env vars au total, 11 secrets attaches ; aucune valeur sensible affichee.

Deploiement Hosting du 2026-05-08 :

- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- `firebase deploy --only hosting --project tousatable-client` : OK, release Hosting publiee.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Smoke public : `https://tousatable-madeinnormandie.fr/` HTTP 200.
- Smoke public : `https://tousatable-client.web.app/` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.

`npm run preflight:prod` du 2026-05-08 :

- Firebase prod valide.
- Mapping meubles prod valide : 29 meubles prod, mapping 29, aucun manquant, aucun extra, aucune categorie invalide.
- SEO roadmap : 16 checks passes.
- Analytics reliability : OK.
- Syntaxe Functions : OK.
- Build prod : OK.
- Bundle prod : OK, aucune config sandbox ni loader Stripe actif.
- Audit Functions prod : 30 Functions, 0 legacy env vars, 11 secrets attaches ; aucune valeur sensible affichee.

`npm run verify:prod-furniture`:

- Projet lu: `tousatable-client`.
- Namespace: `tat-made-in-normandie`.
- Meubles prod: 28.
- Mapping legacy: 28.
- Manquants: 0.
- Extras: 0.
- Categories invalides: 0.
- Repartition: buffet 7, table 13, autre 2, commode 2, chaise 1, armoire 3.

`npm run preflight:prod`:

- OK.
- Firebase prod valide.
- Mapping meubles prod valide.
- Syntaxe Functions valide.
- Build prod OK.
- Bundle prod valide: pas de config sandbox, pas de cle Stripe test, pas de placeholder Stripe, pas de loader Stripe actif.
- Audit Functions prod execute sans afficher de valeurs sensibles.

`npm run audit:functions-env -- --project=tousatable-client` apres deploiement:

- Functions prod: 30.
- Functions avec legacy env vars: 30.
- Total legacy env vars: 198.
- Secrets attaches: 11.
- Aucune valeur sensible affichee par le script.

Deploiement Hosting du 2026-05-12 :

- Accord utilisateur explicite recu pour deployer en prod avec `.agent\workflows\production_workflow.md`.
- Runbook prod relu : `_DOCS/DEPLOIEMENT_PROD_RUNBOOK.md`.
- `firebase use` initial : `tatmadeinnormandie`.
- `firebase use prod` : alias prod actif sur `tousatable-client`.
- `npm run preflight:prod` : OK.
- Mapping meubles prod valide : 30 meubles prod, mapping 30, aucun manquant, aucun extra, aucune categorie invalide.
- SEO roadmap : 16 checks passes.
- Analytics reliability : OK.
- Syntaxe Functions : OK.
- Build prod : OK. Avertissement Vite conserve sur certains chunks > 500 kB.
- Bundle prod : OK, aucune config sandbox ni loader Stripe actif.
- Audit Functions prod : 30 Functions, 30 avec legacy env vars, 90 legacy env vars au total, 11 secrets attaches ; aucune valeur sensible affichee.
- `firebase deploy --only hosting --project tousatable-client` : OK, release Hosting publiee.
- `firebase use default` : retour sur `tatmadeinnormandie`.
- Smokes publics : `/`, `/meubles-anciens`, `/planches-a-decouper-anciennes`, `/comptoir`, `/admin`, `https://tousatable-client.web.app/` et `publicCatalog` HTTP 200.
- `npm run audit:public-seo` : OK, 32 checks passes.
- Aucune ecriture Firestore prod, aucune modification rules, aucun deploiement Functions.

## Reste a suivre

1. Decider le traitement des legacy env vars Functions: nettoyage + rotation recommandes.
2. Surveiller les logs `syncSessionBeacon` et `publicCatalog`.
3. Faire une validation manuelle admin login/publication quand disponible.

## Non fait volontairement

- Aucune ecriture Firestore prod.
- Aucune migration sandbox vers prod.
- Aucune importation de meubles test.

## Commande de reprise

Avant de reprendre:

```bash
npm run preflight:prod
```

Si le preflight passe, suivre le runbook:

```bash
_DOCS/DEPLOIEMENT_PROD_RUNBOOK.md
```

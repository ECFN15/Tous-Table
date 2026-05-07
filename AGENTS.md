# AGENTS.md - Point d'entree des agents IA

Ce fichier est le chef d'orchestre du projet. Lis-le en premier, puis va seulement vers les documents specialises utiles a ta tache.

## Regles prioritaires

- Ne jamais deployer en production sans accord explicite de l'utilisateur.
- Ne jamais ecrire dans Firestore prod sans validation explicite.
- Ne jamais consigner de valeur de secret dans les logs, documents ou reponses.
- Ne pas casser la grille principale meubles/planches ni son comportement de filtres.
- Si une route publique ou un libelle de page change, verifier `src/features/admin/AdminAnalytics.jsx`.
- Respecter les changements non commites existants : ne pas les revert sans demande claire.

## Documents a lire selon la tache

- SEO, routes, sitemap, schemas, Search Console : lire `SEOlivre.md`.
- Checks publics Google apres deploy SEO : lire `_DOCS/SEO_PUBLIC_GOOGLE_CHECKS.md`.
- Historique technique complet des anciens agents : lire `_DOCS/AGENTS_HISTORY.md`.
- Analytics admin, sessions, visiteurs uniques, IP, fiabilite du tracking : lire `_DOCS/ANALYTICS_RELIABILITY.md`.
- Deploiement production : lire `_DOCS/DEPLOIEMENT_PROD_RUNBOOK.md`.
- Etat de readiness prod : lire `_DOCS/PROD_READINESS_STATUS.md`.
- Securite, regles, risques : lire `_DOCS/SECURITE.md` et `firestore.rules`.
- Architecture et donnees Firestore : lire `architecture_firestore_rules.md`, `migrationfirestore.md`, `migrationprodtosandbox.md`.
- Comptoir, produits affilies, tracking client, fiches detail avant Amazon : lire `_DOCS/COMPTOIR_PRODUCT_DETAIL_AUDIT.md`.
- Import images admin mobilier/planches, formats mobiles, cases blanches : lire `_DOCS/IMAGE_UPLOAD_NORMALIZATION.md`.
- Audits anciens : lire `_DOCS/AUDITS/` et `audit/` seulement si la tache concerne le sujet.
- Commandes utiles : lire `_DOCS/COMMANDS.md` et `package.json`.

## Roadmap SEO active

Source de verite : `SEOlivre.md`.

Commandes :

- `npm run verify:seo-roadmap` : gate SEO rapide.
- `npm run preflight:prod` : preflight complet, inclut `verify:seo-roadmap`.
- `npm run audit:public-seo` : audit du domaine public apres deploy SEO, verifie sitemap, routes propres, robots.txt et `shareMeta`.

Le gate SEO verifie les routes SEO, sitemap/shareMeta, schemas JSON-LD, canonical, libelles analytics admin, absence de `xlsx`, durcissement `affiliate_clicks` et presence des chapitres d'audit.

Ce gate ne remplace pas :

- smoke visuel manuel ;
- Search Console ;
- Rich Results Test ;
- verification publique apres deploy.

## Avant une modification

1. Lire le document specialise correspondant.
2. Inspecter les fichiers existants avant de modifier.
3. Garder les changements scopes au besoin reel.
4. Noter dans le document specialise ce qui a ete change, teste et ce qui reste a faire.

## Avant tout deploy prod

1. Obtenir l'accord explicite de l'utilisateur.
2. Lancer :

```bash
npm run preflight:prod
```

3. Verifier que le preflight ne montre aucun secret et aucun echec.
4. Relire le runbook prod avant la commande de deploy.

## Etat connu recent

- Functions prod : Node.js 22, 30/30 actives, env vars legacy nettoyees.
- Secrets prod : branches via Secret Manager, ne jamais afficher les valeurs.
- SEO local : routes propres, sitemap/shareMeta, schemas et gate automatisable en place.
- Securite runtime/prod : dernier `npm audit --omit=dev` connu a 0 vulnerabilite.
- Alertes restantes : deux alertes dev-only `vite/esbuild`, correction necessitant une migration majeure Vite.

## Journal historique

L'ancien `AGENTS.md` et ses entrees detaillees ont ete deplaces dans :

`_DOCS/AGENTS_HISTORY.md`

Ne remets pas tout l'historique dans ce fichier. Ajoute ici seulement les decisions d'orchestration qui doivent etre lues en premier.

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

## Decisions cout Firebase

- Catalogue public : les visiteurs publics doivent privilegier `publicCatalog` et son cache Function/HTTP au lieu d'ouvrir des listeners Firestore complets sur les collections catalogue. Le temps reel Firestore reste acceptable pour l'admin et comme fallback si `publicCatalog` echoue. Objectif : eviter de relire toute la base catalogue a chaque visiteur.
- Produits affilies / clics : les ecrans admin ne doivent pas lire toute la collection `affiliate_clicks` en live. Utiliser une limite raisonnable, actuellement les 3000 derniers clics, ou des agregats si le besoin devient historique. Objectif : eviter qu'une page admin devienne de plus en plus couteuse avec les annees.
- Commentaires produits : ce n'est plus une fonctionnalite active. Ne pas recreer d'ecran admin qui lit tous les meubles/planches pour chercher des commentaires sans demande explicite.
- Analytics admin : ne pas utiliser de listeners live larges par defaut sur `analytics_sessions` ou `affiliate_clicks`. Charger sur ouverture puis via bouton `Actualiser`, ou ajouter un mode live explicite si necessaire.
- Dashboard admin : reutiliser les donnees catalogue deja chargees par l'app admin pour les stats meubles/planches. Ne pas rajouter de lectures completes `furniture`/`cutting_boards` dans le dashboard sans justification.
- Petits contenus publics (`contact_info`, `theme_settings`, `homepage_images`, `shop_tutorials`) : preferer `getDoc`/`getDocs` avec cache local. Le temps reel public n'est pas necessaire sauf demande explicite.
- Toute modification qui retablit un listener public large, un chargement public non cache, ou une lecture admin non bornee doit etre justifiee et documentee dans `_DOCS/ANALYTICS_RELIABILITY.md`.

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

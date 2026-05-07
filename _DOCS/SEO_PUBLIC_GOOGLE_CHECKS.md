# SEO public - Checks Google apres deploy

Objectif : valider le domaine public apres deploy SEO avant de considerer la roadmap terminee.

## Prerequis

- Accord explicite utilisateur pour tout deploy prod.
- `npm run preflight:prod` OK.
- Deploy SEO/Hosting effectue sur le projet explicite :

```bash
firebase deploy --only functions:sitemap,functions:shareMeta,hosting --project tousatable-client
```

Ne pas ecrire dans Firestore prod pour ces checks.

## 1. Audit public automatique

Lancer :

```bash
npm run audit:public-seo
```

Etat attendu :

- `robots.txt` HTTP 200.
- `/sitemap.xml` HTTP 200.
- Les routes propres SEO sont presentes dans le sitemap.
- Les anciennes URLs `?page=` / `?product=` ne sont plus dans le sitemap.
- Les URLs produit utilisent `/produit/`.
- Les routes publiques SEO repondent HTTP 200.
- `shareMeta` retourne les titres et canonicals attendus.

Si ce gate echoue, ne pas passer a Rich Results Test ni Search Console.

## 2. Rich Results Test

Outil officiel :

https://search.google.com/test/rich-results

Tester au minimum :

- `https://tousatable-madeinnormandie.fr/`
- `https://tousatable-madeinnormandie.fr/meubles-anciens`
- `https://tousatable-madeinnormandie.fr/meubles-anciens/buffets`
- `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes`
- `https://tousatable-madeinnormandie.fr/comptoir`
- `https://tousatable-madeinnormandie.fr/livraison-meubles-anciens-france`
- `https://tousatable-madeinnormandie.fr/a-propos`

Preuves a noter dans `SEOlivre.md` :

- date ;
- URL testee ;
- resultat eligible / non eligible ;
- erreurs ou avertissements ;
- captures si disponibles.

## 3. Search Console

Interface :

https://search.google.com/search-console

Actions :

1. Ouvrir la propriete du domaine `tousatable-madeinnormandie.fr`.
2. Soumettre ou re-soumettre :

```text
https://tousatable-madeinnormandie.fr/sitemap.xml
```

3. Inspecter et demander indexation pour :

- `https://tousatable-madeinnormandie.fr/`
- `https://tousatable-madeinnormandie.fr/meubles-anciens`
- `https://tousatable-madeinnormandie.fr/meubles-anciens/buffets`
- `https://tousatable-madeinnormandie.fr/planches-a-decouper-anciennes`
- `https://tousatable-madeinnormandie.fr/comptoir`
- `https://tousatable-madeinnormandie.fr/livraison-meubles-anciens-france`
- `https://tousatable-madeinnormandie.fr/a-propos`

Preuves a noter dans `SEOlivre.md` :

- sitemap soumis avec statut ;
- inspection URL : indexable / non indexable ;
- canonical declare par Google ;
- erreurs de couverture ;
- demandes d'indexation envoyees.

## 4. API Search Console optionnelle

Documentation :

https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect

L'API demande un compte/service account autorise sur la propriete Search Console et un scope Google Webmasters. Sans ces droits, l'inspection doit rester manuelle.

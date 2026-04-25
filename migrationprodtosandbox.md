# Migration Prod vers Sandbox - Explication simple

## Objectif

Le but est de copier les produits visibles en production vers la sandbox pour tester le design avec les vraies donnees, sans deployer en production et sans modifier la base de production.

Dans notre cas :

- Production : `tousatable-client`
- Sandbox : `tatmadeinnormandie`
- Donnees copiees : meubles publies et planches publiees
- Donnees non copiees : clients, commandes, paniers, newsletter, analytics

## Image mentale

Imagine deux classeurs separes :

- Le classeur **Prod** contient le vrai site public.
- Le classeur **Sandbox** est un brouillon de test.

Le script ouvre le classeur Prod, lit les fiches produits publiees, puis recopie ces fiches dans le classeur Sandbox.

Il n'ecrit jamais dans le classeur Prod.

## Quels acces sont utilises ?

Je n'ai pas un acces Firebase personnel cache.

Le script utilise les droits Firebase/Google deja connectes sur ta machine. Concretement, quand on lance Firebase CLI ou le script Node, il utilise l'authentification locale de ton ordinateur.

Les acces viennent donc de l'un de ces mecanismes :

- `firebase login`, si tu es connecte au CLI Firebase
- ou `gcloud auth application-default login`, pour donner au script Node un acces admin via Google
- ou une variable `GOOGLE_APPLICATION_CREDENTIALS`, si un fichier de service account est configure

Dans notre test, l'acces etait deja disponible sur ta machine, donc le script a pu :

- lire `tousatable-client`
- ecrire dans `tatmadeinnormandie`

## Pourquoi la prod n'a pas ete modifiee ?

Le script est code avec deux connexions separees :

```txt
SOURCE_PROJECT_ID      = tousatable-client
DESTINATION_PROJECT_ID = tatmadeinnormandie
```

La connexion Prod est utilisee uniquement pour lire :

```txt
sourceRef.where('status', '==', 'published').get()
```

La connexion Sandbox est la seule utilisee pour ecrire :

```txt
batch.set(destinationDocRef, copiedData)
```

Le script contient aussi des garde-fous :

- il refuse de tourner si source et destination sont identiques
- il est limite aux collections publiques `furniture` et `cutting_boards`
- il ne copie que les documents avec `status == "published"`
- il ne supprime rien dans la sandbox par defaut
- il est en simulation par defaut

## Commande de simulation

Cette commande ne modifie rien. Elle affiche seulement ce qui serait copie.

```bash
node scripts/sync-prod-to-sandbox.cjs
```

Lors du dernier dry-run, on avait :

```txt
furniture:
- 33 meubles publies en prod

cutting_boards:
- 21 planches publiees en prod
```

## Commande de vraie copie

Cette commande copie les produits publics de la prod vers la sandbox.

```bash
node scripts/sync-prod-to-sandbox.cjs --apply
```

Elle ecrit uniquement dans :

```txt
tatmadeinnormandie
```

Elle lit uniquement depuis :

```txt
tousatable-client
```

## Ce qui a ete fait

La migration lancee a copie :

- 33 meubles publies
- 21 planches publiees

Total :

```txt
54 operations d'ecriture dans la sandbox
0 operation d'ecriture dans la prod
```

## Important : sandbox miroir ou sandbox enrichie ?

Pour l'instant, on a fait une copie sans suppression.

Donc la sandbox contient :

- les produits venant de prod
- plus les anciens produits de test qui etaient deja en sandbox

Cela permet de tester sans risque.

Si on veut que la sandbox soit un miroir strict de la prod, on peut lancer une option qui supprime uniquement les anciens produits sandbox absents de la prod :

```bash
node scripts/sync-prod-to-sandbox.cjs --apply --delete-sandbox-missing
```

Cette suppression ne touche toujours que la sandbox.

## Est-ce qu'il faut deployer ?

Non.

Pour tester le design actuel, il suffit de rafraichir le site local :

```txt
http://localhost:5175/#gallery
```

Le site local utilise deja la base sandbox via `.env.local`.

## Ce qui n'est pas copie

Par securite, le script ne copie pas :

- comptes utilisateurs
- commandes
- paniers
- emails newsletter
- sessions analytics
- logs admin
- donnees de paiement

## Et les images ?

Les documents produits contiennent deja les URLs des images de production.

La sandbox affiche donc les vraies images via ces URLs, sans copier le Storage Firebase.

Cela suffit pour tester le rendu visuel.

## Fichier technique utilise

Le script est ici :

```txt
scripts/sync-prod-to-sandbox.cjs
```

Il est volontairement separe du code du site : il sert uniquement a synchroniser les donnees entre Firebase prod et Firebase sandbox.

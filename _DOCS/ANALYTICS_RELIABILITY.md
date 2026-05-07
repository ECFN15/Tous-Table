# Analytics Reliability - Sessions et visiteurs uniques

Date: 2026-05-07

## Mission

Clarifier si les chiffres du dashboard admin representent vraiment des utilisateurs uniques, notamment quand 39 sessions donnent environ 20 visiteurs uniques sur la periode "1 jour".

Objectif technique: rendre le comptage plus fiable que le simple nombre de sessions, verifier l'acces IP cote serveur, exposer le niveau de confiance, et proteger les synchronisations de session contre les mises a jour falsifiees.

## Source de verite technique

- Collecte: `src/components/shared/AnalyticsProvider.jsx`
- Creation/sync serveur: `functions/src/analytics/sessions.js`
- Normalisation IP serveur: `functions/src/analytics/ip.js`
- Dashboard admin: `src/features/admin/AdminAnalytics.jsx`
- Calcul testable: `src/features/admin/analyticsReliability.js`
- Regles Firestore: `firestore.rules`, collection `analytics_sessions` en read admin only et write false cote client

## Acces IP verifie

L'IP n'est pas lue cote navigateur. Elle est lue cote Cloud Function depuis la requete serveur:

- priorite `x-forwarded-for`;
- fallbacks `x-appengine-user-ip`, `fastly-client-ip`, `cf-connecting-ip`, `x-real-ip`;
- fallback final `remoteAddress` / socket / `req.ip`.

La valeur est normalisee pour eviter les divergences entre:

- IPv4 mappee en IPv6 (`::ffff:x.x.x.x`);
- IPv4 avec port (`x.x.x.x:443`);
- chaine `Unknown`;
- liste de proxies `x-forwarded-for`.

Le dashboard affiche maintenant la couverture IP. Une session sans IP utilisable ne gonfle plus artificiellement le compteur "IPs uniques".

## Methode de comptage

Le dashboard distingue maintenant trois notions:

- `Sessions`: nombre brut de visites/session documents sur la periode.
- `Visiteurs Fiables`: identite dedupliquee par `userId` Firebase quand disponible, puis IP serveur, puis session en dernier recours.
- `IPs Uniques`: nombre d'adresses IP serveur distinctes, utile pour mesurer les reseaux/foyers et verifier le cas "la meme personne revient plusieurs fois".

Pourquoi ne pas utiliser uniquement l'IP:

- meme Wi-Fi/NAT: plusieurs personnes peuvent partager une IP, donc l'IP sous-compte;
- VPN/mobile/IPv6 privacy: une meme personne peut changer d'IP, donc l'IP sur-compte;
- Firebase anonymous auth donne un UID stable par navigateur/appareil, souvent plus fiable pour les retours multiples sur le meme appareil.

Conclusion pratique: si 39 sessions donnent 20 IPs uniques, cela veut dire "20 reseaux/IP detectes", pas forcement 20 personnes physiques. Le nouveau KPI "Visiteurs Fiables" donne l'estimation la plus robuste disponible sans cookies tiers invasifs.

## Protection de veracite

Chaque nouvelle session recoit un `syncToken` retourne uniquement au client qui a cree la session. Firestore stocke seulement le hash du token (`syncTokenHash`).

Les endpoints suivants verifient ce token avant d'accepter une mise a jour:

- `syncSession`;
- `syncSessionBeacon`.

Les anciennes sessions sans hash restent compatibles pour ne pas casser les onglets ouverts avant deploiement, mais les nouvelles sessions sont durcies.

Les donnees de parcours sont aussi bornees:

- chunk limite a 25 etapes par sync;
- duree limitee a 24h;
- chaines tronquees avant ecriture.

## Changements realises

- Ajout `functions/src/analytics/ip.js` pour une IP serveur commune a `sessions.js`, `adminIP.js` et `updateUserSessions.js`.
- Ajout `syncToken` + `syncTokenHash` pour empecher une synchronisation sans preuve de possession de la session.
- Ajout de metadonnees session: `ipMeta`, `authProvider`, `visitorIdentity`, `analyticsVersion`.
- Dashboard admin: KPIs separes `Sessions`, `Visiteurs Fiables`, `IPs Uniques`, `Couverture IP`, `Rebond`, `Mobile`.
- Graphique principal: barres basees sur visiteurs fiables par creneau, tooltip indiquant aussi les sessions si different.
- Requete admin elargie a une fenetre locale d'1 an, plafonnee a 5000 sessions avec indicateur de fiabilite si le plafond est atteint.
- Ajout du verifier `npm run verify:analytics-reliability`.
- Ajout du verifier au `npm run preflight:prod`.

## Tests

Commande cible:

```bash
npm run verify:analytics-reliability
```

La commande couvre:

- meme IP + plusieurs sessions = 1 IP unique et 1 visiteur fiable si aucun UID;
- meme UID anonyme + IPs differentes = 1 visiteur fiable mais 2 IPs uniques;
- IP `Unknown` exclue du compteur IP et visible dans la couverture;
- deduplication du graphique par creneau;
- normalisation IP backend (`x-forwarded-for`, IPv4 mappee IPv6, IPv4 avec port).

Avant de deployer:

```bash
npm run verify:analytics-reliability
npm run verify:functions-syntax
npm run build
```

Pour un deploy prod, respecter `AGENTS.md`: obtenir l'accord explicite puis lancer `npm run preflight:prod`.

## Limites restantes

- Sans consentement et sans fingerprinting invasif, il est impossible de garantir "1 personne physique exacte".
- Un meme visiteur sur deux appareils peut compter comme deux visiteurs fiables, sauf s'il se connecte avec le meme compte.
- Plusieurs personnes derriere la meme box peuvent rester une seule IP unique.
- Un VPN ou une IP mobile changeante peut augmenter le compteur IP unique.
- Les sessions historiques creees avant cette mission n'ont pas `syncTokenHash`, `ipMeta` ni `authProvider`; le dashboard conserve une compatibilite de lecture.

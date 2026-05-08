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
- bornes de fenetre et nombre de slots stables pour `1h`, `1j`, `7j`, `1mois`, `1ans`;
- `avgDuration`, `bounceRate`, `mobilePercentage` et normalisation des durees invalides;
- detection de fenetre plafonnee quand la lecture atteint `MAX_ANALYTICS_SESSIONS`;
- normalisation IP backend (`x-forwarded-for`, IPv4 mappee IPv6, IPv4 avec port).

## Audit 2026-05-07 - Mise a jour dashboard

- UI sessions: l'IP est maintenant affichee comme une ligne dediee sous la ville et le device, visible sur mobile et desktop.
- Snapshot admin: un seul listener Firestore lit la fenetre locale d'1 an; le changement de filtre ne recree plus inutilement le listener.
- Fenetres glissantes: les KPIs et le graphe sont recalcules depuis `sessions + timeFilter + now`, donc les filtres se mettent a jour quand l'horloge locale avance, meme sans nouveau snapshot.
- Rebond: les sessions sans parcours ou avec 0/1 etape comptent comme rebond, ainsi que les sessions de moins de 10 secondes.
- Duree moyenne: les durees sont normalisees entre 0 et 24h avant moyenne pour eviter qu'une valeur corrompue fausse le KPI.
- Graphique: chaque creneau deduplique les visiteurs fiables; le tooltip garde le nombre de sessions quand il differe du nombre de visiteurs.

Avant de deployer:

```bash
npm run verify:analytics-reliability
npm run verify:functions-syntax
npm run build
```

Pour un deploy prod, respecter `AGENTS.md`: obtenir l'accord explicite puis lancer `npm run preflight:prod`.

## Refonte 2026-05-08 - Reprise de session et organisation par visiteur

Contexte verifie en lecture seule sur Firestore prod `tousatable-client`:

- la serie Bordeaux vue dans `imagecodex/` correspondait a un meme visiteur technique;
- les sessions partageaient la meme IP complete, le meme UID Firebase anonyme et le meme device `Mobile Android Chrome`;
- aucune IP complete ni UID complet ne doit etre recopie dans les reponses ou documents.

Cause racine confirmee:

- `AnalyticsProvider.jsx` persistait `analytics_session_id` et `analytics_session_token` en `sessionStorage`;
- avant cette refonte, ces valeurs n'etaient pas relues au montage;
- chaque reload/remontage complet rappelait donc `initLiveSession`, et le backend creait un nouveau document.

Changements realises:

- Le client relit maintenant `analytics_session_id` + `analytics_session_token` au demarrage.
- `initLiveSession` accepte une demande de reprise (`resumeSessionId`, `resumeSyncToken`).
- La reprise est acceptee seulement si:
  - le document existe;
  - le `syncToken` correspond au hash stocke;
  - le `userId` de la session correspond a l'UID Firebase authentifie;
  - la derniere activite date de moins d'1 heure;
  - la session n'est pas une session admin.
- Si la reprise echoue, le comportement historique reste valable: une nouvelle session est creee.
- La duree de session reprise repart depuis `startedAtMs` renvoye par le backend, pour ne pas ecraser la duree existante avec une valeur plus basse apres reload.
- Les logs de `updateUserSessions` masquent maintenant email et IP via hash court au lieu d'ecrire les valeurs brutes.
- Le dashboard traffic affiche maintenant:
  - jours filtres selon le filtre actif (`1h`, `1j`, `7j`, etc.);
  - rectangles de visiteurs fiables par jour;
  - dans chaque rectangle, les sessions de ce visiteur;
  - dans chaque session, le tracking/parcours existant via `Tracer`.
- Coherence dashboard:
  - les KPIs, le graphique et les rectangles utilisent la meme identite `getVisitorIdentity`;
  - les rectangles visiteurs sont calcules depuis la meme fenetre glissante que les KPIs;
  - la somme des sessions des rectangles correspond a `Sessions`;
  - le nombre de rectangles visiteurs uniques correspond a `Visiteurs Fiables`;
  - le graphique deduplique les visiteurs par creneau, donc la somme des barres peut etre superieure a `Visiteurs Fiables` si un meme visiteur revient sur plusieurs creneaux.

Choix de securite:

- Pas de fusion serveur agressive par IP seule.
- Pas de reutilisation d'une session sans preuve de possession du `syncToken`.
- Audit du 2026-05-08: la reprise exige maintenant explicitement un `syncTokenHash`
  existant et un `userId` strictement identique a l'UID Firebase authentifie; la
  compatibilite legacy sans hash reste limitee aux syncs d'anciennes sessions.
- Audit post-deploiement 2026-05-08: pour eviter les sessions inutiles quand un
  meme visiteur revient dans une fenetre courte, le client conserve aussi
  `analytics_session_id` et `analytics_session_token` dans `localStorage`, et la
  fenetre de reprise serveur est portee a 1 heure. Au-dela, une nouvelle session
  reste creee.
- L'IP reste une aide de diagnostic, pas une identite certaine.

Commandes de verification cible:

```bash
npm run verify:analytics-reliability
npm run verify:functions-syntax
npm run build
```

## Limites restantes

- Sans consentement et sans fingerprinting invasif, il est impossible de garantir "1 personne physique exacte".
- Un meme visiteur sur deux appareils peut compter comme deux visiteurs fiables, sauf s'il se connecte avec le meme compte.
- Plusieurs personnes derriere la meme box peuvent rester une seule IP unique.
- Un VPN ou une IP mobile changeante peut augmenter le compteur IP unique.
- Les sessions historiques creees avant cette mission n'ont pas `syncTokenHash`, `ipMeta` ni `authProvider`; le dashboard conserve une compatibilite de lecture.

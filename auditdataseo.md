# Audit data SEO - Traffic sessions et boutique affiliation

Date de l'audit : 7 mai 2026  
Perimetre : code local du projet `Tous-Table`, partie analytics traffic/session, partie boutique affiliation "Le Comptoir", donnees publiques associees, rules Firestore, Functions, et impact SEO lie a ces donnees.  
Important : ce document decrit le fonctionnement observe dans le code. Il ne contient aucune valeur de secret et ne modifie pas Firestore.

---

## 1. Resume executif

Le systeme data est separe en deux grands ensembles :

1. **Traffic & Sessions**
   - Les sessions visiteurs sont stockees dans `analytics_sessions`.
   - Les sessions ne sont pas ecrites directement par le client Firestore : elles passent par les Cloud Functions `initLiveSession`, `syncSession`, `syncSessionBeacon`, `deleteSession`, `clearAllSessions`.
   - Le front cree une session apres stabilisation de Firebase Auth, puis envoie un heartbeat toutes les 15 secondes et un beacon a la fermeture/masquage de page.
   - Les admins sont exclus a deux niveaux : cote front via `isAdmin`, cote backend via type `admin` et IP admin connue.
   - Le dashboard lit les 1000 dernieres sessions, filtre les admins, calcule les KPIs et groupe les sessions par jour.

2. **Boutique affiliation / Le Comptoir**
   - Les produits sont dans `artifacts/{appId}/public/data/affiliate_products`.
   - Les tutoriels video sont dans `artifacts/{appId}/public/data/shop_tutorials`.
   - Les clics sortants sont dans `affiliate_clicks`.
   - La page `/comptoir` lit les produits publies, les trie par categorie/gamme/mise en avant, et tracke les clics avant ouverture externe.
   - Les clics affilies sont visibles dans deux endroits admin :
     - `AdminShop.jsx` pour les compteurs par produit et la gestion du catalogue.
     - `AdminAnalytics.jsx`, onglet "Boutique Affiliation", pour les KPIs temporels, top produits, sources et sessions.

SEO :

- `/comptoir` est une route SEO explicite dans `seoRoutes.js`, `ShopView.jsx`, `seoTools.js` et le sitemap dynamique.
- Les produits d'affiliation n'ont pas de pages detail dediees ni d'URLs indexables. Ils alimentent une page collection SEO avec schema `CollectionPage`, `BreadcrumbList` et `FAQPage`.
- Les meubles/planches ont des pages detail avec schema `Product`; les produits affilies recommandes dans ces pages ne generent pas de schema produit propre.

Points de vigilance prioritaires :

- Le endpoint public `publicCatalog` retourne toutes les collections publiques, y compris `affiliate_products`, sans filtrer `status === 'published'` cote Function. Le front filtre ensuite, mais les drafts restent exposables via endpoint et rules publiques.
- `affiliate_clicks` peut etre cree par tout utilisateur authentifie, y compris anonyme, avec peu de validation metier. C'est coherent avec le tracking visiteur, mais pas robuste contre injection de clics si App Check/Rules ne suffisent pas.
- `syncSession` et `syncSessionBeacon` ne verifient pas la propriete de la session. Le risque est modere car l'ID est aleatoire, mais un ID connu peut etre mis a jour.
- La mention UI "Retention data : 30 jours" n'a pas de mecanisme automatique observe dans le code. La purge est manuelle.
- Le tracking affiliation et le tracking journey session ne sont pas transactionnels : un clic peut exister dans `affiliate_clicks` sans etre rattache a une session, surtout si l'utilisateur clique avant l'initialisation analytics.

---

## 2. Cartographie rapide des fichiers

### Front analytics session

- `src/components/shared/AnalyticsProvider.jsx`
  - Initialise la session.
  - Enregistre le parcours de navigation.
  - Envoie les heartbeats.
  - Envoie le beacon de fermeture.
  - Ecoute les clics affiliation via `window.addEventListener('affiliate_product_click', ...)`.

- `src/features/admin/AdminAnalytics.jsx`
  - Lit `analytics_sessions`.
  - Calcule les KPIs traffic.
  - Affiche les sessions live.
  - Affiche les parcours utilisateur.
  - Lit `affiliate_clicks` dans l'onglet boutique.
  - Calcule les KPIs affiliation.

- `src/contexts/AuthContext.jsx`
  - Connecte anonymement les visiteurs.
  - Declenche `updateUserSessions` apres login Google.
  - Permet de convertir ou supprimer des sessions creees avant authentification.

- `src/components/admin/AdminIPTracker.jsx`
  - Monte dans le layout admin.
  - Appelle `trackAdminIP` pour maintenir la liste des IP admin.

### Front boutique affiliation

- `src/App.jsx`
  - Charge `affiliate_products` avec les autres donnees publiques.
  - Fait un fallback via `publicCatalog`.
  - Filtre les produits affilies sur `status === 'published'` cote client.

- `src/pages/ShopView.jsx`
  - Page publique `/comptoir`.
  - Structure les familles, tutoriels, schema SEO.
  - Ecoute `shop_tutorials`.
  - Affiche les produits par famille.
  - Declenche `trackAffiliateClick`.

- `src/components/shop/ShopProductCard.jsx`
  - Carte produit affiliation.
  - CTA sortant vers `affiliateUrl`.
  - Appelle `trackAffiliateClick` avec la source.

- `src/designs/architectural/ArchitecturalProductDetail.jsx`
  - Affiche des produits affilies recommandes dans les pages detail meuble.
  - Source de tracking : `gallery_detail`.
  - Ajoute `parentFurnitureId` et `parentFurnitureName`.

- `src/utils/tracking.js`
  - Fonction centrale `trackAffiliateClick`.
  - Ouvre le lien externe.
  - Exclut les admins.
  - Dispatch l'evenement de journey.
  - Ecrit dans `affiliate_clicks`.

### Admin boutique

- `src/features/admin/AdminShop.jsx`
  - CRUD des produits affilies.
  - Validation du tag Amazon `tousatable-21`.
  - KPIs catalogue.
  - Compteurs de clics derives depuis `affiliate_clicks`.
  - Reset manuel des clics.

- `src/features/admin/AdminTutorials.jsx`
  - CRUD des tutoriels YouTube.
  - Association optionnelle a un produit.
  - Groupement par categorie.

### Cloud Functions

- `functions/src/analytics/sessions.js`
  - `initLiveSession`
  - `syncSession`
  - `syncSessionBeacon`
  - `deleteSession`
  - `clearAllSessions`
  - `clearAllAffiliateClicks`

- `functions/src/analytics/updateUserSessions.js`
  - Nettoie les sessions admin apres login.
  - Convertit les sessions anonymes en sessions client apres login.

- `functions/src/analytics/adminIP.js`
  - `trackAdminIP`
  - `isAdminIP`

- `functions/src/public/catalog.js`
  - Endpoint public de fallback catalogue.
  - Retourne `furniture`, `cutting_boards`, `affiliate_products`, `shop_tutorials`.

- `functions/src/seo/seoTools.js`
  - `sitemap`
  - `shareMeta`
  - Ajoute `/comptoir` aux routes SEO.

### Configuration et securite

- `src/firebase/config.js`
  - Initialise Firebase, Firestore, Auth, Functions, Analytics et App Check.
  - Definit `appId` logique via `VITE_APP_LOGICAL_NAME` ou fallback `tat-made-in-normandie`.

- `firestore.rules`
  - Regles pour `affiliate_products`, `shop_tutorials`, `affiliate_clicks`, `analytics_sessions`.

- `functions/helpers/config.js`
  - Definit `APP_ID = 'tat-made-in-normandie'`.
  - Mappe les projets Firebase vers les URLs SEO.

---

## 3. Modele de donnees Firestore

### 3.1 `analytics_sessions`

Collection racine :

```txt
analytics_sessions/{sessionId}
```

Ecriture :

- Interdite cote client par `firestore.rules`.
- Autorisee uniquement via Cloud Functions Admin SDK.

Lecture :

- Admin seulement via `isArtisan()`.

Champs principaux crees par `initLiveSession` :

```js
{
  userId: string,
  email: string | null,
  type: 'admin' | 'client' | 'anonymous' | string,
  ip: string,
  startedAt: serverTimestamp,
  lastActivityAt: serverTimestamp,
  duration: number,
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown',
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'IE/Edge' | 'Unknown',
  os: 'Windows' | 'MacOS' | 'Linux' | 'Android' | 'iOS' | 'Unknown',
  userAgent: string,
  geo: {
    country: string,
    region: string,
    city: string
  },
  journey: [],
  sessionActive: boolean,
  adminIPDetected: boolean
}
```

Champs ajoutes par `updateUserSessions` pour les visiteurs qui se connectent :

```js
{
  sessionConverted: true,
  convertedAt: serverTimestamp,
  originalType: 'anonymous'
}
```

Format d'une entree `journey` :

```js
{
  page: string,
  itemId: string | null,
  time: string,       // heure locale fr-FR au moment de l'action
  duration: number    // secondes depuis l'action precedente
}
```

Exemples possibles :

```js
{ page: 'gallery', itemId: null, time: '12:45:01', duration: 8 }
{ page: 'detail', itemId: 'abc123 | Table ferme (1200EUR)', time: '12:45:24', duration: 23 }
{ page: 'affiliate_shop_grid', itemId: 'prod123 | Rubio Monocoat (49.9EUR)', time: '12:46:10', duration: 46 }
{ page: 'affiliate_gallery_detail', itemId: 'prod123 | Rubio Monocoat [depuis: Buffet ancien]', time: '12:46:10', duration: 46 }
```

Note importante : la logique UI de `AdminAnalytics.jsx` traite explicitement certains labels historiques comme `comptoir` ou `shop`, mais `AnalyticsProvider.jsx` genere aujourd'hui `affiliate_${source}`. C'est fonctionnel, mais il y a une derive de nomenclature qui peut rendre les parcours moins lisibles.

### 3.2 `affiliate_products`

Chemin :

```txt
artifacts/{appId}/public/data/affiliate_products/{productId}
```

Avec `appId` actuellement attendu :

```txt
tat-made-in-normandie
```

Champs principaux :

```js
{
  name: string,
  brand: string,
  description: string,
  category: 'huiles' | 'cires' | 'savons' | 'accessoires' | 'renovation' | 'outils' | string,
  tier: 'essentiel' | 'premium' | 'expert',
  price: number | null,
  affiliateUrl: string,
  affiliateProgram: 'amazon' | 'manomano' | 'leroymerlin' | 'rakuten' | 'castorama' | 'direct' | string,
  imageUrl: string,
  whyWeRecommend: string,
  proTip: string,
  featured: boolean,
  status: 'published' | 'draft',
  clickCount: number,       // champ legacy/initial, la source de verite actuelle est affiliate_clicks
  createdAt: serverTimestamp,
  updatedAt: serverTimestamp
}
```

Lecture :

- Publique (`allow read: if true`).

Ecriture :

- Admin seulement.
- Validation minimale par `isValidAffiliateProduct()`.

Point important :

- Le front public filtre les produits avec `status === 'published'`.
- Les rules autorisent quand meme la lecture publique de tous les documents, y compris drafts.
- `publicCatalog` retourne actuellement toute la collection, puis le front filtre. Donc un draft peut etre expose dans la reponse reseau meme s'il n'est pas affiche.

### 3.3 `shop_tutorials`

Chemin :

```txt
artifacts/{appId}/public/data/shop_tutorials/{tutorialId}
```

Champs principaux :

```js
{
  videoId: string,
  label: string,
  productId: string,
  category: string,
  order: number,
  createdAt: serverTimestamp,
  updatedAt: serverTimestamp
}
```

Lecture :

- Publique.

Ecriture :

- Admin seulement.
- Validation partielle des champs `videoId`, `label`, `category`.

Role SEO/data :

- Ces tutoriels enrichissent la page `/comptoir`.
- Ils ne sont pas indexables individuellement.
- Ils servent a contextualiser les produits affilies et a creer une page collection plus utile.

### 3.4 `affiliate_clicks`

Collection racine :

```txt
affiliate_clicks/{clickId}
```

Ecriture :

- Cote client via `addDoc(collection(db, 'affiliate_clicks'), payload)`.
- Autorisee par rules si `request.auth != null`.
- Comme le site connecte les visiteurs anonymement, les visiteurs anonymes Firebase peuvent creer des clics.

Lecture :

- Admin seulement.

Suppression :

- Admin seulement, ou Cloud Function `clearAllAffiliateClicks`.

Payload cree par `trackAffiliateClick` :

```js
{
  productId: string,
  productName: string,
  affiliateProgram: string,
  category: string,
  tier: string,
  timestamp: serverTimestamp(),
  sessionId: sessionStorage.getItem('analytics_session_id') || null,
  source: string,
  parentFurnitureId?: string,
  parentFurnitureName?: string
}
```

Sources actuellement observees :

```txt
shop_grid        // clic depuis carte produit du Comptoir
shop_tutorial    // clic depuis module tutoriel du Comptoir
gallery_detail   // clic depuis recommandations sur une page meuble
```

Champs autorises par rules mais pas toujours utilises :

```txt
referrer
```

Point important :

- `affiliate_clicks` est la source de verite actuelle pour les compteurs.
- `affiliate_products.clickCount` existe, mais `AdminShop.jsx` recalcule les clics en lisant `affiliate_clicks`.

---

## 4. Flux Traffic & Sessions en detail

### 4.1 Precondition : Firebase Auth anonyme

Dans `AuthContext.jsx`, le site lance `signInAnonymously(auth)` quand aucun utilisateur n'est connecte et qu'aucun redirect Google n'est en cours.

Pourquoi c'est important :

- Les rules Firestore exigent `request.auth != null` pour creer `affiliate_clicks`.
- Le tracking session attend un `user` non nul avant d'appeler `initLiveSession`.
- Les visiteurs "non connectes" sont donc en realite authentifies anonymement cote Firebase.

Effet data :

- Une session anonyme porte un `userId` Firebase anonyme.
- Si le visiteur se connecte ensuite avec Google, `updateUserSessions` peut convertir les sessions anonymes recentes en sessions client.

### 4.2 Initialisation de session

Fichier : `src/components/shared/AnalyticsProvider.jsx`

Le provider recoit :

```js
view
selectedItemId
selectedItemName
selectedItemPrice
```

L'initialisation se fait avec un `setTimeout` de 2,5 secondes.

Garde-fous :

- Pas de session si `sessionIdRef.current` existe deja.
- Pas de session si `initCalledRef.current` est deja vrai.
- Pas de session si le composant est unmount.
- Pas de session si `isAdmin`.
- Pas de session tant que `user` est nul.

But du delai :

- Laisser Firebase Auth se stabiliser.
- Eviter la double session lors du passage `user = null` vers `user = anonymousUser`.

Payload envoye a `initLiveSession` :

```js
{
  userId: user.uid || 'anonymous',
  email: user.email || null,
  type: isAdmin ? 'admin' : (user && !user.isAnonymous ? 'client' : 'anonymous'),
  device,
  browser,
  os
}
```

La detection device/browser/OS est faite cote client via `navigator.userAgent`.

Limite :

- La detection est simple. Exemple : sur certains navigateurs iOS/Chrome iOS, le parsing peut etre approximatif.

### 4.3 Creation backend `initLiveSession`

Fichier : `functions/src/analytics/sessions.js`

La Function :

1. Lit l'IP via `x-forwarded-for` ou `remoteAddress`.
2. Lit le `user-agent`.
3. Geolocalise l'IP via `ip-api.com`.
4. Verifie si l'IP est une IP admin via `isAdminIP(ip)`.
5. Force `sessionType = 'admin'` si :
   - le payload declare `type === 'admin'`, ou
   - l'IP est dans `sys_metadata/admin_ips`.
6. Cree un document `analytics_sessions`.
7. Retourne `{ success: true, sessionId }`.

Impact :

- Meme si le front oublie d'exclure un admin, une IP admin connue peut reclasser la session en admin.
- Les sessions admin peuvent ensuite etre filtrees du dashboard.

Limite :

- `initLiveSession` accepte un payload client pour `type`, `device`, `browser`, `os`.
- L'IP et user-agent viennent de la requete, mais les autres champs peuvent etre spoofes si quelqu'un appelle directement la Function.

### 4.4 Enregistrement du parcours

Dans `AnalyticsProvider.jsx`, un `useEffect` ecoute les changements :

```js
[view, selectedItemId, selectedItemName, selectedItemPrice]
```

A chaque changement :

1. Calcule le temps ecoule depuis la derniere action.
2. Ignore les vues detail tant que le nom du produit n'est pas disponible.
3. Construit `displayId`.
4. Push dans `journeyToSend.current`.
5. Met a jour `lastActionTimeRef`.

Exemple de `displayId` :

```txt
abc123 | Buffet normand (850EUR)
```

Avantage :

- Le parcours reste lisible dans l'admin.
- Les vues detail n'enregistrent pas seulement un ID brut.

Limite :

- `time` est stocke en chaine locale `fr-FR`, pas en timestamp.
- `duration` est relatif a l'action precedente et pas forcement au temps passe reellement sur la page si l'utilisateur quitte/masque l'onglet.

### 4.5 Heartbeat `syncSession`

Toutes les 15 secondes :

1. Si pas de session ou admin, rien.
2. Calcule `totalDuration`.
3. Copie le chunk de journey.
4. Vide `journeyToSend.current`.
5. Appelle `syncSession`.
6. Si erreur, remet le chunk dans la queue locale.

Payload :

```js
{
  sessionId,
  duration: totalDuration,
  journey: chunk,
  sessionActive: document.visibilityState === 'visible'
}
```

Backend :

- Verifie que `sessionId` existe.
- Si absent : log warning, retourne success avec `missing: true`.
- Met a jour :
  - `lastActivityAt`
  - `duration`
  - `sessionActive`
  - `journey` via `arrayUnion`.

Point positif :

- Le cas session absente est maintenant tolere et ne provoque plus d'erreur 500.

Limite :

- `arrayUnion` deduplique par egalite exacte d'objet. Deux actions identiques au meme moment peuvent etre fusionnees si elles sont strictement identiques, ce qui est rare.
- Aucune verification d'appartenance session/utilisateur.

### 4.6 Fermeture et masquage de page

Le provider ecoute :

```txt
visibilitychange
beforeunload
pagehide
```

Quand la page devient hidden ou se ferme :

- Envoie `syncSessionBeacon`.
- Met `sessionActive: false`.
- Utilise `navigator.sendBeacon`.

Quand la page redevient visible :

- Appelle `syncSession` avec `sessionActive: true`.

Backend `syncSessionBeacon` :

- Endpoint HTTP `onRequest`.
- CORS allowlist :
  - `https://tousatable-madeinnormandie.fr`
  - `https://tatmadeinnormandie.web.app`
  - `https://tousatable-client.web.app`
  - `https://tousatable-client.firebaseapp.com`
  - `http://localhost:5173`
  - `http://localhost:3000`
- Accepte `OPTIONS`.
- Parse `req.body` ou `req.rawBody`.
- Met a jour la session si elle existe.
- Si la session n'existe pas, retourne `204`.

Point positif :

- `sendBeacon` est le bon choix pour mobile et fermeture d'onglet.

Point de vigilance :

- CORS n'est pas une authentification.
- Une origine non autorisee recoit quand meme un header `Access-Control-Allow-Origin` pointe vers la prod par defaut. En pratique cela bloque les navigateurs non autorises, mais ce n'est pas une preuve d'identite.

### 4.7 Exclusion admin

Il y a trois mecanismes complementaires :

1. **Front `AnalyticsProvider`**
   - Si `isAdmin`, ne cree pas de session et ne tracke pas.

2. **Backend `initLiveSession`**
   - Si `type === 'admin'` ou IP admin, la session devient `type: 'admin'`.

3. **`updateUserSessions` apres login**
   - Si l'utilisateur est admin :
     - cherche les sessions actives de la meme IP,
     - supprime les sessions recentes de moins de 2 heures.
   - Si l'utilisateur est client :
     - convertit les sessions anonymes recentes en `type: 'client'`.

4. **`AdminIPTracker`**
   - Monte dans le layout admin.
   - Appelle `trackAdminIP`.
   - Stocke les IP admin dans `sys_metadata/admin_ips`.
   - Nettoie les IP vieilles de plus de 90 jours.

Limite :

- Les IP mobiles changent souvent.
- Une IP admin inconnue peut creer une session anonyme avant login, mais `updateUserSessions` la supprime apres connexion admin.

---

## 5. Dashboard Traffic & Sessions

Fichier : `src/features/admin/AdminAnalytics.jsx`

### 5.1 Lecture Firestore

Le dashboard ecoute :

```js
query(
  collection(db, 'analytics_sessions'),
  orderBy('startedAt', 'desc'),
  limit(1000)
)
```

Puis :

```js
const cleanData = data.filter(s => s.type !== 'admin');
```

Impact :

- L'admin ne voit que les 1000 sessions les plus recentes.
- Les sessions admin sont filtrees avant KPIs.

Limite :

- Si plus de 1000 sessions existent, les KPIs ne representent pas toute l'histoire, seulement les 1000 derniers documents lus.
- Les filtres temporels sont appliques apres le `limit(1000)`.

### 5.2 Filtres temporels

Filtres disponibles :

```txt
1h
1j
7j
1mois
1ans
```

Fenetrage :

- `1h` : 60 barres de 1 minute.
- `1j` : barres horaires sur 24h.
- `7j` : barres de 6 heures.
- `1mois` : barres journalieres.
- `1ans` : barres mensuelles approximatives de 30 jours.

Le filtre est fait avec :

```js
time >= cutoff && s.type !== 'admin'
```

### 5.3 KPIs traffic

Les KPIs sont calcules sur `realTraffic`.

#### Visiteurs uniques

```js
new Set(realTraffic.map(s => s.ip).filter(Boolean)).size
```

Interpretation :

- C'est un compteur d'IPs uniques, pas un compteur d'utilisateurs reels.

Limites :

- Plusieurs personnes derriere une meme box = 1 visiteur.
- Un mobile avec IPv6 privacy peut devenir plusieurs visiteurs.
- VPN/proxy peuvent biaiser.

#### Duree moyenne

```js
sum(duration) / totalSessions
```

Interpretation :

- Moyenne par session.
- Pas moyenne par IP unique.

#### Taux de rebond

```js
journey.length <= 1 || duration < 10
```

Interpretation :

- Une session est un rebond si elle a 1 action ou moins, ou si elle dure moins de 10 secondes.

Limite :

- Un visiteur qui lit longtemps une seule page peut etre compte comme rebond si `journey.length <= 1`.
- Le KPI est utile pour tendance, pas pour mesure analytics standard stricte.

#### Traffic mobile

```js
s.device === 'Mobile'
```

Limite :

- Depend du parsing user-agent cote client.

### 5.4 Sessions live

Une session est live si :

```js
sessionActive !== false && now - lastActivityAt <= 30000
```

Le state `now` est rafraichi toutes les 10 secondes.

Impact :

- Une session peut rester "En ligne" jusqu'a environ 40 secondes apres depart selon timing.

### 5.5 Groupement par jour

Le dashboard groupe les sessions par `startedAt` :

- `Aujourd'hui`
- `Hier`
- date `fr-FR`

Pagination :

- 10 jours par page.

Affichage detail :

- Heure de debut.
- Statut `En ligne` ou `Termine`.
- Ville/region si connue.
- IP en desktop.
- Device/OS/browser.
- Duree.
- Parcours utilisateur.

### 5.6 Actions admin

Actions disponibles :

- Supprimer une session :
  - `deleteSession({ sessionId })`
  - admin only.

- Purger toutes les sessions :
  - `clearAllSessions()`
  - suppression par pages de 500 documents.

Point positif :

- La purge par batch pagine evite la limite Firestore de 500 operations par batch.

Point de vigilance :

- Pas de sauvegarde ni export avant purge.
- Action irreversible.

---

## 6. Flux Boutique Affiliation en detail

### 6.1 Chargement des produits

Fichier : `src/App.jsx`

Au demarrage :

1. Le front appelle `publicCatalog` en bootstrap fallback.
2. Il ouvre aussi des listeners Firestore temps reel :
   - `furniture`
   - `cutting_boards`
   - `affiliate_products`
3. Pour `affiliate_products`, il applique :

```js
.filter(p => p.status === 'published')
```

Impact :

- Le public ne voit que les produits publies dans l'UI.
- Les mises a jour admin sont visibles en temps reel.

Point de vigilance :

- Le filtrage est cote client, pas cote rules ni endpoint fallback.

### 6.2 Page `/comptoir`

Fichier : `src/pages/ShopView.jsx`

La page contient :

- Des familles statiques :
  - `huiles`
  - `cires`
  - `savons`
  - `accessoires`
  - `renovation`
  - `outils`

- Des tutoriels par famille :
  - fallback statique dans `FAMILIES`
  - override Firestore via `shop_tutorials`

- Des produits par famille :
  - bucket par `product.category`
  - tri via `sortShopProducts`

Tri produit :

1. D'abord par `tier` :
   - expert = 3
   - premium = 2
   - essentiel = 1
2. Puis par `featured`.

Note :

- Le tri actuel favorise d'abord la gamme, puis `featured`.
- Si on veut que "Mis en avant" passe devant tous les autres, il faut inverser la priorite.

### 6.3 Clic produit depuis grille

Fichier : `src/components/shop/ShopProductCard.jsx`

Sur clic CTA :

```js
event.preventDefault();
trackAffiliateClick({ product, source, isAdmin, parentFurnitureId, parentFurnitureName });
```

Source par defaut :

```txt
shop_grid
```

Si la carte est affichee sur une page detail meuble :

```txt
gallery_detail
```

### 6.4 Clic produit depuis tutoriel

Fichier : `src/pages/ShopView.jsx`

Quand un tutoriel a un produit lie :

- Le bouton "Decouvrir" appelle `handleTutorialClick`.
- `handleTutorialClick` appelle `trackAffiliateClick` avec :

```txt
source = shop_tutorial
```

### 6.5 Fonction centrale `trackAffiliateClick`

Fichier : `src/utils/tracking.js`

Ordre exact :

1. Si pas de `product.affiliateUrl`, retour.
2. Ouvre le lien :

```js
window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
```

3. Si admin :
   - log console,
   - ne tracke pas.

4. Dispatch un event local :

```js
window.dispatchEvent(new CustomEvent('affiliate_product_click', { detail: ... }))
```

5. Ecrit dans `affiliate_clicks`.

Avantages :

- L'ouverture externe n'attend pas Firestore.
- Un echec tracking ne bloque pas l'utilisateur.
- Les admins ne polluent pas les stats.

Limites :

- Si l'ecriture Firestore echoue, le visiteur a quand meme ete redirige.
- Si la session analytics n'est pas encore initialisee, `sessionId` vaut `null`.
- L'event journey et `affiliate_clicks` ne sont pas transactionnels.

### 6.6 Double tracking : click analytics et journey session

Un clic affiliation produit deux traces possibles :

1. Document `affiliate_clicks`
   - Source de verite pour la boutique.
   - Peut exister sans session.

2. Entree `journey` dans `analytics_sessions`
   - Source de contexte comportemental.
   - Peut manquer si session non initialisee ou admin.

Liaison entre les deux :

- `affiliate_clicks.sessionId` reprend `sessionStorage.analytics_session_id`.
- `BoutiqueAnalytics` utilise ce `sessionId` pour retrouver la geolocalisation dans les sessions chargees.

Limite :

- Si `sessionId` est `null`, le flux boutique groupe le clic sous `anonyme`.
- Si la session n'est pas dans les 1000 sessions chargees par `AdminAnalytics`, la geoloc ne sera pas disponible dans l'onglet boutique.

---

## 7. Admin Boutique Affiliation

### 7.1 CRUD produits

Fichier : `src/features/admin/AdminShop.jsx`

Le formulaire produit ecrit dans :

```txt
artifacts/{appId}/public/data/affiliate_products
```

Champs obligatoires cote formulaire :

- `name`
- `brand`
- `affiliateUrl`

Champs de selection :

- `category`
- `tier`
- `affiliateProgram`
- `status`
- `featured`

Validation Amazon :

- Constante :

```txt
tousatable-21
```

- Pour `affiliateProgram === 'amazon'`, le formulaire inspecte le parametre `tag`.
- Si absent ou incorrect, affiche un warning.
- L'enregistrement peut quand meme etre force via confirmation.

Point positif :

- Tres utile pour proteger la commission Amazon.

Limite :

- La validation du tag Amazon est cote front/admin uniquement.
- Les rules Firestore ne valident pas le tag.

### 7.2 Compteurs de clics dans AdminShop

`AdminShop.jsx` ecoute toute la collection `affiliate_clicks`.

Il calcule :

```js
counts[productId] += 1
totalTrackedClicks = snap.size
```

Puis injecte :

```js
product.clickCount = clickCountsByProduct[p.id] || 0
```

Conclusion :

- `affiliate_clicks` est la source de verite.
- Le champ `clickCount` du produit est seulement historique/initial.

Limite :

- Lecture de toute la collection sans `limit`.
- Si beaucoup de clics s'accumulent, l'admin boutique peut devenir lourd.

### 7.3 Reset stats clics

Dans `AdminShop.jsx`, `handleResetAllClicks` supprime les clics par pages de 450 documents, ordonnes par `timestamp`.

Dans `AdminAnalytics.jsx`, l'onglet boutique appelle plutot `clearAllAffiliateClicks` cote Cloud Function.

Il y a donc deux chemins de purge :

1. Cote client admin avec batch Firestore.
2. Cote Function avec Admin SDK.

Recommandation :

- Standardiser sur la Cloud Function pour eviter de dupliquer la logique de purge.

### 7.4 CRUD tutoriels

Fichier : `src/features/admin/AdminTutorials.jsx`

Le module gere :

- `videoId`
- `label`
- `productId`
- `category`
- `order`

Fonctions :

- Extraction YouTube ID depuis URL.
- Preview thumbnail.
- Filtrage des produits par categorie.
- Groupement par categorie.

Utilite data :

- Permet d'associer un contenu editorial a un produit.
- Augmente le contexte de la page `/comptoir`.
- Peut ameliorer la qualite SEO de la page collection.

---

## 8. Dashboard Boutique Affiliation

Fichier : `src/features/admin/AdminAnalytics.jsx`, composant interne `BoutiqueAnalytics`.

### 8.1 Lecture

Le composant lit :

```js
query(collection(db, 'affiliate_clicks'), orderBy('timestamp', 'desc'), limit(3000))
```

Impact :

- Les stats sont calculees sur les 3000 clics les plus recents.
- Le filtre "Tout" ne veut pas dire "toute la base" si plus de 3000 clics existent.

### 8.2 Filtres temporels

Filtres :

```txt
1j  = 24h
7j  = 7 jours
30j = 30 jours
tout = tous les clics charges par la query, limite 3000
```

### 8.3 KPIs

KPIs affiches :

- Clics totaux
  - `filteredClicks.length`

- Produits cliques
  - nombre de `productId` distincts dans `filteredClicks`

- Top programme
  - programme affiliate avec le plus de clics

- Pic de clics
  - slot temporel avec le plus de clics dans le graphique

### 8.4 Graphique

Le composant reutilise `TrafficChart`.

Selon filtre :

- 24h : slots horaires.
- 7j : slots journaliers.
- 30j : slots journaliers.
- Tout : slots journaliers ou hebdo selon amplitude.

Le champ du graphique reste `visites` meme pour les clics. C'est un nom technique reutilise.

### 8.5 Classements

Les agregations calculees :

- `topProducts`
  - par `productId`
  - affiche nom, count, program, tier

- `byProgram`
  - par `affiliateProgram`

- `byTier`
  - par `tier`

- `bySource`
  - par `source`

- `byParent`
  - par `parentFurnitureId` / `parentFurnitureName`
  - utile pour savoir quels meubles generent des clics vers les produits d'entretien.

### 8.6 Flux chronologique

Les clics sont groupes :

1. par jour
2. par `sessionId`

Chaque groupe affiche :

- localisation si la session correspondante est connue,
- nombre de clics,
- heure,
- produit clique,
- source,
- meuble parent si present.

Limite :

- La localisation vient de `sessions` passees au composant parent.
- Si la session n'est pas dans les 1000 sessions chargees ou si `sessionId` est nul, localisation inconnue.

---

## 9. Firestore Rules et securite data

### 9.1 Admin helper

La fonction `isArtisan()` autorise :

- email super admin hardcode dans rules,
- ou custom claim `admin == true`.

Effet :

- Les operations sensibles sont reservees a l'admin.

### 9.2 `analytics_sessions`

Rules :

```txt
allow read: if isArtisan()
allow write: if false
```

Conclusion :

- Bonne isolation.
- Le client ne peut ni creer ni modifier les sessions directement.

### 9.3 `affiliate_clicks`

Rules :

```txt
allow create: if request.auth != null
  && keys hasOnly([...])
  && productId is string
  && productId.size() > 0
allow read, delete: if isArtisan()
```

Points positifs :

- Lecture non publique.
- Suppression admin uniquement.
- Les champs hors schema sont rejetes.

Points faibles :

- `productName`, `affiliateProgram`, `category`, `tier`, `source`, `sessionId` ne sont pas fortement types.
- `timestamp` n'est pas contraint a `request.time`.
- `productId` n'est pas verifie contre un produit existant.
- Un utilisateur anonyme Firebase peut creer des clics arbitraires.

Recommandations possibles :

- Renforcer la validation :

```txt
productName is string
affiliateProgram in [...]
category in [...]
tier in ['essentiel','premium','expert']
source in ['shop_grid','shop_tutorial','gallery_detail']
timestamp == request.time
sessionId == null || sessionId is string
```

- Envisager une Cloud Function `trackAffiliateClick` callable si l'on veut centraliser la validation et App Check.

### 9.4 `affiliate_products`

Rules :

```txt
allow read: if true
allow create, update: if isArtisan() && isValidAffiliateProduct()
allow delete: if isArtisan()
```

Point positif :

- Ecriture admin validee.

Point faible :

- Lecture publique de drafts.
- `imageUrl`, `whyWeRecommend`, `proTip`, `featured`, `updatedAt`, `createdAt` ne sont pas contraints dans `isValidAffiliateProduct`.
- Le tag Amazon n'est pas valide par rules.

Recommandation :

- Soit assumer que les drafts ne contiennent rien de sensible.
- Soit separer drafts et published.
- Soit filtrer via Function publique et fermer la lecture directe si besoin.

### 9.5 `shop_tutorials`

Rules :

```txt
allow read: if true
allow create, update: if isArtisan()
  && videoId is string
  && label is string
  && category is string
allow delete: if isArtisan()
```

Point faible :

- `productId` et `order` ne sont pas valides.
- `category` n'est pas limitee aux categories connues.

---

## 10. SEO et donnees boutique

### 10.1 Route `/comptoir`

La route est definie dans `src/utils/seoRoutes.js` :

```txt
/comptoir -> view: 'shop'
```

Dans `src/App.jsx`, si `view === 'shop'`, l'URL est poussee vers :

```txt
/comptoir
```

Impact :

- La page boutique dispose d'une URL propre.
- Elle est compatible partage, refresh et navigation.

### 10.2 Balises SEO React

Fichier : `src/pages/ShopView.jsx`

La page declare :

```jsx
<SEO
  title="Le Comptoir - Boutique Bois & Entretien Meuble Ancien"
  description="Produits pour entretenir, proteger et restaurer les meubles en bois massif : huiles, cires, savons, accessoires et soins du bois testes en atelier."
  url="/comptoir"
  schema={shopSchema}
/>
```

`SEO.jsx` genere :

- `<title>`
- meta description
- canonical
- OG title/description/image/url
- Twitter card
- JSON-LD si `schema` existe

### 10.3 Schema JSON-LD du Comptoir

`ShopView.jsx` construit un `@graph` avec :

1. `CollectionPage`
   - nom : Le Comptoir
   - URL : `https://tousatable-madeinnormandie.fr/comptoir`
   - description
   - `about` avec thematiques bois/entretien/restauration.

2. `BreadcrumbList`
   - Accueil
   - Le Comptoir

3. `FAQPage`
   - Questions/reponses sur entretien meuble ancien, protection table bois massif, produits de restauration.

Point positif :

- Pour une boutique affiliation sans pages produit dediees, le choix `CollectionPage + FAQPage` est coherent.

Point de vigilance :

- Les produits affilies affiches ne sont pas exposes en `ItemList` ou `Product` schema.
- Si l'objectif SEO devient plus agressif sur les requetes produits, ajouter un schema `ItemList` peut aider.

### 10.4 Sitemap dynamique

Fichier : `functions/src/seo/seoTools.js`

`CATEGORY_URLS` inclut :

```txt
/comptoir
```

Le sitemap genere :

- accueil
- routes categories meubles
- `/planches-a-decouper-anciennes`
- `/comptoir`
- `/a-propos`
- `/livraison-meubles-anciens-france`
- pages produits meubles/planches publies

Point important :

- Les produits affilies ne sont pas ajoutes au sitemap.
- C'est coherent car ils n'ont pas de pages detail internes.

### 10.5 Open Graph dynamique

Dans `ROUTE_SHARE_META`, `/comptoir` a :

```txt
title: Le Comptoir - Boutique bois et entretien
desc: Produits pour entretenir, proteger et restaurer les meubles en bois massif...
```

`shareMeta` peut generer une page HTML OG pour les bots sociaux.

Point positif :

- Le Comptoir a un titre/description dedies au partage.

### 10.6 Donnees publiques et SEO runtime

`publicCatalog` retourne aussi `affiliate_products` et `shop_tutorials`.

Utilite :

- Bootstrap rapide de la page.
- Fallback si Firestore direct echoue.

Limite SEO :

- Si les bots ne rendent pas l'app React, ils verront surtout les balises statiques/dynamiques, pas necessairement les produits.
- Le SEO produit affiliation repose surtout sur le contenu editorial de la page, pas sur chaque fiche produit.

---

## 11. Qualite data observee

### Points solides

- Les sessions sont ecrites via Functions, pas directement par le client.
- Le double guard `sessionIdRef` + `initCalledRef` evite la double session initiale.
- Le heartbeat est robuste et remet le chunk en queue en cas d'erreur.
- Le beacon gere bien les fermetures mobile/desktop.
- L'admin est exclu du tracking classique.
- Les compteurs affiliation utilisent `affiliate_clicks` comme source de verite.
- Les clics sont contextualises par source et meuble parent.
- Les batchs de purge Functions sont pagines par 500.
- Le Comptoir a une vraie route, une meta SEO dediee, un schema JSON-LD et une entree sitemap.

### Points fragiles

- `publicCatalog` expose aussi les drafts des collections publiques.
- Les rules `affiliate_clicks` sont permissives.
- Pas de retention automatique observee pour `analytics_sessions` ou `affiliate_clicks`.
- Les dashboards lisent des limites fixes :
  - 1000 sessions
  - 3000 clics
- Les KPIs "uniques" sont bases IP, pas utilisateur.
- Le tracking geoloc depend de `ip-api.com`, service externe gratuit.
- Les noms de pages journey affiliation ne sont pas totalement alignes avec l'affichage admin.
- Le reset des clics existe en deux implementations.
- Le champ `clickCount` dans `affiliate_products` peut induire en erreur puisqu'il n'est pas la source de verite.

---

## 12. Recommandations detaillees

### Priorite haute

#### 1. Filtrer les produits publics cote backend

Probleme :

- `publicCatalog` retourne `affiliate_products` sans filtrer `status`.
- Les rules Firestore permettent aussi la lecture publique des drafts.

Options :

1. Option simple :
   - Dans `publicCatalog`, filtrer `affiliate_products` sur `status === 'published'`.
   - Filtrer aussi `furniture` et `cutting_boards` si necessaire.

2. Option plus robuste :
   - Garder les drafts dans une collection admin privee.
   - Publier seulement les documents publics dans `public/data`.

3. Option rules :
   - Autoriser lecture publique seulement si `resource.data.status == 'published'`.
   - Attention : cela peut casser l'admin si l'admin lit via le meme chemin et n'est pas reconnu.

#### 2. Renforcer `affiliate_clicks`

Probleme :

- Tout utilisateur authentifie peut ecrire des clics arbitraires.

Rules cible :

```txt
productId is string
productName is string
affiliateProgram in ['amazon','manomano','leroymerlin','rakuten','castorama','direct']
category in ['huiles','cires','savons','accessoires','renovation','outils','unknown']
tier in ['essentiel','premium','expert']
source in ['shop_grid','shop_tutorial','gallery_detail']
timestamp == request.time
sessionId == null || sessionId is string
```

Alternative :

- Passer par une Function callable `trackAffiliateClick`.
- La Function valide le produit, recupere le nom/program/category/tier depuis Firestore, puis ecrit le clic.
- Le client n'envoie plus que `productId`, `source`, `parentFurnitureId`.

#### 3. Aligner les labels journey affiliation

Probleme :

- `AnalyticsProvider` pousse `page: affiliate_${source}`.
- L'UI admin teste surtout `comptoir` et `shop`.

Solution :

- Definir une table de labels centralisee :

```js
affiliate_shop_grid -> Clic Comptoir
affiliate_shop_tutorial -> Clic Tutoriel Comptoir
affiliate_gallery_detail -> Clic depuis fiche meuble
```

Impact :

- Parcours utilisateur plus lisibles.
- Analytics plus fiables pour interpretation client.

### Priorite moyenne

#### 4. Ajouter une retention automatique

L'UI annonce "Retention data : 30 jours", mais aucun job automatique n'est visible.

Solution :

- Ajouter une Function scheduled :
  - delete `analytics_sessions` older than 30 days.
  - delete `affiliate_clicks` older than 90 ou 180 jours selon besoin business.

Alternative :

- Activer Firestore TTL sur un champ `expiresAt`.

#### 5. Normaliser la purge des clics

Probleme :

- `AdminShop` supprime via client batch.
- `AdminAnalytics` supprime via Cloud Function.

Solution :

- Garder uniquement `clearAllAffiliateClicks`.
- Faire appeler cette Function depuis les deux interfaces.

#### 6. Ajouter un export avant purge

Avant `clearAllSessions` ou `clearAllAffiliateClicks`, proposer :

- export CSV,
- export JSON,
- ou sauvegarde dans Storage.

Utile pour :

- analyse historique,
- preuves business,
- debug avant nettoyage.

#### 7. Ajouter des indexes/metriques serveur

Aujourd'hui les dashboards recalculent tout cote client.

Pour volumes plus grands :

- Compteurs journaliers dans `analytics_daily`.
- Compteurs clics journaliers dans `affiliate_daily`.
- Agregation Cloud Function au moment du clic/session.

Avantage :

- Dashboard plus rapide.
- Pas de limite 1000/3000 pour les KPIs.

### Priorite basse

#### 8. Schema SEO `ItemList` pour le Comptoir

Ajouter dans `ShopView.jsx` un schema `ItemList` avec les produits publies :

```js
{
  '@type': 'ItemList',
  itemListElement: affiliateProducts.map((p, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: p.name,
      brand: p.brand,
      image: p.imageUrl,
      description: p.description,
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: 'https://tousatable-madeinnormandie.fr/comptoir'
      }
    }
  }))
}
```

Attention :

- Pour des liens affilies, eviter de mettre l'URL externe comme canonical produit interne.
- Garder `/comptoir` comme URL de page.

#### 9. Ajouter `referrer` reel dans `affiliate_clicks`

Le champ est autorise par rules mais pas renseigne.

Possible payload :

```js
referrer: document.referrer || window.location.pathname
```

Mais attention :

- Eviter de stocker des URLs contenant des infos sensibles.

#### 10. Clarifier `clickCount`

Options :

- Supprimer le champ legacy `clickCount` des nouveaux produits.
- Ou le renommer mentalement/documenter comme `initialClickCount`.
- Ou le maintenir via Function si besoin de lecture rapide.

---

## 13. Check-list de verification fonctionnelle

### Traffic sessions

- Ouvrir le site en navigation normale.
- Attendre 3 secondes.
- Verifier dans Firestore qu'une session `anonymous` apparait.
- Naviguer galerie -> detail -> comptoir.
- Attendre 15 secondes.
- Verifier que `journey` contient les pages.
- Masquer l'onglet ou fermer.
- Verifier que `sessionActive` passe a `false`.
- Se connecter admin.
- Verifier que les sessions admin ne polluent pas `AdminAnalytics`.
- Verifier `AdminIPTracker` dans `sys_metadata/admin_ips`.

### Affiliation

- Creer un produit draft dans AdminShop.
- Verifier qu'il n'apparait pas dans `/comptoir`.
- Publier le produit.
- Verifier apparition en temps reel.
- Cliquer sur le CTA en visiteur anonyme.
- Verifier creation `affiliate_clicks`.
- Verifier `sessionId` si la session analytics etait initialisee.
- Verifier le KPI dans AdminShop.
- Verifier l'onglet "Boutique Affiliation" dans AdminAnalytics.
- Cliquer depuis une fiche meuble recommandee.
- Verifier `source = gallery_detail` et `parentFurnitureName`.

### SEO

- Verifier `/comptoir` :
  - title,
  - meta description,
  - canonical,
  - JSON-LD.
- Verifier `sitemap` :
  - presence de `/comptoir`.
  - absence de `undefined`.
- Verifier `shareMeta?path=/comptoir` :
  - title/description OG corrects.

---

## 14. Conclusion

Le socle est sain : les sessions sont centralisees via Cloud Functions, le tracking affiliation est unifie dans `trackAffiliateClick`, les dashboards donnent une lecture exploitable, et le Comptoir dispose deja d'une base SEO correcte.

Le principal sujet n'est pas l'existence du tracking, mais la **durcification data** :

- filtrer ce qui est expose publiquement,
- mieux valider les clics,
- automatiser la retention,
- clarifier les limites des KPIs,
- aligner les labels entre journey et UI admin.

Avec ces ajustements, la partie data traffic + affiliation deviendra beaucoup plus fiable pour piloter le site, tout en gardant une bonne lisibilite business pour le client.

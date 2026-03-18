bui# Rapport de Session — Audit Marketplace & iOS
**Date** : 18 mars 2026 — 11h54
**Agent** : Claude Sonnet 4.6
**Projet** : Tous à Table Made in Normandie (`tousatable-madeinnormandie.fr`)
**Branches** : `main` (seule branche active)

---

# Rapport de Session Complémentaire — Amélioration UX Modale Stripe (Restauration immédiate)
**Date** : 18 mars 2026
**Agent** : Cline
**Projet** : Tous à Table Made in Normandie
**Branches** : `main`

## Amélioration UX : Restauration optimiste du meuble à la fermeture de Stripe

**Problème** : Lors de la fermeture de la modale Stripe via la croix, l'annulation de la commande et la remise en stock sont déclenchées. Cependant, durant le court délai de confirmation de la base de données, le listener temps réel React considérait encore l'article comme "vendu" et pouvait paniquer en affichant l'écran d'erreur "Victime de son succès".

**Fix implémenté** :
- **Fichier** : `src/pages/CheckoutView.jsx`
- La croix de la modale Stripe supprime désormais immédiatement l'article de la liste "indisponible" du côté de votre navigateur, avant même d'attendre la confirmation de la base de données (mise à jour optimiste).
- Ainsi, le navigateur ne peut plus se tromper en affichant "Victime de son succès" quand c'est vous-même qui venez de relâcher le meuble. Le comportement de la page est maintenant d'une logique parfaite.

---

# Rapport de Session Complémentaire — Audit Interopérabilité Auth iOS / Desktop
**Date** : 18 mars 2026 — 12h27
**Agent** : Cline
**Projet** : Tous à Table Made in Normandie (Sandbox `tatmadeinnormandie`)
**Branches** : `main`

## Contexte de la session complémentaire

Suite aux mises à jour précédentes (notamment sur la politique de sécurité CSP), les utilisateurs ont signalé que l'authentification Google ne fonctionnait plus ni sur Desktop (Windows) ni sur Mobile (Android). Le processus tournait dans le vide puis renvoyait vers le panneau de connexion sans succès.

## Bugs corrigés

### 🔴 BUG — Authentification Google bloquée silencieusement (CRITIQUE)
**Fichier** : `firebase.json`

**Problème** : Lors de l'ajout des headers de sécurité, la politique `X-Frame-Options` a été réglée sur `DENY` et la politique `Content-Security-Policy` pour `frame-src` n'incluait pas `'self'`. Firebase Authentication s'appuie sur une iframe cachée (ex: `/__/auth/iframe`) pour relayer l'état de connexion, surtout lors de l'utilisation de `signInWithPopup` (Desktop) ou pour maintenir la session via OAuth. Le navigateur bloquait cette iframe, ce qui faisait échouer silencieusement le processus d'authentification sur tous les environnements modernes.

**Fix implémenté** :
- `X-Frame-Options` : Modifié de `DENY` à `SAMEORIGIN`.
- `Content-Security-Policy` (`frame-src`) : Ajout de `'self'` dans la liste des sources autorisées.

### 🔴 BUG — Modale Stripe (PaymentElement) invisible / bloquée hors écran (CRITIQUE IOS)
**Fichier** : `src/pages/CheckoutView.jsx`

**Problème** : Sur iPhone, lorsque l'utilisateur cliquait sur "Procéder au paiement", l'écran s'assombrissait (couche `rgba` noire) mais la modale blanche Stripe ne s'affichait jamais. Ce comportement était causé par un bug de rendu CSS natif à Safari iOS (le *Stacking Context*). La modale Stripe (`position: fixed`) était imbriquée à l'intérieur d'un conteneur qui possédait des règles d'animation `transform` (`animate-in fade-in`). Sur iOS, cela casse le positionnement absolu par rapport au *viewport* et propulse la modale hors de l'écran du téléphone.
De plus, la mécanique de blocage de scroll iOS (verrouillage de `body.modal-open` avec `top` négatif) venait empirer le comportement en décalant l'écran.

**Fix implémenté** :
- **`createPortal`** : La modale Stripe a été sortie de l'arborescence DOM complexe du conteneur parent. Elle est désormais injectée à la racine absolue du site (`document.body`) grâce à `createPortal`, avec un `z-index` de `99999`, ce qui garantit son affichage centré sur 100% des appareils, contournant les bugs de "Stacking Context" d'iOS.
- Suppression du script lourd de *body scroll lock* natif dans `CheckoutView` qui causait des décalages imprévisibles sur Safari Mobile PWA.

### 🔴 BUG — Faux Positif : Erreur "Victime de son succès" déclenchée par l'acheteur légitime (CRITIQUE)
**Fichier** : `src/pages/CheckoutView.jsx`

**Problème** : L'agent précédent avait implémenté un système de sécurité "Anti-Race Condition" (réservation instantanée du meuble dans Firestore lors du clic sur "Procéder au paiement"). 
Cependant, l'interface Frontend de React écoute la base de données en temps réel (`onSnapshot`). Ainsi, quand l'acheteur légitime cliquait sur le bouton de paiement :
1. Le serveur réservait le meuble pour lui (`sold: true`).
2. L'interface React voyait le meuble comme "Vendu", paniquait, et affichait l'écran d'erreur *"Victime de son succès"* en empêchant l'utilisateur de voir sa modale Stripe. 
Le problème se manifestait aussi lors de l'annulation d'un paiement Stripe (le délai de 500ms du serveur pour remettre le meuble en `sold: false` déclenchait l'écran d'erreur).

**Fix implémenté** :
- Le Frontend est désormais "intelligent". L'alerte "Victime de son succès" ne se déclenche plus si l'application sait que la réservation est effectuée par *l'utilisateur lui-même* (état `ready_to_pay`) ou pendant le nettoyage de l'annulation de la commande Stripe (`isCleaningUp: true`). 
- Le système "Anti-doublon / Race Condition" reste intact, mais protège désormais l'acheteur légitime.

---

## Audit d'interopérabilité iOS (PWA et Safari)

Un audit de l'implémentation iOS (`AuthContext.jsx` et environnement) a été réalisé pour garantir que la méthode de connexion est la plus optimale :

| Mécanisme | État / Analyse |
|-----------|----------------|
| **Détection iOS Standalone (PWA)** | ✅ Excellente pratique. Le WebKit d'Apple bloque les popups si l'app est ajoutée à l'écran d'accueil. Rediriger vers `signInWithRedirect` dans ce cas précis est obligatoire. |
| **Persistance anti-race condition** | ✅ L'utilisation de `sessionStorage` (`tat_google_redirect_pending`) pour empêcher le déclenchement de `signInAnonymously` au retour de la redirection Google est la solution idéale, car l'état React ne survit pas au rechargement complet de la page. |
| **Filet de sécurité (Email/Mot de passe)** | ✅ Indispensable. Sur iOS, le comportement des redirections OAuth en PWA (ITP - Intelligent Tracking Prevention) peut parfois renvoyer l'utilisateur vers Safari au lieu de la PWA. Conserver la méthode par email garantit qu'aucun utilisateur n'est bloqué. |

> **⚠️ Recommandation pour la Production**
> Pour éviter les blocages de cookies cross-domain (ITP) par Safari, assurez-vous que `VITE_FIREBASE_AUTH_DOMAIN` dans `.env.prod` correspond à `tousatable-madeinnormandie.fr`, et que ce domaine est bien ajouté dans les "Authorized redirect URIs" de la console Google Cloud (`https://tousatable-madeinnormandie.fr/__/auth/handler`).

---

## Contexte de la session

L'utilisateur a signalé des problèmes récents sur iOS. Une session précédente (16 mars 2026) avait déjà traité les fixes iOS de base (auth Google standalone, CSP, scroll lock, safe-area). Cette session a réalisé un **audit complet** de la logique marketplace, authentification et paiements, puis a corrigé les bugs identifiés.

---

## Fichiers modifiés lors de cette session

| Fichier | Type de modification |
|---------|---------------------|
| `functions/src/commerce/createOrder.js` | Fix critique (stock reservation) |
| `functions/src/commerce/stripeWebhook.js` | Fix critique (anti-double-décrément + restore stock) |
| `functions/src/commerce/cancelOrder.js` | Fix (calcul stock restauré incorrect) |
| `src/pages/CheckoutView.jsx` | Fix critique (cleanup modal + stale closure) |
| `firebase.json` | Fix sécurité (CSP HTTP→HTTPS) |
| `src/app.jsx` | Fix mineur (doublon setCartItems) |

---

## Bugs corrigés

### 🔴 BUG 1 — Race condition de survente (CRITIQUE)
**Fichiers** : `createOrder.js` + `stripeWebhook.js`

**Problème** : Pour la méthode de paiement `stripe_elements`, le stock n'était **pas décrémenté** lors de la création de la commande. Il n'était décrémenté que dans le webhook Stripe. Cela permettait à deux utilisateurs d'acheter simultanément le même article unique → deux commandes `paid` pour un seul article physique.

La méthode `manual` (virement) décrémentait correctement le stock dès la création — `stripe_elements` ne le faisait pas.

**Fix implémenté** :
- `createOrder.js` (bloc `stripe_elements`) : Ajout d'une **transaction atomique Firestore** qui réserve le stock ET crée la commande en même temps (comme pour `manual`). Flag `stockReserved: true` posé sur le document commande.
- Si la création du PaymentIntent Stripe échoue après la réservation : une seconde transaction **restaure le stock** et supprime la commande.
- `stripeWebhook.js` (handler `payment_intent.succeeded`) : Vérifie `order.stockReserved`. Si `true`, saute le décrément (déjà fait). **Rétrocompatible** : les commandes sans ce flag (créées avant le fix) continuent à décréménter dans le webhook comme avant.
- `stripeWebhook.js` (handler `payment_intent.payment_failed`) : Restaure le stock atomiquement si `order.stockReserved === true` et `order.status !== 'paid'`. Remet `sold: false`, supprime `soldAt` et `buyerId`.

**Nouveau flag Firestore sur les commandes** :
```
stockReserved: boolean  // true = stock décrément à la création, false = legacy (webhook décrémente)
```

---

### 🔴 BUG 2 — Commandes `pending_payment` orphelines + stock bloqué (CRITIQUE)
**Fichier** : `CheckoutView.jsx`

**Problème** : Quand un utilisateur ouvrait le modal de paiement Stripe puis le fermait sans payer, la commande `pending_payment` restait en Firestore indéfiniment. Avec le fix BUG 1, cela bloquait aussi le stock de l'article (réservé mais jamais payé ni annulé). En ouvrant le modal plusieurs fois, plusieurs commandes orphelines s'accumulaient.

**Fix implémenté** :
- Nouvelle fonction `handleClosePaymentModal()` dans `CheckoutView.jsx`.
- Quand l'utilisateur ferme le modal (croix ou clic sur le fond sombre), cette fonction appelle la Cloud Function `cancelOrderClient` avec l'`orderId` courant.
- `cancelOrderClient` annule la commande et restaure le stock (transaction atomique côté serveur).
- `clientSecret` et `createdOrderId` sont remis à `null` pour que le prochain clic sur "Procéder au paiement" crée une commande fraîche.
- L'appel est non-bloquant (fire-and-forget avec gestion d'erreur) pour ne pas ralentir l'UX.

---

### 🔴 BUG 3 — `cancelOrder.js` restaurait le stock à 1 en dur (CRITIQUE)
**Fichier** : `cancelOrder.js`

**Problème** : La fonction `cancelOrderClient` (utilisée pour les annulations client) faisait `stock: 1` en dur au lieu d'incrémenter par la quantité achetée. Pour un article avec stock > 1, le stock aurait été faussé après annulation.

**Fix implémenté** :
- Utilise `currentStock + qtyToRestore` (`item.quantity || 1`).
- Utilise `admin.firestore.FieldValue.delete()` pour supprimer `soldAt` et `buyerId` proprement (au lieu de les laisser ou les mettre à `null`).
- Déclenche la restauration si `itemData.sold === true` **OU** si `orderData.stockReserved === true` (pour les commandes créées avec le nouveau système de réservation).

---

### 🟡 BUG 4 — Stale closure dans les handlers de formulaire
**Fichier** : `CheckoutView.jsx`

**Problème** : `handleChange` utilisait `setFormData({ ...formData, [name]: value })` — capture la valeur de `formData` au moment du render. En cas de mises à jour rapides successives (ex. autocomplétion qui déclenche plusieurs onChange), certaines mises à jour pouvaient être perdues.

**Fix** : Pattern fonctionnel `setFormData(prev => ({ ...prev, [name]: value }))` dans `handleChange` et `handleAddressRelatedChange`.

---

### 🟡 BUG 5 — CSP : URL HTTP non sécurisée
**Fichier** : `firebase.json`

**Problème** : `connect-src` contenait `http://ip-api.com` (HTTP non sécurisé). Les navigateurs modernes peuvent bloquer les requêtes HTTP mixtes, et c'est une mauvaise pratique de sécurité.

**Fix** : `http://ip-api.com` → `https://ip-api.com`

---

### 🟢 BUG 6 — Double `setCartItems([])` dans `handlePlaceOrder`
**Fichier** : `app.jsx`

**Problème** : `setCartItems([])` était appelé deux fois consécutivement (lignes 492 et 495). Le second appel était inutile.

**Fix** : Suppression du doublon.

---

## État iOS après cette session

Tous les points iOS vérifiés lors de l'audit :

| Point | Statut |
|-------|--------|
| `signInWithRedirect` en mode PWA standalone (WebKit ne supporte pas popup) | ✅ OK |
| `getRedirectResult` exécuté avant `signInAnonymously` (anti-race condition) | ✅ OK |
| Flag `sessionStorage` (`tat_google_redirect_pending`) qui survit aux reloads | ✅ OK |
| Body scroll lock iOS : `position:fixed` + save/restore de `scrollY` | ✅ OK |
| Input font-size ≥ 16px via `@supports (-webkit-touch-callout: none)` | ✅ OK |
| `onPointerDown` sur les items des dropdowns (evite le blur avant sélection) | ✅ OK |
| `window.visualViewport` API pour repositionner le dropdown avec clavier ouvert | ✅ OK |
| `safe-area-inset-bottom` + `dvh` sur les éléments ancrés en bas | ✅ OK |
| `viewport-fit=cover` + `apple-mobile-web-app-capable` dans `index.html` | ✅ OK |
| Signature webhook Stripe vérifiée (pas de fallback non signé) | ✅ OK |
| Prix recalculé côté serveur (jamais confiance au prix client) | ✅ OK |
| Firebase App Check + rate limiting (3 logs/min, 5 bids/min) | ✅ OK |
| Modal Stripe dans un `createPortal` sans `AnimatePresence` imbriqué | ✅ OK |

---

## Action manuelle requise avant déploiement prod

> ⚠️ **Non codé — à faire manuellement dans les consoles**

Si la prod (`tousatable-client`) utilise `signInWithRedirect` pour les utilisateurs en mode PWA standalone iOS, les 3 étapes suivantes doivent être vérifiées/complétées (voir aussi `todoIOS.md`) :

1. **`.env.prod`** → vérifier `VITE_FIREBASE_AUTH_DOMAIN=tousatable-madeinnormandie.fr`
2. **Firebase Console** → projet `tousatable-client` → Authentication → Settings → Authorized domains → vérifier que `tousatable-madeinnormandie.fr` est présent
3. **Google Cloud Console** → projet `tousatable-client` → APIs & Services → Credentials → OAuth 2.0 Web client → Authorized redirect URIs → vérifier `https://tousatable-madeinnormandie.fr/__/auth/handler`

Si ces 3 étapes ne sont pas faites en même temps, l'auth Google casse complètement en prod (erreur "Access blocked — This app's request is not valid").

---

## Architecture paiement actuelle (après fix)

```
UTILISATEUR CLIQUE "PROCÉDER AU PAIEMENT"
         ↓
[createOrder Cloud Function]
  → Transaction Firestore atomique :
      • Vérifie stock disponible
      • Décrémente stock (sold=true si stock=0)
      • Crée commande { status: 'pending_payment', stockReserved: true }
  → Crée PaymentIntent Stripe
  → Retourne { clientSecret, orderId }
         ↓
MODAL STRIPE AFFICHÉ (PaymentElement + ExpressCheckout)
         ↓
    ┌────────────────────────────────┐
    │ FERMETURE SANS PAYER           │
    │  → handleClosePaymentModal()   │
    │  → cancelOrderClient CF        │
    │  → Stock restauré              │
    │  → Commande annulée            │
    └────────────────────────────────┘
         ↓
    ┌────────────────────────────────┐
    │ PAIEMENT EFFECTUÉ              │
    │  → stripe.confirmPayment()     │
    │  → Webhook payment_intent.     │
    │    succeeded                   │
    │  → Vérifie stockReserved=true  │
    │  → NE décrémente PAS le stock  │
    │  → Commande → { status: paid } │
    └────────────────────────────────┘
         ↓
    ┌────────────────────────────────┐
    │ ÉCHEC DE PAIEMENT              │
    │  → Webhook payment_intent.     │
    │    payment_failed              │
    │  → stockReserved=true          │
    │  → Stock restauré              │
    │  → Commande → payment_failed   │
    └────────────────────────────────┘
```

---

## Prochaines étapes recommandées

1. **Déployer les Cloud Functions** : `firebase deploy --only functions`
2. **Déployer le hosting** : `firebase deploy --only hosting`
3. **Tester le flow complet sur iPhone** :
   - Login Google en Safari normal (popup)
   - Login Google en mode PWA standalone (redirect)
   - Ajouter article au panier → checkout → ouvrir modal → fermer sans payer → vérifier que le stock est restauré dans Firestore
   - Finaliser un vrai paiement test Stripe → vérifier la commande `paid` en Firestore
4. **Configurer Stripe webhook `payment_intent.payment_failed`** : Vérifier dans le dashboard Stripe que cet événement est bien activé dans la configuration du webhook endpoint.
5. **Optionnel** : Ajouter un handler `payment_intent.canceled` dans le webhook (pour les PaymentIntents expirés après 24h) qui restaure le stock des commandes `stockReserved`.

---

## Stack technique (rappel pour le prochain agent)

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18.3 + Vite 5.4 + Tailwind CSS 4 |
| Backend | Firebase Cloud Functions v1 (Node.js) |
| Base de données | Cloud Firestore |
| Auth | Firebase Auth (Google OAuth + Email/Password) |
| Paiement | Stripe (PaymentElement + ExpressCheckoutElement) |
| Hébergement | Firebase Hosting |
| Anti-bot | Firebase App Check (ReCaptcha v3) |

**Collections Firestore principales** :
- `artifacts/{appId}/public/data/furniture/{id}` — Meubles
- `artifacts/{appId}/public/data/cutting_boards/{id}` — Planches
- `orders/{id}` — Commandes
- `users/{uid}/cart/{id}` — Panier utilisateur
- `sys_ratelimit/{key}` — Rate limiting
- `sys_idempotency/{key}` — Idempotence enchères

**`appId`** = valeur de `VITE_APP_LOGICAL_NAME` dans `.env` (défaut: `tat-made-in-normandie`)

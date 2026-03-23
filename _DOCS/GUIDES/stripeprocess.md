# 💳 Guide Complet : Intégration Stripe (Sandbox & Production)

Ce document décrit pas à pas la configuration complète du flux de paiement Stripe pour le projet "Tous à Table", depuis un environnement vierge jusqu'en production. Il s'adresse aussi bien à un développeur humain qu'à un agent IA.

## 🔗 Liens Rapides
- **Dashboard Stripe :** [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
- **Clés d'API (Standard) :** [Mode Test](https://dashboard.stripe.com/test/apikeys) / [Mode Live](https://dashboard.stripe.com/apikeys)
- **Webhooks :** [Mode Test](https://dashboard.stripe.com/test/webhooks) / [Mode Live](https://dashboard.stripe.com/webhooks)

---

## 🔑 Chapitre 1 : Comprendre les clés Stripe

Dans Stripe, il existe **3 types de clés essentielles**, à configurer en double (une version pour l'environnement `Test` et une pour la `Production/Live`).

### 1. Clé Publique (Publishable Key)
- **Format :** Commence par `pk_test_...` (Sandbox) ou `pk_live_...` (Production).
- **Rôle :** Utilisée par le **Frontend** (l'application React) pour afficher le module de paiement sécurisé (Stripe Elements) et interagir avec Apple/Google Pay.
- **Où la mettre :** Dans les fichiers `.env` à la racine du projet (cf. Chapitre 2).

### 2. Clé Secrète (Secret Key)
- **Format :** Commence par `sk_test_...` (Sandbox) ou `sk_live_...` (Production).
- **Rôle :** Utilisée par le **Backend** (Firebase Functions : notamment `createOrder`) pour dialoguer de serveur à serveur avec Stripe (création des "Intentions de paiement").
- **Où la mettre :** Sur les serveurs Firebase via Google Cloud Secret Manager (cf. Chapitre 3). ⚠️ Ne **JAMAIS** exposer cette clé dans le code source ou le frontend.

### 3. Secret de Signature Webhook (Webhook Secret)
- **Format :** Commence par `whsec_...`
- **Rôle :** Utilisé par le **Backend** (Firebase Functions : `stripeWebhook`) pour vérifier cryptographiquement que les notifications de paiement (les webhooks) proviennent bien réellement de Stripe.
- **Où la mettre :** Sur les serveurs Firebase via Google Cloud Secret Manager (cf. Chapitre 3).

---

## 🌍 Chapitre 2 : Configuration Frontend (Fichiers .env)

Le frontend doit posséder la bonne Clé Publique (`VITE_STRIPE_PUBLIC_KEY`) au moment où le projet est *construit* (build).

1. Allez sur Stripe : [Développeurs > Clés d'API](https://dashboard.stripe.com/test/apikeys).
2. Notez la clé publique de **Test** et la clé publique **Live**.

Dans le dossier racine du projet de code, configurez les 3 fichiers suivants :

**Fichier `.env` (Environnement local) :**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**Fichier `.env.local` (Environnement Sandbox réseau - `tatmadeinnormandie`) :**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**Fichier `.env.prod` (Environnement Production réel - `tousatable-client`) :**
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

*Remarque technique : Le fichier `src/main.jsx` s'occupe de charger cette clé pour amorcer l'objet `stripePromise`.*

---

## ⚙️ Chapitre 3 : Configuration Backend (Les secrets Firebase)

Le serveur Firebase a besoin d'être au courant de la clé secrète Stripe et du Webhook cryptographique. 

### Étape 3.1 : La clé Secrète (`STRIPE_SECRET_KEY`)
1. Allez sur [Clés d'API Stripe](https://dashboard.stripe.com/test/apikeys) et récupérez la **clé secrète**.
2. Dans le terminal du projet, connectez-vous au bon alias Firebase et injectez la clé :

**Pour la Sandbox :**
```powershell
firebase use default
firebase functions:secrets:set STRIPE_SECRET_KEY
# (Collez la clé sk_test_... puis validez et retapez 'Y' pour déployer)
```

**Pour la Production :**
```powershell
firebase use prod
firebase functions:secrets:set STRIPE_SECRET_KEY
# (Collez la clé sk_live_... puis validez et retapez 'Y' pour déployer)
```

### Étape 3.2 : Création des Webhooks sur Stripe
Le webhook est un "coup de téléphone" automatisé que passe Stripe à notre serveur pour dire "Le client X vient de valider son paiement pour 50€".

1. Allez sur [Webhooks Stripe](https://dashboard.stripe.com/test/webhooks). (Pensez à bien différencier Test et Live via le bouton Mode Test en haut à droite).
2. Cliquez sur **Ajouter un endpoint**.
3. **Pointez la cible vers l'URL des fonctions :**
   - Sandbox : `https://us-central1-tatmadeinnormandie.cloudfunctions.net/stripeWebhook`
   - Production : `https://us-central1-tousatable-client.cloudfunctions.net/stripeWebhook`
4. **Cochez les  3 événements suivants (Crucial !) :**
   - `payment_intent.succeeded` : Confirme le paiement → déclenche emails + bloque le stock à "0".
   - `payment_intent.payment_failed` : Échec → remet le stock en magasin.
   - `payment_intent.canceled` : Abandon par l'utilisateur → remet le stock en magasin.
5. Une fois créé, cliquez sur **"Révéler"** sous *Secret de signature* pour obtenir la fameuse clé `whsec_...`.

### Étape 3.3 : Injecter le Secret Webhook coté Serveur (`STRIPE_WH_SECRET`)
Donnez cette signature `whsec_...` à Firebase pour qu'il reconnaisse Stripe.

**Pour la Sandbox :**
```powershell
firebase use default
firebase functions:secrets:set STRIPE_WH_SECRET
# (Coller le whsec_... correspondant au endpoint de Test)
```

**Pour la Production :**
```powershell
firebase use prod
firebase functions:secrets:set STRIPE_WH_SECRET
# (Coller le whsec_... correspondant au endpoint Live)
```

*(Si Firebase vous demande de redéployer, acceptez toujours avec `Y`).*

### Étape 3.4 : ✅ Vérification Finale (Sécurité Critique)
Une fois les clés de **Production (Live)** injectées, ne lancez rien sans vérifier une dernière fois.

**Protocole recommandé :**
1. Demandez à votre agent IA (**Antigravity**) de confirmer les clés enregistrées en production.
2. L'IA utilisera la commande `firebase functions:secrets:access` pour lire le contenu du coffre-fort.
3. Comparez les derniers caractères de la clé affichée par l'IA avec ceux affichés sur votre dashboard Stripe (Live).

> **Pourquoi ?** Pour éviter l'erreur de signature "Webhook Security Error" qui bloquerait les vraies commandes de vos clients et pour s'assurer qu'un copier-coller malheureux n'a pas écrasé une clé `Live` avec une clé `Test`.

---

## 🚀 Chapitre 4 : Le Processus de Déploiement "Safe"

Une fois que les clés sont configurées, il faut regénérer le code Frontend de manière ciblée pour accrocher le bon environnement.

### 🏜️ Workflow de Déploiement Sandbox
Le dev quotidien utilise le `default` et le build classique :
```powershell
firebase use default
npm run build 
firebase deploy
```

### 💎 Workflow de Déploiement Production
Pour basculer en production avec les clés réelles (Live) :
```powershell
firebase use prod
npm run build:prod
firebase deploy
```
*(⚠️ Note architecturale : La commande `npm run build:prod` lance `vite build --mode prod`, ce qui force Vite à lire le fichier `.env.prod` à la place des autres, injectant ainsi la clé Stripe Live).*

---

## 🛠️ Chapitre 5 : Architecture du Flux & Diagnostics Sécurité

Voici comment l'application orchestre le paiement (idéal pour le débug via IA) :

1. **Intention (`CheckoutView.jsx`)**
   - L'utilisateur finit son panier. Le frontend déclenche la Cloud Function `createOrder(us-central1)`.
2. **Négociation Sécurisée (`functions/src/commerce/createOrder.js`)**
   - Le backend demande l'autorisation à Stripe via la `STRIPE_SECRET_KEY`.
   - Il crée la commande Firestore avec un statut `pending`.
   - Il renvoie le token de sécurité (`clientSecret`) à React.
3. **Validation UI (`CheckoutView.jsx`)**
   - Le Pop-up de paiement Stripe s'affiche et demande le numéro de carte (ou Apple/Google Pay).
   - *Nota Bene :* En environnement Sandbox (`pk_test_`), Apple/Google Pay s'autovalident avec une fausse carte sans interroger le téléphone portable du client. En Production (`pk_live_`), la protection biométrique du smartphone est activée.
4. **Signal Asynchrone (Le Webhook)**
   - Le paiement est OK. Stripe tape sur `stripeWebhook(us-central1)`.
   - Si le log Firebase Functions mentionne `"Webhook Security Error: No signatures found"`, c'est que la clé `STRIPE_WH_SECRET` (`whsec_...`) est fausse, écrasée, ou appartient à l'autre endpoint de l'autre environnement.
5. **Résolution (`functions/src/commerce/stripeWebhook.js`)**
   - Le statut passe à `paid` (ou `cancelled`).
   - Le changement de statut déclenche une autre fonction Firebase (`onOrderUpdated` ou directement les logs) qui se charge alors d'envoyer l'autorisation au script d'Emailing pour que les 2 courriers de confirmation partent.
6. **Interface Utilisateur Finale (`OrderSuccessModal.jsx`)**
   - L'écran s'ouvre, lit le type de méthode de paiement (`paymentMethod === 'stripe_elements'`) et adapte le texte ("Paiement validé" au lieu de "Virement à effectuer").

---

## 💡 Chapitre 6 : Les 3 Mousquetaires de Stripe (Glossaire)

Pour ta connaissance perso, voici une image pour ne plus jamais les confondre :

### 1. La Clé Publique (`pk_...`) — **"La Vitrine"**
- **C'est quoi ?** C'est le code que tout le monde peut voir (ton client, le navigateur).
- **À quoi elle sert ?** Elle dit à Stripe : *"Hé, affiche-moi le beau formulaire de paiement vert et blanc de 'Tous à Table' sur cet écran."*
- **Sérénité :** Si quelqu'un la vole, il ne peut rien faire d'autre que... afficher ton formulaire sur son propre site. Pas de risque financier.

### 2. La Clé Secrète (`sk_...`) — **"La Signature du Patron"**
- **C'est quoi ?** C'est ton code confidentiel, ton "chéquier numérique".
- **À quoi elle sert ?** Elle permet à ton **serveur** de donner des ordres à Stripe : *"Stripe, je t'ordonne de créer une transaction de 650€ pour ce client précisément."*
- **Danger !!!** C'est la clé la plus sensible. Si un pirate l'a, il peut vider ton compte Stripe ou faire des remboursements sauvages. Elle reste **uniquement** cachée dans les secrets Firebase.

### 3. Le Secret Webhook (`whsec_...`) — **"Le Sceau de Cire"**
- **C'est quoi ?** C'est un tampon d'authentification.
- **À quoi elle sert ?** Quand Stripe t'envoie un mail automatique (le Webhook) pour dire *"C'est bon, le client a payé !"*, ton serveur utilise cette clé pour vérifier que l'enveloppe n'a pas été falsifiée par un pirate.
- **Symptôme :** Si cette clé est mauvaise, ton site dira toujours *"Paiement en attente"* même si l'argent est bien arrivé chez Stripe, car ton serveur refusera de croire le message.

---
*Dernière mise à jour par Antigravity : 23/03/2026*

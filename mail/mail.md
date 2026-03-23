---
Title: Rapport Systémique - Envoi d'Emails (Tous à Table)
Date: 23 Mars 2026
---

# 📋 Analyse & Rapport sur le Système d'Emails ("Order Emails")

Ce document détaille le fonctionnement, l'architecture et les procédures pour modifier l'envoi des emails transactionnels suite à une commande sur l'application Tous à Table. L'architecture est basée sur Firebase Cloud Functions.

---

## 🏗️ 1. Architecture du Système Actuel

La logique d'envoi d'emails se situe exclusivement côté Backend (Firebase Cloud Functions). Elle est déclenchée **automatiquement** par les événements de modification de la base de données Firestore.

### 📁 Fichiers Impliqués

- `functions/src/email/orderEmails.js` : **Le Coeur du système.** Contient toute la logique de construction des templates HTML et d'envoi.
- `functions/helpers/secrets.js` : Déclare la liaison avec les variables d'environnement sécurisées (Secret Manager de Google Cloud).
- `functions/helpers/config.js` : Utilisé pour récupérer l'URL du site (`SITE_URL`) selon l'environnement (Sandbox vs Prod).

### ⚙️ Le Moteur (Nodemailer)

L'application utilise la librairie **Nodemailer** configurée pour utiliser le service GMAIL (`service: 'gmail'`).

**Comment ça marche techniquement ?**
1. Un transporteur est créé via `nodemailer.createTransport()`.
2. Le transporteur s'authentifie chez Gmail grâce à deux clés cryptées hébergées sur Firebase Secret Manager :
   - `GMAIL_EMAIL` (L'adresse expéditrice)
   - `GMAIL_PASSWORD` (Un "Mot de passe d'application" généré par Google, pas le mot de passe habituel du compte).

---

## 🚀 2. Événements Déclencheurs (Triggers)

L'envoi d'un mail n'est pas fait directement depuis le Front-End (ce qui serait dangereux pour la sécurité). C'est Firebase qui "écoute" la base de données `orders/{orderId}`.

### ⚡ A. Création de Commande (`onOrderCreated`)
Déclenché dès qu'un document est créé dans la collection `orders`.

- **Paiement Différé ou Mode Manuel :** Envoie immédiatement un email à l'Admin (Nouvelle Commande) et au Client (Confirmation avec instructions de virement).
- **Paiement par Carte (Stripe Elements) :** Si la commande est créée mais l'état est `pending_payment` (en attente de validation Stripe), la fonction **stoppe l'envoi**. Elle attend la confirmation du paiement pour éviter d'envoyer un mail si la carte est refusée.

### 🔄 B. Mise à jour de Commande (`onOrderUpdated`)
Déclenché à chaque modification d'un attribut de la commande dans Firestore.

- **Confirmation de Paiement (Stripe) :** Si l'ancien statut était `pending_payment` et devient `paid`, les emails d'Admin (notif) et Client (reçu) sont envoyés simultanément.
- **Expédition (`shipped`) :** Si l'Admin passe la commande en mode expédiée, un email dédié est envoyé au client, incluant son numéro de suivi s'il est renseigné.
- **Livraison (`completed`) :** Si le statut passe à "Terminée", un email de remerciement pour la livraison est envoyé.

---

## 🔧 3. Comment changer l'adresse email d'envoi ?

Pour changer l'email qui envoie les récapitulatifs, vous ne devez faire **aucune modification de code**. Tout est géré par les variables d'environnement Firebase.

### Étape 1 : Obtenir un Mot de Passe d'Application (Compte Google Exigé)
Si le nouvel email est `nouvel_email@gmail.com` (G Suite ou Gmail Classique) :
1. Connectez-vous à ce compte sur Google.
2. Allez dans *Gérer votre compte Google > Sécurité*.
3. Activez la **Validation en 2 étapes** (obligatoire).
4. Cherchez **Mots de passe d'application** dans la barre de recherche des paramètres.
5. Créez un mot de passe (Nommez-le par ex. "Firebase Tous à Table").
6. **Copiez le mot de passe à 16 lettres** fourni à l'écran (ex: `abcd efgh ijkl mnop`).

### Étape 2 : Mettre à jour Firebase CLI (Terminal)
Ouvrez votre terminal à la racine ou dans le dossier `functions/` et tapez :

```bash
# 1. Écraser l'ancien email expéditeur
firebase functions:secrets:set GMAIL_EMAIL

# (Le terminal va vous demander de taper la valeur. Tapez : nouvel_email@gmail.com)

# 2. Écraser l'ancien mot de passe
firebase functions:secrets:set GMAIL_PASSWORD

# (Collez ici le mot de passe à 16 lettres généré à l'étape 1)
```

### Étape 3 : Déployer la modification
Une fois les secrets enregistrés dans Firebase, déployez la modification pour que les serveurs de Google rechargent la configuration :

```bash
firebase deploy --only functions:onOrderCreated,functions:onOrderUpdated
```

---

## 🎨 4. Design & Templates des Emails

Les emails sont générés en HTML "inline" directement dans le fichier `orderEmails.js`. 
Il n'y a pas de composants React pour les mails, c'est du code brut HTML/CSS.

- **Couleurs :** Utilisent la palette actuelle (accents orangés `#d97706`, encarts de paiement `#fffbeb`, bordures `#fcd34d`).
- **Comportement spécial :** L'email inclut un bloc "Instructions de règlement" au design spécifique orange/jaune **uniquement** si le moyen de paiement est `deferred` (différé).
- **Modification Front :** Si vous souhaitez modifier le texte d'un mail (ex: ajouter une image de logo), c'est dans `functions/src/email/orderEmails.js` aux alentours des lignes `52` (Admin) et `81` (Client) que le balisage HTML se trouve.

## 👔 5. Créer une adresse d'expédition dédiée (Méthode 100% Gratuite avec Image de Profil)

Si vous souhaitez abandonner votre adresse personnelle `matthis.fradin2@gmail.com` pour utiliser une adresse **dédiée à votre entreprise**, tout en gardant une belle **image de profil** (avatar logo) qui s'affiche chez vos clients et **sans payer 6€/mois pour Google Workspace**, voici la méthode idéale.

### L'Astuce de l'Adresse Dédiée
Beaucoup de nouveaux projets créent une nouvelle adresse Gmail qui "fait pro". C'est **100% gratuit**, parfait pour démarrer, et cela offre tous les avantages d'un compte Google natif.

Par exemple, créez :
- `contact.tousatable@gmail.com` 
- ou `tousatable.normandie@gmail.com`

**Pourquoi c'est la meilleure solution pour l'instant ?**
1. **C'est un vrai compte Google :** Vous cliquez sur "Gérer mon compte Google" sur cette nouvelle adresse, vous y insérez le logo *Tous à Table*, et tous vos clients le verront instantanément. 
2. **Impact Zéro sur le Code :** L'application est déjà programmée de base pour dialoguer avec du `@gmail.com`. Vous n'aurez **absolument pas** besoin de modifier une seule ligne du code `orderEmails.js` ! L'application l'enverra nativement.

---

### C'est quoi les étapes exactes ?

Ce que vous aurez à faire le jour J ne prendra pas plus de 10 minutes :

**Étape 1 : Le compte Google**
1. Allez sur Google et créez le nouveau compte Gmail dédié (`contact.tousatable@gmail.com`).
2. Mettez le Logo du site sur la photo du profil Google.
3. Allez dans *Sécurité > Validation en 2 étapes*, activez cette option, puis cherchez **"Mots de passe d'application"**. Générez-en un et copiez-le (ce sera un mot de passe de 16 lettres).

**Étape 2 : Le terminal (Développeur)**
Dites à l'application de ne plus envoyer de mails avec `matthis.fradin2` mais avec la nouvelle adresse.

Ouvrez le terminal dans VS Code (à la racine) et écrasez les secrets cryptés :
```bash
# 1. On modifie l'adresse
firebase functions:secrets:set GMAIL_EMAIL
# (Le terminal vous demande la valeur, tapez : contact.tousatable@gmail.com)

# 2. On modifie le mot de passe Firebase
firebase functions:secrets:set GMAIL_PASSWORD
# (Le terminal vous demande la valeur, copiez/collez les 16 lettres du mot de passe d'application)
```

**Étape 3 : On déploie**
Sauvegardez tout et déployez dans l'univers de production :
```bash
firebase deploy --only functions:onOrderCreated,functions:onOrderUpdated
```

Et c'est terminé ! 
Les emails partiront de votre nouvelle identité officielle et afficheront le beau logo *Tous à Table* défini sur Gmail, avec 0€ de frais et 0 risque de modification de code à prévoir.

## ⚙️ 6. Détails Techniques & Limites d'envoi

Il est important de comprendre qui fait quoi dans ce système pour anticiper la croissance du site.

### A. Est-ce un système Firebase ou JavaScript ?
C'est un système **100% JavaScript (Node.js)** utilisant une librairie célèbre appelée **Nodemailer**.
- **Nodemailer** est le "moteur" : il se connecte à Gmail, prépare l'enveloppe et envoie le mail.
- **Firebase Cloud Functions** est le "déclencheur" : il surveille la base de données et réveille Nodemailer dès qu'une commande est créée ou payée.

*L'avantage : Ce code est universel. Si vous changez de serveur un jour, le code d'envoi restera le même.*

### B. Limites d'envoi (Quotas Google)
Comme nous utilisons les serveurs de Google pour envoyer les mails (protocole SMTP), Google impose des limites de sécurité pour éviter le spam :

1. **Compte Gmail Gratuit (`@gmail.com`) :**
   - Limite : **500 e-mails par période de 24h**.
   - Capacité réelle : Environ **250 commandes/jour** (puisque chaque commande envoie généralement 1 mail au client + 1 mail à l'admin).
   - Coût : **0€**.

2. **Compte Google Workspace (Offre Pro) :**
   - Limite : **2 000 e-mails par période de 24h**.
   - Coût : Environ **6€/mois**.

**Conseil :** Pour le lancement du site, la solution gratuite (500 mails/jour) est largement suffisante. Si le site dépasse 250 commandes par jour, vous aurez alors les revenus nécessaires pour passer sereinement à l'offre Pro ou à un service d'envoi massif (type SendGrid ou Resend).

---

**Conclusion :** L'architecture est extrêmement solide. Elle isole complètement l'interface utilisateur de la logique back-end, assurant une conformité parfaite vis-à-vis des webhooks Stripe et prévenant le spam. La transition vers une adresse officielle dédiée (avec l'avatar) est une pure formalité DevOps.


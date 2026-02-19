# 📧 Migration Email : Passer la main au Client

Ce guide explique comment configurer l'envoi d'emails depuis le compte `tousatablemadeinnormandie@gmail.com` au lieu de ton compte perso.

## 1. Côté Client (Gmail) 🔐
*À faire par le client ou toi avec ses accès.*

1.  Se connecter sur **Google** avec le compte `tousatablemadeinnormandie@gmail.com`.
2.  Aller dans **Gérer votre compte Google** > **Sécurité**.
3.  Activer la **Validation en deux étapes** (2FA) si ce n'est pas déjà fait (obligatoire).
4.  Chercher **"Mots de passe des applications"** (barre de recherche en haut ou sous 2FA).
5.  Créer un mot de passe :
    *   **App** : "Autre" (Nommer : `Site Web Firebase`).
    *   **Générer**.
6.  Copier le **code de 16 caractères** (ex: `abcd efgh ijkl mnop`).

---

## 2. Côté Développeur (Terminal) 💻
*À faire depuis VS Code.*

1.  **Cibler la Production** :
    ```bash
    firebase use prod
    ```

2.  **Mettre à jour l'Identifiant (Email Client)** :
    ```bash
    firebase functions:secrets:set GMAIL_EMAIL
    # Entrer : tousatablemadeinnormandie@gmail.com
    ```

3.  **Mettre à jour le Mot de Passe (App Password)** :
    ```bash
    firebase functions:secrets:set GMAIL_PASSWORD
    # Entrer : le code de 16 caractères généré à l'étape 1
    ```

4.  **Redéployer les fonctions** (pour que les nouveaux secrets soient pris en compte) :
    ```bash
    firebase deploy --only functions
    ```

---

## 3. Nettoyage du Code (Pour te retirer de la boucle) 🧹
*À faire UNIQUEMENT quand tu voudras arrêter de recevoir les copies des commandes.*

1.  Ouvrir `functions/index.js`.
2.  Chercher la partie `const adminMailOptions` (environ ligne 610).
3.  Modifier la ligne `to` :
    ```javascript
    // AVANT (Toi + Client)
    to: `${adminEmail}, tousatablemadeinnormandie@gmail.com`,

    // APRÈS (Client uniquement - car adminEmail sera devenu le sien via l'étape 2)
    to: adminEmail,
    ```
4.  Redéployer : `firebase deploy --only functions`

---

## ✅ Résultat Final
*   **Expéditeur** : Les clients verront "De : Tous à Table <tousatablemadeinnormandie@gmail.com>".
*   **Destinataire Admin** : Le client recevra les alertes commandes directement sur son Gmail.
*   **Liberté** : Ton adresse perso n'apparaîtra plus nulle part dans le processus.

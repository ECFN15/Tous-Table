# 🌍 RÈGLES DES ENVIRONNEMENTS (Sandbox vs Production)

Ce document décrit comment gérer les deux environnements du projet **Tous à Table - Atelier Normand** de manière sécurisée pour éviter toute confusion entre le site de Test (Sandbox) et le site Client (Production).

---

## 🎯 Vue d'ensemble

| Environnement | Alias Firebase | Projet ID | Fichier ENV (Front) | Base de Données |
| :--- | :--- | :--- | :--- | :--- |
| **SANDBOX (Local/Test)** | `default` | `tatmadeinnormandie` | `.env` | `tatmadeinnormandie` (Test) |
| **PRODUCTION (Client)** | `prod` | `tousatable-client` | `.env.prod` | `tousatable-client` (Réelle) |

---

## 🛠️ 1. Environnement SANDBOX (Développement)

C'est votre environnement de travail par défaut. Utilisez-le pour coder, tester de nouvelles fonctionnalités et casser des choses sans risque.

### ➤ Lancer le site en local
Cette commande utilise les données de test (`tatmadeinnormandie`).
```bash
npm run dev
```

### ➤ Déployer sur le serveur de test (Sandbox)
Si vous voulez montrer une version de test en ligne sur `tatmadeinnormandie.web.app`.

1.  **Selectionner le projet de test** :
    ```bash
    firebase use default
    ```
2.  **Construire (Build Standard)** :
    ```bash
    npm run build
    ```
3.  **Envoyer en ligne** :
    ```bash
    firebase deploy
    ```

---

## 🚀 2. Environnement PRODUCTION (Site Client)

⚠️ **ATTENTION :** C'est le site réel. Toute modification ici est visible par les clients.

### ➤ ÉTAPE 1 : Basculer sur PROD
Il est impératif d'utiliser la **commande spécifique** pour que le site se connecte à la vraie base de données (via `.env.prod`).

```bash
firebase use prod
```
*(Confirmez que le terminal affiche : `Now using project: tousatable-client`)*

### ➤ ÉTAPE 2 : Build pour PROD
⚠️ N'utilisez **JAMAIS** `npm run build` simple pour la prod, sinon le site se connectera à la test-DB !

```bash
npm run build:prod
```

### ➤ ÉTAPE 3 : Vérification Backend (CRITIQUE)
Avant d'envoyer, vérifiez que le fichier `functions/.env` contient bien les **clés de production** (Stripe Live Key, etc.) et non les clés de test.
*Si vous n'êtes pas sûr, ne déployez pas les fonctions (`firebase deploy --only hosting`).*

### ➤ ÉTAPE 4 : Déploiement
```bash
firebase deploy
```

---

## 🔄 3. Retour à la normale

Une fois le déploiement en production terminé, **revenez TOUJOURS immédiatement** sur le projet par défaut.

```bash
firebase use default
```

---

## ❓ FAQ : Quand faire `firebase use default` ?

**Question** : *"Dois-je le faire avant chaque session de code ?"*

**Réponse** :
1.  **Pour coder (`npm run dev`)** : Non, pas obligatoire.
    *   Le site local (`localhost`) regarde uniquement votre fichier `.env`. Il se connecte donc déjà à la Sandbox.
    *   La commande `firebase use` ne change rien au fonctionnement de votre localhost.
2.  **Pour déployer (`firebase deploy`)** : **OUI, CRITIQUE.**
    *   Si vous étiez resté sur `prod` la veille et que vous tapez `firebase deploy` par habitude... vous écrasez le site client !
    *   👉 **Conseil de sécurité** : Prenez l'habitude de toujours taper `firebase use default` à la fin d'une session de mise en prod. Comme ça, vous êtes tranquille.


### Pour travailler (Tous les jours)
```bash
npm run dev
```

### Pour mettre à jour la PROD (Attention)
```bash
# 1. Je passe en mode PROD et je vérifie
firebase use prod
firebase projects:list  # (Doit montrer 'prod' en gras)

# 2. Je construis le site avec les configs PROD
npm run build:prod

# 3. J'envoie tout
firebase deploy

# 4. JE REVIENS EN IMMÉDIATEMENT EN SANDBOX
firebase use default
```


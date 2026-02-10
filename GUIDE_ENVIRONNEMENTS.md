# 🏗️ Guide des Environnements (Prod vs Dev)

Voici comment gérer vos deux versions du site "Tous à Table".

---

## 🎭 Les deux Environnements

| Environnement | Nom du Projet Firebase | Alias | Usage |
| :--- | :--- | :--- | :--- |
| **DEV (Bac à Sable)** | `tatmadeinnormandie` | `default` | Pour coder, tester, tout casser sans risque. |
| **PROD (Client)** | `tousatable-client` | `prod` | Le site officiel, propre, pour les clients. |

---

## 🛠️ Commandes Essentielles

### 1. Revenir en Sécurité (Mode DEV)
Si vous avez un doute, lancez toujours ceci pour être sûr de travailler sur le brouillon :
```bash
firebase use default
```

### 2. Déployer sur le site PROD (Mise en ligne Client)
Quand vous êtes prêt à mettre à jour le vrai site :

1.  **Construire le code** (Créer les fichiers optimisés avec la config PROD) :
    ```bash
    npm run build
    ```
    *(Cette commande utilise automatiqument le fichier `.env.production`)*

2.  **Basculer sur le projet PROD** :
    ```bash
    firebase use prod
    ```

3.  **Envoyer en ligne** :
    ```bash
    firebase deploy
    ```
    *(Envoie le Hosting, les Règles de sécurité, le Storage et les Fonctions)*

4.  **REVENIR IMMÉDIATEMENT EN DEV** (Réflexe de sécurité) :
    ```bash
    firebase use default
    ```

---

## 📂 Fichiers de Configuration (Ne pas toucher)

*   **`.env`** : Contient les clés du projet **DEV**. Utilisé par `npm run dev`.
*   **`.env.production`** : Contient les clés du projet **PROD**. Utilisé par `npm run build`.

---

## 🚨 En cas de Panique
Si vous ne savez plus sur quel projet vous êtes connectés :
```bash
firebase projects:list
```
Regardez où est écrit `(current)`.

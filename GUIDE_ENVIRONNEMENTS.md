
# 🚦 Guide de Survie : Les Environnements (Prod vs Dev)

Ce projet utilise deux environnements Firebase distincts pour garantir la sécurité de la production.
Voici comment jongler entre eux sans se perdre.

---

## 🧐 Comment savoir où je suis ?

Ouvrez un terminal dans VS Code et tapez :
```bash
firebase use
```

La ligne en couleur ou précédée de `(current)` indique l'environnement actif.

*   `default (tatmadeinnormandie)` 🟡 = **DEV** (Bac à Sable / Tout casser autorisé)
*   `prod (tousatable-client)` 🔴 = **PROD** (Site Client / Pas touche sauf déploiement)

---

## � Comment changer d'environnement ?

### 1. Aller sur le Bac à Sable (DEV) 🟡
Utilisez ceci 99% du temps quand vous codez ou testez localement.
```bash
firebase use default
npm run dev
```
*   **Base de Données** : `tatmadeinnormandie` (Données de test, "bordel")
*   **URL Locale** : `localhost:5173`

### 2. Aller sur la Production (PROD) 🔴
Utilisez ceci **UNIQUEMENT** pour déployer une version validée.
```bash
firebase use prod
npm run build
firebase deploy
```
*   **Base de Données** : `tousatable-client` (Données réelles, propres)
*   **URL Publique** : `https://tousatable-client.web.app`

---

## ⚠️ Piège à éviter (Attention !)

Si vous faites `firebase deploy` alors que vous êtes sur l'environnement de DEV (`default`), vous allez mettre à jour le site de test en ligne (`tatmadeinnormandie.web.app`), ce qui est sans danger.

**MAIS ATTENTION** : Si vous modifiez des règles de sécurité (`firestore.rules`) ou des fonctions (`functions/`) et que vous êtes sur le mauvais environnement, vous risquez de casser la prod.

**👉 TOUJOURS vérifier avec `firebase use` avant de lancer une commande `deploy`.**

---

## ☁️ Synchronisation Git (Indépendant)

Git (GitHub) est agnostique. Il sauvegarde le code, peu importe l'environnement Firebase actif.
*   **Commit/Push** sauvegarde votre travail.
*   Cela n'impacte PAS directement le site en ligne (pour ça, il faut `deploy`).

---
Auteur : Assistant IA - Février 2026

switch environement:

Pour retourner travailler tranquille (DEV) : Tapes : firebase use default 

(Hop, tu bascules sur la base de données "Bordel" et tu peux coder sans risque).

Pour mettre en ligne (PROD) : Tapes : firebase use prod 

(Attention, ici chaque modification est réelle pour les clients).
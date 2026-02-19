# 🌍 Guide des Environnements : Sandbox vs Production

Ce projet gère deux environnements distincts. Il est **CRUCIAL** de ne pas les mélanger pour ne pas écraser les données clients avec des données de test.

---

## 🎯 Résumé Rapide (Commandes)

### 🧪 1. Pour mettre à jour la SANDBOX (Test)
*Sert à tester les nouvelles fonctionnalités sans risques.*
- **Base de Données** : `tat-made-in-normandie` (Pleine de faux meubles)
- **URL** : [tatmadeinnormandie.web.app](https://tatmadeinnormandie.web.app)

```bash
# 1. Construire le site avec les clés SANDBOX (.env)
npm run build

# 2. Sélectionner le projet Sandbox (default)
firebase use default

# 3. Déployer
firebase deploy
```

---

### 🚀 2. Pour mettre à jour la PRODUCTION (Site Officiel)
*Le vrai site visible par les clients.*
- **Base de Données** : `tousatable-client` (Vrais produits, vraies commandes)
- **URL** : [tousatable-madeinnormandie.fr](https://tousatable-madeinnormandie.fr)

```bash
# 1. Construire le site avec les clés PROD (.env.prod)
# ⚠️ ATTENTION : Utiliser build:prod, pas build !
npm run build:prod

# 2. Sélectionner le projet Production (prod)
firebase use prod

# 3. Déployer
firebase deploy
```

---

## 🛠️ Ce qui a été modifié (Architecture)
*Février 2026 - Séparation des Builds*

**Le Problème avant :**
Vite utilisait par défaut le fichier `.env.production` pour **tous** les builds (même ceux destinés à la Sandbox). Résultat : le site de test se connectait à la vraie base de données de Prod et affichait les mauvais meubles.

**La Solution appliquée :**
1.  **Renommage** : `.env.production` est devenu `.env.prod` (pour ne plus être chargé automatiquement par erreur).
2.  **Scripts** : Ajout d'une commande spécifique dans `package.json`.
    *   `npm run build` → Utilise `.env` (Sandbox).
    *   `npm run build:prod` → Force l'utilisation de `.env.prod` (Production).

---

## 🛡️ Rappel Sécurité Git (Branches)
Ne codez jamais directement sur `main`.

1.  **Créer une branche** : `git checkout -b ma-feature`
2.  **Coder & Tester** (sur l'environnement Sandbox)
3.  **Sauvegarder** : `git add .` + `git commit -m "..."`
4.  **Fusionner sur main** : `git checkout main` + `git merge ma-feature`
5.  **Déployer en Prod** (voir commandes ci-dessus).

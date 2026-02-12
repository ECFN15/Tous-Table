---
description: Workflow de déploiement sécurisé sur l'environnement PRODUCTION (Site Client)
---

# 🚀 Workflow de Production (Site Client)

⚠️ **ATTENTION : Vous allez modifier le site RÉEL du client.**

---

### 1️⃣ CIBLAGE (Mode Production)
Active le profil de production du projet Firebase.

```powershell
firebase use prod
```
> *🚨 VÉRIFICATION IMPÉRATIVE : Le terminal DOIT afficher `Now using project: tousatable-client`*

---

### 2️⃣ CONSTRUCTION (Build Critique)
Compile le site avec les clés de production (Stripe Live, Base Client).

```powershell
npm run build:prod
```
> *❌ INTERDIT d'utiliser `npm run build` tout court ici (sinon connexion base test !)*

---

### 3️⃣ TIR (Mise en linge)
Envoie la nouvelle version chez Google.

```powershell
firebase deploy
```
> *✅ Le site `tousatable-madeinnormandie.fr` est à jour.*

---

### 4️⃣ SÉCURISATION (Retour immédiat)
Reviens sur le profil de test pour éviter les accidents futurs.

```powershell
firebase use default
```

---
### 📝 Résumé Rapide
| Étape | Commande | Critique ? |
| :--- | :--- | :--- |
| **1. Cibler** | `firebase use prod` | 🚨 OUI |
| **2. Build** | `npm run build:prod` | 🚨 OUI |
| **3. Envoyer** | `firebase deploy` | - |
| **4. Sortir** | `firebase use default` | ✅ OUI |

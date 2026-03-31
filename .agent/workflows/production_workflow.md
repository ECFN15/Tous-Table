---
description: Workflow de déploiement sécurisé sur l'environnement PRODUCTION (Site Client)
---

# 🚀 Workflow de Production (Site Client)

⚠️ **ATTENTION : Vous allez modifier le site RÉEL du client.**

---

### 0️⃣ VÉRIFICATION INITIALE (Obligatoire avant tout)
Avant toute chose, vérifie sur quel projet tu es actuellement.

```powershell
firebase use
```
> *🚨 Si la réponse n'est PAS `Active Project: prod (tousatable-client)`, passe à l'étape 1.*
> *🛑 Ne jamais passer à l'étape 2 sans avoir confirmé `prod (tousatable-client)` actif.*

---

### 1️⃣ CIBLAGE (Mode Production)
Active le profil de production du projet Firebase.

```powershell
firebase use prod
```
> *🚨 VÉRIFICATION IMPÉRATIVE : Le terminal DOIT afficher `Now using alias prod (tousatable-client)`*
> *🛑 STOP si ce n'est pas le cas. Ne pas continuer.*

---

### 2️⃣ CONSTRUCTION (Build Critique)
Compile le site avec les clés de production (Stripe Live, Base Client).

```powershell
npm run build:prod
```
> *❌ INTERDIT d'utiliser `npm run build` tout court ici (sinon connexion base test !)*

---

### 3️⃣ TIR (Mise en ligne)
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
> *✅ Vérifie que le terminal répond : `Now using alias default (tatmadeinnormandie)`*

---
### 📝 Résumé Rapide
| Étape | Commande | Critique ? |
| :--- | :--- | :--- |
| **0. Vérifier** | `firebase use` | 🚨 OUI |
| **1. Cibler** | `firebase use prod` | 🚨 OUI |
| **2. Build** | `npm run build:prod` | 🚨 OUI |
| **3. Envoyer** | `firebase deploy` | - |
| **4. Sortir** | `firebase use default` | ✅ OUI |

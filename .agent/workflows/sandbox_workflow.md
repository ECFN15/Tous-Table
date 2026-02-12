---
description: Workflow quotidien de développement sur l'environnement SANDBOX (Test)
---

# 🛠️ Workflow de Développement (Sandbox)

### 0️⃣ VÉRIFICATION (Où suis-je ?)
Pour savoir sur quel projet tu es connecté actuellement :

**A. Voir la liste des projets configurés :**
```powershell
firebase projects:list
```

**B. Voir l'alias actif (celui utilisé par les commandes `deploy`) :**
```powershell
firebase use
```
> *Si la réponse est `Active Project: default (tatmadeinnormandie)`, tu es en **SANDBOX**.*
> *Si la réponse est `Active Project: prod (tousatable-client)`, tu es en **PRODUCTION**.*

---

### 1️⃣ SÉCURITÉ (Le réflexe matin)
Assure-toi d'être sur l'environnement de TEST pour ne rien casser.

```powershell
firebase use default
```
> *✅ Vérifie que le terminal répond : `Now using alias default`*

---

### 2️⃣ CODAGE (La journée de travail)
Lance ton serveur local. Il utilise le fichier `.env` (donc les données de Test).

```powershell
npm run dev
```
> *🖥️ Ton site est accessible sur : `http://localhost:5173`*

---

### 3️⃣ MISE EN LIGNE (Sur le site de Test)
*Uniquement si tu veux montrer ton travail sur `tatmadeinnormandie.web.app`.*

**A. Construire** (Créer le dossier dist)
```powershell
npm run build
```

**B. Envoyer** (Mettre en ligne)
```powershell
firebase deploy
```

---
### 📝 Résumé Rapide
| Action | Commande |
| :--- | :--- |
| **Sécuriser** | `firebase use default` |
| **Coder** | `npm run dev` |
| **Déployer** | `npm run build` puis `firebase deploy` |

---
description: Workflow quotidien de développement sur l'environnement SANDBOX (Test)
---

# 🛠️ Workflow de Développement (Sandbox)

### 0️⃣ VÉRIFICATION (Où suis-je ?)
Pour savoir sur quel projet tu es connecté actuellement :

```powershell
firebase projects:list
```
> *Regarde la colonne **Project ID**. La ligne avec `(current)` est celle active.*

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

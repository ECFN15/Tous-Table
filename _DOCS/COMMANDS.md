# ⚡ Commandes Rapides (Terminal)

Ce fichier récapitule les commandes essentielles pour travailler sur le projet.

---

## 🛠️ Développement Local

### 1. Lancer le site sur ton PC uniquement
Pour travailler normalement.
```bash
npm run dev
```
*Accès :* `http://localhost:5173`

### 2. Lancer le site pour tester sur MOBILE (Wi-Fi)
Pour que ton téléphone puisse se connecter au site hébergé sur ton PC.
```bash
npm run dev -- --host
```
*Accès :* Regarde l'adresse `Network` qui s'affiche (ex: `http://192.168.1.XX:5173`). Ton téléphone doit être sur le même Wi-Fi.

---

## 🚀 Mise en Ligne

### 3. Construire le site (Optimisation)
À faire avant chaque déploiement pour préparer les fichiers.
```bash
npm run build
```

### 4. Déployer sur Internet
Envoie la version construite chez Google (Firebase).
```bash
firebase deploy
```
*Accès :* `https://tatmadeinnormandie.web.app`

---

## ⚡ Combo Gagnant (Build + Deploy)
Pour tout faire d'un coup (si tu es sûr de toi).

**Sur PowerShell (Windows) :**
```powershell
npm run build; firebase deploy
```

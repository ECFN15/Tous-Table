---
name: "Sandbox Environment"
description: "Expertise et sécurité pour l'environnement de développement SANDBOX (tatmadeinnormandie)."
---

# 🧪 Skill : Environnement SANDBOX

Ce skill est activé pour garantir que toute modification ou déploiement est effectué sur le projet de test.

## 🛡️ RÈGLES D'OR
1. **Target** : Le projet Firebase doit être `tatmadeinnormandie`.
2. **Switch** : Toujours exécuter `firebase use default` avant toute opération Firebase.
3. **URL** : https://tatmadeinnormandie.web.app

## 🚀 COMMANDES DE DÉPLOIEMENT
1. **Bascule** : `firebase use default`
2. **Vérification de sécurité** : 
   ```powershell
   powershell -File .agent/skills/sandbox/scripts/verify_sandbox.ps1
   ```
3. **Build & Deploy** :
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```

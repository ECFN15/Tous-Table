---
name: "Sandbox Environment Expert"
description: "Expert en gestion de l'environnement de développement (SANDBOX). À utiliser pour tout déploiement ou modification sur tatmadeinnormandie."
---

# 🧪 Skill : Environnement SANDBOX (TEST)

Ce skill garantit que vous travaillez EXCLUSIVEMENT sur l'environnement de test.

## 🛡️ RÈGLES DE SÉCURITÉ CRITIQUES
1. **Vérification Alias** : Avant toute action, lancez `firebase use default`.
2. **Identification** : Le projet ID doit être `tatmadeinnormandie`.
3. **Base de Données** : Vous interagissez avec la base de données de test.

## 🚀 WORKFLOW DE DÉPLOIEMENT SANDBOX
Lorsque l'utilisateur demande "Déploie sur Sandbox" ou utilise ce skill :

1. **Bascule de projet** :
   ```powershell
   firebase use default
   ```
2. **Vérification visuelle** (Optionnel) : Confirmez à l'utilisateur : "Je suis sur tatmadeinnormandie (Sandbox)".
3. **Build & Deploy** :
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```

## 🔗 LIENS UTILES
- **Hosting URL** : https://tatmadeinnormandie.web.app
- **Firebase Console** : https://console.firebase.google.com/project/tatmadeinnormandie/overview

---
name: "Production Environment"
description: "Expertise et sécurité pour l'environnement de PRODUCTION (tousatable-client)."
---

# 🚀 Skill : Environnement PRODUCTION

Ce skill est activé pour sécuriser les déploiements sur le site client en direct.

## 🛡️ RÈGLES D'OR (CRITIQUE)
1. **Bascule** : Toujours exécuter `firebase use prod`.
2. **Audit** : Lancer impérativement le script de vérification ci-dessous.
3. **Build** : Utiliser EXCLUSIVEMENT `npm run build:prod`. L'utilisation de `npm run build` est une faute grave en production.

## 🚀 WORKFLOW DE DÉPLOIEMENT SÉCURISÉ
1. **Pointage** : `firebase use prod`
2. **Vérification croisée** : 
   ```powershell
   powershell -File .agent/skills/production/scripts/verify_prod.ps1
   ```
3. **Compilation PROD** :
   ```powershell
   npm run build:prod
   ```
4. **Mise en ligne** :
   ```powershell
   firebase deploy --only hosting
   ```

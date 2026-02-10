---
description: Guide de déploiement safe pour le site Tous à Table (Prod & Dev)
---

# Guide de Déploiement Automatisé

Ce workflow te rappelle les commandes à exécuter.
Pour plus de détails, ouvre le fichier `GUIDE_DEPLOIEMENT.md`.

## 🚀 Option 1 : Déploiement PROD (Client)

1. S'assurer d'être sur la branche `main` et que tout est commit.
2. Viser la Prod :
   ```powershell
   firebase use prod
   ```
3. Construire le site (Mode Production) :
   ```powershell
   npm run build
   ```
4. Déployer (Hosting Uniquement) :
   ```powershell
   firebase deploy --only hosting
   ```

## 🏖️ Option 2 : Déploiement DEV (Bac à sable)

1. Viser le projet de Test :
   ```powershell
   firebase use default
   ```
2. Construire le site (Mode Développement forcé) :
   ```powershell
   npm run build -- --mode development
   ```
3. Déployer (Hosting Uniquement) :
   ```powershell
   firebase deploy --only hosting
   ```

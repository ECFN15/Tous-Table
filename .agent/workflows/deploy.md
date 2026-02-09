---
description: Guide de déploiement safe pour le site Tous à Table
---

# 🚀 Workflow de Déploiement Sécurisé

## Contexte
Ce workflow décrit comment déployer des modifications sans casser la production.

---

## 1. AVANT DE MODIFIER (Sécurité)

// turbo
```bash
# Vérifier sur quelle branche tu es
git status
```

// turbo
```bash
# S'assurer que tout est sauvegardé
git add -A && git commit -m "Sauvegarde avant modifications"
```

---

## 2. DÉVELOPPEMENT LOCAL

```bash
# Lancer le serveur local
npm run dev
```

- Teste tes modifications sur `http://localhost:5173`
- Ne déploie JAMAIS directement après un changement

---

## 3. DÉPLOIEMENT STAGING (Test)

// turbo
```bash
# Switcher sur le projet de staging
firebase use staging
```

// turbo
```bash
# Construire et déployer en staging
npm run build && firebase deploy
```

- Va sur `https://tatmadeinnormandie-staging.web.app`
- Teste TOUTES les fonctionnalités modifiées
- Fais tester par quelqu'un d'autre si possible

---

## 4. DÉPLOIEMENT PRODUCTION (Après validation)

// turbo
```bash
# Switcher sur le projet de production
firebase use production
```

// turbo
```bash
# Build + Deploy Production
npm run build && firebase deploy
```

---

## 5. APRÈS DÉPLOIEMENT

// turbo
```bash
# Créer un tag de version
git tag -a v1.X.X -m "Description des changements"
```

// turbo
```bash
# Pousser sur GitHub (si configuré)
git push origin main --tags
```

---

## ⚠️ EN CAS DE PROBLÈME CRITIQUE EN PROD

### Rollback Immédiat (Via Firebase Console)
1. Va sur https://console.firebase.google.com/project/tatmadeinnormandie/hosting
2. Clique sur "Historique des versions"
3. Sélectionne la version précédente
4. Clique "Rollback"

### Rollback Via Git (Plus propre)
```bash
# Voir les derniers commits
git log --oneline -10

# Revenir à un commit précis
git checkout <commit-hash>

# Redéployer
npm run build && firebase deploy
```

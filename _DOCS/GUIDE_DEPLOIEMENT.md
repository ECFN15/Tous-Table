# 🚀 Guide de Déploiement (Mise en Ligne)

Ce guide explique comment mettre à jour le site, soit pour les clients (PROD), soit pour les tests (BAC À SABLE).

---

## 1. 🚀 Mettre à jour le SITE PROD (Le VRAI)
**Objectif** : Mettre en ligne les nouveautés sur `tousatable-madeinnormandie.fr`. Les clients voient ça.

1.  **Stop** : Fais `Ctrl + C` dans le terminal si un serveur tourne déjà.
2.  **Cible** : Tape la commande suivante pour viser la Production :
    ```bash
    firebase use prod
    ```
3.  **Cuisine (Build)** : Tape la commande pour construire le site (avec la base VIDE/CLIENT) :
    ```bash
    npm run build
    ```
    *(Vite va utiliser `.env.production`)*
4.  **Tir (Deploy)** : Envoie le site chez Google :
    ```bash
    firebase deploy --only hosting
    ```

---

## 2. 🏖️ Mettre à jour le BAC À SABLE (Le Test)
**Objectif** : Mettre à jour `tatmadeinnormandie.web.app` pour montrer aux potes/testeurs, avec les meubles de test.

1.  **Cible** : Tape la commande suivante pour viser le projet de Test :
    ```bash
    firebase use default
    ```
2.  **Cuisine (Build Spécial)** : Tape cette commande spéciale pour forcer le mode test :
    ```bash
    npm run build -- --mode development
    ```
    *(Pourquoi cette rallonge ? Pour forcer Vite à utiliser `.env` normal et voir les meubles de test).*
3.  **Tir (Deploy)** : Envoie le site chez Google :
    ```bash
    firebase deploy --only hosting
    ```

---

## ⚠️ Rappel Important
*   **Ne jamais faire `firebase deploy` tout court** (sans `--only hosting`) sauf si tu sais exactement ce que tu fais (modifie le Backend).
*   Si tu as modifié, par exemple, une faute d'orthographe, tu dois idéalement faire la procédure **1** ET la procédure **2** si tu veux que les deux sites soient synchros.

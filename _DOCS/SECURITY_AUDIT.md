# 🛡️ Audit de Sécurité Client (Console & Bundle)

## 🕵️‍♂️ Analyse de Fuites d'Informations (Browser Side)

L'objectif était d'empêcher un utilisateur curieux ou malveillant d'obtenir des informations sur la structure du code ou les données en transit via les outils de développement (F12).

### 1. Reverse Engineering via Source Maps (CORRIGÉ)
*   **Risque** : Les "Source Maps" permettent de reconstruire le code source original à partir du code minifié. C'est utile pour le débogage mais catastrophique pour la sécurité du code propriétaire.
*   **Correction** : Configuration explicite `build.sourcemap: false` dans `vite.config.js`. Le code déployé est désormais une "boîte noire" minifiée.

### 2. Fuites via la Console (CORRIGÉ - PATCH CRITIQUE)
*   **Vulnérabilité** : Les développeurs laissent souvent des `console.log("User:", user)` ou `console.log("Order:", order)` pour déboguer. Ces logs restent en production et peuvent révéler des tokens, des IDs internes ou des logiques métier.
*   **Correction** : Utilisation de l'option `esbuild.drop: ['console', 'debugger']` dans Vite.
    *   **Résultat** : Toutes les instructions `console.log`, `console.warn`, `console.info` sont **physiquement supprimées** du code JavaScript lors de la compilation pour la production.
    *   Même si un développeur oublie un log critique, il n'arrivera jamais chez le client.

### 3. Exposition des Clés API (ANALYSÉ)
*   **État** : Les clés Firebase (`apiKey`, `authDomain`, `projectId`) sont visibles dans le bundle.
*   **Verdict** : **Ceci est normal et inévitable**. Firebase est conçu ainsi. La sécurité NE REPOSE PAS sur le secret de ces clés, mais sur les **règles de sécurité Firestore** (que nous avons blindées aux étapes précédentes) et les **domaines autorisés** dans la console Google Cloud.

---

## 🔒 Statut Final : "Client Hardened"
*   Console du navigateur : **Vide** (Silence radio).
*   Code Source : **Illisible** (Minifié, pas de maps).
*   Secrets : **Absents**.

Le site est dans sa configuration la plus robuste possible pour un déploiement public.

# 📝 Roadmap Technique & Améliorations (Post-Audit Janvier 2026)

Ce fichier recense les tâches techniques prioritaires identifiées suite à l'audit du projet.
**Objectif :** Passer d'un projet "Bien" (8/10) à "Excellent" (10/10) en termes de performance et de stabilité.

---

## 🔥 Priorité 1 : Performance & UX (Urgent)
*L'expérience utilisateur sur mobile et connexions lentes est la priorité absolue.*

- [ ] **Lazy Loading (Chargement Différé)**
    - [x] Implémenter le `React.lazy` pour les composants lourds (`ThreeBackground`, `GsapAnimations`).
    - [ ] Vérifier que `HomeView.jsx` ne charge pas tout le poids du site au premier affichage.
- [ ] **Optimisation des Images**
    - [ ] Vérifier que les images uploadées via l'Admin sont bien redimensionnées/compressées avant le stockage (créer un Hook ou Cloud Function si nécessaire).
    - [ ] Utiliser le format WebP partout si ce n'est pas déjà le cas.

---

## 🛠️ Priorité 2 : Nettoyage & Maintenabilité (Moyen Terme)
*Pour éviter que le code ne devienne un "plat de spaghettis" difficile à modifier.*

- [ ] **Refactoring `src/App.jsx`** (Actuellement ~20Ko / Trop gros)
    - [x] Extraire la logique d'authentification dans un Context (`AuthProvider`).
    - [x] Séparer les Routes dans un fichier `Router.jsx`.
- [ ] **Refactoring `src/features/admin/AdminHomepage.jsx`**
    - [x] Découper en sous-composants (ex: `AdminImageCard`).

---

## 🛡️ Priorité 3 : Sécurité & Robustesse (Vital)
*Pour dormir tranquille sans craindre un bug de paiement ou une faille.*

- [ ] **Tests Unitaires (Vitest/Jest)**
    - [ ] Écrire des tests pour les fonctions critiques du backend :
        - `createOrder` (Paiement Stripe).
        - `placeBid` (Logique des enchères).
- [ ] **Audit des Règles Firestore**
    - [ ] Relire `firestore.rules` pour s'assurer que personne ne peut lire les données d'un autre utilisateur ou modifier un prix.

---

## 🎨 Priorité 4 : Finitions (Nice to Have)

- [ ] **Accessibilité (A11y)**
    - [ ] Vérifier le contraste des textes (Beige sur Blanc ?).
    - [ ] Ajouter les `aria-label` sur les boutons sans texte (icônes).
- [ ] **Documentation Développeur**
    - [ ] Créer un `README.md` simple à la racine avec les commandes de base (`npm run dev`, `firebase deploy`) pour les futurs contributeurs.

---

*Fichier généré le 27/01/2026 suite à l'analyse croisée Gemini/Mistral.*

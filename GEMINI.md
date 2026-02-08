---
project_name: "Tous à Table - Atelier Normand"
last_updated: "2026-02-08 (Simplification Design)"
description: "Site e-commerce et vitrine pour un atelier d'ébénisterie d'art. Vente de meubles (enchères/achat direct) et planches à découper."
stack:
  frontend: "React + Vite"
  styling: "Tailwind CSS + GSAP (Animations)"
  backend: "Firebase (Hosting, Firestore, Storage, Functions, Auth)"
  payment: "Stripe"
---

# 📖 Documentation du Projet (Mémoire de l'IA)

Ce fichier sert de référence absolue pour toute IA (Gemini, ChatGPT, Claude) ou développeur travaillant sur ce projet. **À lire impérativement avant toute modification.**

---

## 🏗️ 1. Architecture & Structure des Dossiers

Le projet a été simplifié en Février 2026 pour ne garder que le design "Architectural" comme standard unique.

### 📂 Racine (`/`)
*   Contient les fichiers de configuration vitaux (`vite.config.js`, `firebase.json`, `package.json`). **NE PAS DÉPLACER.**
*   `functions/` : Le Backend (Node.js). C'est un sous-projet autonome déployé sur Google Cloud Functions.
*   `public/` : Fichiers statiques.
*   `_ARCHIVE/` : 
    *   `v1_full_theme_backup` : **SAUVEGARDE CRITIQUE** contenant l'intégralité du code avant la simplification (Atelier, thèmes saisonniers, logic de switching). À consulter pour réinstaller un ancien design.

### 📂 Source (`src/`)
*   **`pages/`** : Les Vues Principales.
    *   `HomeView.jsx` : Vitrine (Three.js, GSAP).
    *   `GalleryView.jsx` : Marketplace (Utilise désormais exclusivement `ArchitecturalLayout`).
    *   `ProductDetail.jsx` : Fiche produit (Utilise désormais exclusivement `ArchitecturalProductDetail`).
*   **`designs/architectural/`** : Le design system et les layouts par défaut du site.
*   **`features/admin/`** : Le Back-Office.
    *   `AdminStudio.jsx` : Gère désormais uniquement le forçage du mode (Light/Dark) pour le design Architectural.

---

## 🎨 2. Design System & UX (Architectural Only)

*   **Philosophie** : "Musée Contemporain", Editorial, Minimaliste.
*   **Typographie** : Serif dominante pour les titres, Sans-Serif épuré pour le corps.
*   **Layout** : Grilles larges, absence de bordures (remplacées par des jeux d'ombres ou de "rings"), focus total sur la photographie.
*   **Mode Forcé** : L'admin peut toujours forcer "Light", "Dark" ou "Auto" dans l'onglet `Studio` du dashboard.

---

## ⚡ 2b. Optimisations & Scalabilité

*   **Code Sharding Supprimé** : Les vues ne sont plus dispatchées entre plusieurs designs. La logique est directe et plus légère.
*   **useLiveTheme Simplifié** : Le hook ne charge plus les registres de thèmes complexes (`themeRegistry.js` supprimé), réduisant le poids du bundle.

    *   **Update Février 2026 (Refonte Architectural & Micro-Animations)** :
        *   **Layout "Dashboard"** : Équilibrage vertical strict entre la Description et les Actions. Zone de texte calibrée (~260px de haut) pour garantir que les boutons d'enchères (+10, +50, +100) soient visibles au premier coup d'œil.
        *   **AnimatedPrice Integration** : Remplacement des prix statiques par un composant animé (GSAP). Transition numérique fluide avec atterrissage "smooth" pour une sensation de luxe.
        *   **Suppression des Marges Mortes** : Retrait des spacers `mt-auto` et réduction des paddings pour unifier visuellement la description et le bloc de commande.
        *   **Header Épuré** : Typographie "Atelier Normand" agrandie (`text-xs`), symétrie verticale parfaite, bouton "Retour" déplacé hors du header pour alléger.
        *   **Layout Produit (Smart Scroll)** : Passage en **Body Scroll** (défilement naturel) avec **Sticky Left Column** pour l'image. Suppression des scrollbars internes.
        *   **Image "Tableau"** : Conteneur avec coins très arrondis (`rounded-[2.5rem]`), padding aéré et ombre portée douce.
        *   **Navigation Intuitive** : Bouton "Retour Collection" positionné **au-dessus de l'image** (Desktop & Mobile). Maison du design épuré.
        *   **Museum Gallery Hook (Desktop)** : Remplacement des boutons classiques par un appel à l'action "DÉCOUVRIR" central. Utilisation de coins architecturaux (brackets en L) qui convergent au survol pour un effet de mise au point "Galerie d'Art".
        *   **Hover Animation V2 (Snappy & Smooth)** : Optimisation des timings (800ms pour l'image, 600ms pour le hook) avec une courbe `cubic-bezier(0.23, 1, 0.32, 1)`. Résultat : une réactivité "nerveuse" lors du passage d'une carte à l'autre tout en conservant une fluidité cinématographique.
        *   **Épure Mobile Radicale** : Suppression de tous les boutons et overlays sur les cartes mobiles. L'image est reine, sans pollution visuelle, pour une navigation tactile fluide. PN : Le bouton "SÉLECTIONNER" a été retiré de la version PC pour simplifier l'interface.

---

## ⚡ 2b. Optimisations & Scalabilité (Janvier 2026)

### 📊 Admin Commandes (Scalabilité)
*   **Pagination Intelligente** : Pour éviter de charger des milliers de commandes et faire exploser la facture Firebase (Reads), l'Admin ne charge désormais que les **10 dernières commandes** par défaut (`limit(10)`).
*   **Load More** : Un bouton "Charger les commandes plus anciennes" en bas de liste permet de charger les 50 suivantes à la demande.
*   **Export Excel** : Ajout d'une fonctionnalité d'export complète (`xlsx` / SheetJS) générant un fichier `.xlsx` propre avec toutes les données clients et articles, formaté pour la comptabilité.

### 🖼️ UX Fiche Produit (Navigation)
*   **Navigation Tactile/Click** : L'image principale est désormais interactive (Clic Gauche/Droit pour naviguer).
*   **Indicateurs "Pills"** : Remplacement des miniatures par une barre de navigation moderne (traits arrondis) sous l'image pour alléger le design.
*   **Theming Dynamique** : Les blocs "Matières" et "Dimensions" utilisent désormais les tokens du thème.

### 🔎 Admin Listes & Recherche (Architecture Hybride)
*   **Composant Unifié** : Création de `AdminItemList.jsx` pour gérer uniformément les collections "Mobilier" et "Planches à Découper".
*   **Stratégie de Chargement Hybride** : Recherche Fuzzy client-side sur le catalogue complet, mais affichage paginé par défaut pour la performance.

---

## ⚙️ 3. Fonctionnalités Clés (Backend)

Le backend est géré par **Firebase Cloud Functions** (dans `/functions`).

*   `createOrder` : Crée une commande et initie le paiement Stripe.
*   `placeBid` : Gestion des enchères (vérifie le montant, met à jour Firestore).
*   `trackShare` / `onLikeCreated` : Compteurs sociaux (Likes, Partages).
*   `resetAllStats` : Fonction admin pour remettre à zéro les compteurs.
*   `checkStorageCount` : Vérification des stocks pour éviter les surventes.

---

## 🚀 4. Workflow de Déploiement

### 📸 Optimisation des Images (Nouveau - Janvier 2026)
Le système gère automatiquement deux versions des images lors de l'upload via l'Admin :
1.  **HD (High Definition)** : `_HD_` dans le nom. Utilisée pour la page détail produit (Zoom possible).
2.  **Thumbnail (Miniature)** : `_THUMB_` dans le nom (~500px). Utilisée pour les grilles (Galerie) afin d'économiser la bande passante et accélérer le chargement mobile.

L'optimisation WebP se fait côté client avant l'envoi.

Pour mettre le site en ligne sur **https://tatmadeinnormandie.web.app** :

1.  **Construction** (Optimisation du code) :
    ```bash
    npm run build
    ```
    *Ceci génère le dossier `dist/` propre.*

2.  **Déploiement** (Envoi chez Google) :
    ```bash
    firebase deploy
    ```
    *Envoie le `dist/` (Hosting), les `functions/`, et les règles de sécurité (`firestore.rules`).*

---

## ⚠️ 5. Règles d'Or (Sécurité & Maintenance)

1.  **SECRETS** : Les clés API privées (Stripe Secret Key, Firebase Service Account) vont dans `functions/.env`. **JAMAIS** dans le code `src/`.
2.  **ROBOTS** : Le fichier `public/robots.txt` gère l'indexation. Ne pas toucher à celui dans `dist/`.
3.  **ADMIN** : L'accès au dossier `features/admin` est protégé par Firebase Auth (email spécifique).
4.  **TOUCH NOT** : Ne jamais déplacer `firebase.json` ou `vite.config.js` de la racine.

---

## 🛠️ 6. Solutions Techniques & Troubleshooting (Important)

### 🚨 "Firestore Internal Assertion Failed: Unexpected state" (Ecran Blanc)
**Symptôme** : L'application plante aléatoirement en mode développement (`npm run dev`) avec un message d'erreur rouge concernant Firestore et un état inattendu.
**Cause** : Conflit entre `React.StrictMode` (qui double le montage des composants) et les listeners Temps Réel de Firestore. La connexion est établie/coupée trop vite, corrompant l'état interne du SDK. De plus, les listeners de données publiques étaient recréés à chaque changement d'état utilisateur.
**Solution Appliquée** :
1.  **Désactivation du Strict Mode** : Retrait de `<React.StrictMode>` dans `main.jsx`.
2.  **Split useEffect** : Séparation dans `App.jsx` des listeners de données publiques (dépendances vides `[]`) et de la logique utilisateur (dépendances `[user]`).
3.  **ErrorBoundary** : Ajout d'un composant global `ErrorBoundary.jsx` pour capturer ces plantages et afficher un bouton "Recharger" au lieu d'un écran blanc mortel.

### 📧 Problème : Emails non envoyés
**Solution** : Regénérer le "Mot de passe d'application" Google et mettre à jour `functions/.env`.

### 🖥️ Artefacts de rendu (Lignes clignotantes / Flickering)
**Solution** : Remplacer `border` par `ring` (box-shadow) et ajouter `will-change-transform` pour forcer l'accélération GPU lors des animations d'échelle.

### 🎰 Animation de Prix (Kerning & Jitter)
**Problème** : L'utilisation de `tabular-nums` pour stabiliser l'animation de compteur créait des espaces inesthétiques sur les polices Serif (ex: gros trou autour du "1").
**Solution** : Utilisation d'une interpolation numérique rapide (`gsap.to`) sur le texte pur, garantissant un rendu typographique parfait à l'arrêt, couplé à un léger flash de couleur pour le feedback. Pas de structure DOM complexe (type Odometer) car incompatible avec l'italique artistique de la marque.

---

*Dernière mise à jour par l'IA : Session du 06/02/2026 (16:45). Refonte Architectural (Layout Balance), AnimatedPrice (Micro-interactions GSAP), Museum Gallery Hook & Hover V2 (Snappy & Cinematic).*

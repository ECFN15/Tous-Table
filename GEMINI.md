---
project_name: "Tous à Table - Atelier Normand"
last_updated: "2026-01-27"
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

Le projet a été restructuré pour séparer clairement les responsabilités (Janvier 2026).

### 📂 Racine (`/`)
*   Contient les fichiers de configuration vitaux (`vite.config.js`, `firebase.json`, `package.json`). **NE PAS DÉPLACER.**
*   `functions/` : Le Backend (Node.js). C'est un sous-projet autonome déployé sur Google Cloud Functions.
*   `public/` : Fichiers statiques (Images racines, `robots.txt`, `sitemap.xml`).
*   `_ARCHIVE/` : Vieux fichiers, backups et logs. À ignorer.

### 📂 Source (`src/`)
*   **`pages/`** : Les Vues Principales (Routes).
    *   `HomeView.jsx` : Page d'accueil (Vitrine, Three.js, GSAP).
    *   `GalleryView.jsx` : La Marketplace (Catalogue).
    *   `ProductDetail.jsx` : Fiche produit détaillée (Enchères/Achat).
    *   `LoginView.jsx` : Connexion Admin.
    *   `CheckoutView.jsx` : Tunnel de paiement.
*   **`contexts/`** : Gestion des états globaux.
    *   `AuthContext.jsx` : Gestion centralisée de l'authentification.
*   **`Router.jsx`** : Gestion centralisée de la navigation et des transitions de pages.
*   **`features/admin/`** : Le Back-Office (Administration).
    *   `AdminDashboard.jsx` : Vue d'ensemble (Stats, Graphiques).
    *   `AdminForm.jsx` : Création/Édition de meubles.
    *   `AdminOrders.jsx` : Gestion des commandes.
    *   `AdminComments.jsx` : Modération des commentaires.
    *   `AdminHomepage.jsx` : Gestion des images de la page d'accueil.
    *   `components/` : Sous-composants admin (ex: `AdminImageCard.jsx` pour l'upload).
*   **`components/`** : Briques UI réutilisables (Boutons, Cards, Navbar, etc.).
*   **`hooks/`** : Logique métier partagée (ex: `useRealtimeUserLikes.js` pour les likes).
*   **`firebase/`** : Configuration (`config.js`) et initialisation.

---

## 🎨 2. Design System & UX

*   **Ambiance** : "Chocolat & Bois", Luxe, Artisanat, Terroir Normand, Minimalisme "Lumnos".
*   **Couleurs (Palette "Atelier")** :
    *   **Fond Principal** : Dégradé Teck/Noyer (`#e0d0c1` à `#8b5e3c`) en Light Mode. Noir Profond (`#1C1C1E`) en Dark Mode.
    *   **Cartes & Surfaces** : `#FAF9F6` (Blanc cassé / Coquille d'œuf) avec ombres portées noires (`shadow-black/10`) et bordure subtile (`border-white/60`).
    *   **Textes & Titres** : `#1a0f0a` (Chocolat Noir 95%) pour un contraste élégant sans la dureté du noir pur.
    *   **Accents** : Vert Émeraude (`#047857`) pour les validations, Ambre (`#f59e0b`) pour les actions.
*   **Typographie** : Polices avec empattement (Serif) pour les titres, Sans-Serif épuré pour le texte.
*   **Animations** :
    *   **GSAP** : Utilisé pour les transitions fluides (ScrollTrigger sur la Home).
    *   **Three.js** : Objet 3D (Nœud Torus) en fond sur la Home.
    *   **Lenis** : Smooth Scroll (défilement doux).

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

*Dernière mise à jour par l'IA : Session de restructuration du 27/01/2026. Tout est propre et fonctionnel.*

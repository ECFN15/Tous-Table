---
project_name: "Tous à Table - Atelier Normand"
last_updated: "2026-01-29"
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
    *   `AdminStudio.jsx` : Gestion des Thèmes et du Design System en direct.
    *   `components/` : Sous-composants admin (ex: `AdminImageCard.jsx` pour l'upload).
*   **`components/`** : Briques UI réutilisables (Boutons, Cards, Navbar, etc.).
*   **`hooks/`** : Logique métier partagée.
    *   `useLiveTheme.js` : Hook central pour la gestion des thèmes dynamiques (Firestore).
    *   `useRealtimeUserLikes.js` : Gestion temps réel des likes.
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
*   **Studio & Thèmes Dynamiques (Nouveau - Janvier 2026)** :
    *   Accessible via `AdminStudio`, permet de changer l'ambiance de la Marketplace sans coder.
    *   **Mode Standard** : Si activé, désactive tous les thèmes et utilise le design "original" (hardcoded).
    *   **Mode Forcé** : Pour chaque thème, l'admin peut forcer "Light", "Dark" ou "Auto". Si forcé, le toggle Dark Mode du header disparait pour les utilisateurs afin de garantir la cohérence artistique choisie.

*   **Animations** :
    *   **GSAP** : Utilisé pour les transitions fluides (ScrollTrigger sur la Home).
    *   **Three.js** : Objet 3D (Nœud Torus) en fond sur la Home.
    *   **Lenis** : Smooth Scroll (défilement doux).
*   **UX Mobile & Badges (Mise à jour Janvier 2026)** :
    *   **Grille Mobile (2 colonnes)** : Optimisation de l'espace avec des badges réduits (Police 9px, Padding fin) pour ne pas obstruer les photos.
    *   **Logique de Statut** :
        *   **Enchère** : Badge Vert à impulsion avec Timer.
        *   **Vendu** : Badge Rouge "VENDU" (Aussi marqué "RUPTURE" en rouge au niveau du stock).
        *   **Disponible** : PAS de badge (implicite) pour épurer l'interface, sauf mention "STOCK X" en vert discret en bas de carte.
        *   **Alignement** : Prix et Stock rigoureusement alignés à droite (`text-right` + `tabular-nums`) pour une symétrie parfaite sur tous les écrans.

---

## ⚡ 2b. Optimisations & Scalabilité (Janvier 2026)

### 📊 Admin Commandes (Scalabilité)
*   **Pagination Intelligente** : Pour éviter de charger des milliers de commandes et faire exploser la facture Firebase (Reads), l'Admin ne charge désormais que les **50 dernières commandes** par défaut (`limit(50)`).
*   **Load More** : Un bouton "Charger les commandes plus anciennes" en bas de liste permet de charger les 50 suivantes à la demande.
*   **Export Excel** : Ajout d'une fonctionnalité d'export complète (`xlsx` / SheetJS) générant un fichier `.xlsx` propre avec toutes les données clients et articles, formaté pour la comptabilité.

### 🖼️ UX Fiche Produit (Navigation)
*   **Navigation Tactile/Click** : L'image principale est désormais interactive.
    *   Clic **Gauche** (ou < 50% largeur) : Image précédente.
    *   Clic **Droit** (ou > 50% largeur) : Image suivante.
*   **Indicateurs "Pills"** : Remplacement des miniatures par une barre de navigation moderne (traits arrondis) sous l'image pour alléger le design tout en gardant le contexte (Position X/Y).
*   **Theming Dynamique** : Les blocs "Matières" et "Dimensions" utilisent désormais les tokens du thème (`palette.cardBg`, `palette.switcherBorder`) pour une cohérence parfaite avec le Studio.

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

### 📧 Problème : Emails non envoyés (Confirmation commande / Admin)
**Symptôme** : Les commandes passent mais aucun mail n'est reçu (ni client, ni admin). L'outil "Diagnostics Système" du Dashboard Admin affiche une erreur `535 5.7.8 Username and Password not accepted`.
**Cause** : Le "Mot de passe d'application" Google du compte émetteur (`functions/.env`) a expiré ou a été révoqué par sécurité.
**Solution** :
1.  Aller sur [Google App Passwords](https://myaccount.google.com/apppasswords) avec le compte `matthis.fradin2@gmail.com`.
2.  Supprimer l'ancien mot de passe et en générer un nouveau (Nom: "Firebase").
3.  Mettre à jour `functions/.env` : `GMAIL_PASSWORD="votre-nouveau-code-16-caracteres"`.
4.  Redéployer : `firebase deploy --only functions`.
5.  Valider via le bouton "Diagnostics" du Dashboard Admin.

### 🖥️ Artefacts de rendu (Lignes clignotantes / Flickering)
**Problème rencontré** : Sur le Dashboard et le Studio, des lignes blanches fines ou des scintillements apparaissaient lors du survol des cartes en Dark Mode.
**Cause** : Conflit de rendu "Sub-pixel" entre les bordures classiques (`border`) et les translations CSS (`translate-y`) sur des éléments non accélérés par le GPU.
**Solution Appliquée** :
1.  **Remplacer `border` par `ring`** : Utiliser `ring-1 ring-inset` (box-shadow) au lieu de `border` pour éviter les recalculs de géométrie.
2.  **Hardware Acceleration** : Ajouter les classes `transform-gpu backface-hidden will-change-transform` sur les conteneurs animés.
3.  **Éviter `translate`** : Préférer `hover:scale` (zoom) à `hover:translate` (déplacement) pour les interactions, car le scaling est mieux géré par le compositeur GPU.
4.  **Overflow** : Ajouter `overflow-hidden` sur les cartes arrondies pour "clipper" les artefacts de bordure.

---

*Dernière mise à jour par l'IA : Session du 29/01/2026. Ajout Pagination Admin, Export Excel et UX Produit.*

---
project_name: "Tous à Table - Atelier Normand"
last_updated: "2026-02-09 (Sécurisation Enchères & UX Mobile)"
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

    *   **Update Février 2026 (Mobile Performance Audit - Homepage)** :
        *   **Hero Stability (100svh)** : Remplacement de `100dvh` (Dynamic) par `100svh` (Small Viewport Height) pour la section Hero. Empêche le "saut de marche" (layout shift) causé par le retrait de la barre d'adresse mobile lors du scroll.
        *   **Manifesto Intelligent (Parallax)** : Intégration d'un effet de fenêtre (window parallax) sur les images (`scale: 1.25` + `scrub`) pour une profondeur vivante. Décomposition de l'apparition (Image puis Texte) pour une narration fluide sur Mobile & Desktop.
        *   **Manifesto Anti-Jitter** : Désactivation des transforms complexes (`scale`, `parallax`) sur mobile (<1024px). Remplacement par un simple `fade-in` (`opacity`) déclenché une seule fois (`once: true`) pour une fluidité native sans tremblements.
        *   **Background 3D Fix** : Suppression de la remontée verticale (`y: -150`) lors de la sortie du Hero pour éviter les trous blancs sur mobile. Le fond disparaît désormais uniquement par transparence (`opacity: 0`).
        *   **Transition Couleur Stable** : Décalage du trigger de changement de fond (Noir -> Beige) à `top 60%` (au lieu de 80%) avec `preventOverlaps: true` pour éviter le clignotement lors des rebonds de scroll (rubber-banding).
        *   **Process Section Premium** : Abandon du "Simple Reveal" au profit du système **Intelligent Parallax** (`scrub: 1`) et d'une séquence d'apparition plus nerveuse (Trigger `top 85%`, Durations réduites) pour éliminer toute sensation de lenteur sur mobile.

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

*   **Update Février 2026 (Header & Layout Marketplace)** :
        *   **TextType Animation** : Intégration du composant typewriter (`TextType.jsx`) pour le titre Héro de la Marketplace. Séquence : "Tous à Table" -> "Savoir-Faire" -> "Made in Normandie" -> "L'Élégance du Temps." -> "Votre Intérieur Sublimé.". Vitesse : 150ms (Premium Slow). Layout stabilisé (`min-h-[1.8em]`) pour zéro shift.
        *   **"The Sweet Spot" Layout (Desktop)** : Optimisation chirurgicale de l'espacement vertical (`md:pt-8`, `md:mb-8`) pour afficher les infos produits (Prix/Status) "au-dessus de la ligne de flottaison" sur grand écran, tout en gardant une esthétique aérée.
        *   **Mobile Typography** : Réduction de la taille de police (`text-4xl`) sur mobile pour le titre Héro. Empêche le retour à la ligne des phrases longues ("Made in Normandie"), garantissant une harmonie parfaite.
        *   **Smart Scroll Header** : Header intelligent qui se cache au scroll bas (>100px) et réapparaît au scroll haut. Libère de l'espace écran pour le contenu.

---

## ⚙️ 3. Fonctionnalités Clés (Backend)

Le backend est géré par **Firebase Cloud Functions** (dans `/functions`).

*   `createOrder` : Crée une commande et initie le paiement Stripe.
*   `placeBid` : Gestion des enchères (vérifie le montant, met à jour Firestore).
*   `trackShare` / `onLikeCreated` : Compteurs sociaux (Likes, Partages).
*   `resetAllStats` : Fonction admin pour remettre à zéro les compteurs.
*   `checkStorageCount` : Vérification des stocks pour éviter les surventes.

### 🧹 Nettoyage & Maintenance (Février 2026)
*   **Nettoyage Automatique (Temps Réel)** : Trigger `onArtifactDeleted`. Supprime instantanément les images Storage (via URL) et nettoie récursivement les sous-collections (`comments`, `likes`, `bids`) dès qu'un produit est effacé de Firestore. C'est la garantie "Zéro Déchet".
*   **Garbage Collector (Manuel)** : La fonction `runGarbageCollector` est conservée comme outil de diagnostic/backup pour scanner l'intégralité du Storage en cas d'anomalie.

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

### 🛡️ Traçabilité & Sécurité (Février 2026)
*   **Capture d'IP & Device** : Mise en place de `logUserConnection` pour enregistrer l'adresse IP (IPv6/IPv4) et le User-Agent (appareil) de chaque utilisateur à la connexion.
*   **Logique de Purge Utilisateurs** : Unification du bouton "Purge Utilisateurs" dans la Zone de Danger pour réinitialiser Firebase Auth tout en protégeant uniquement le Super Admin (`matthis.fradin2@gmail.com`).
*   **Module "Clients Inscrits"** : Ajout d'un KPI dynamique affichant le nombre de comptes réels (email-verified, non-anonymes) avec un export Excel complet incluant les métadonnées de sécurité (IP, Device).
*   **Validation Stripe Webhook** : Implémentation de la vérification cryptographique des signatures (`STRIPE_WH_SECRET`) pour sécuriser les transactions contre les faux événements de paiement.
*   **Sécurisation Multi-Admins** : Verrouillage strict de la révocation du compte Super-Admin (`matthis.fradin2@gmail.com`) pour éviter tout auto-blocage ou sabotage.

### 🔨 Optimisation Enchères & Storage (Février 2026)
*   **Idempotency Protocol** : Utilisation d'une clé d'idempotence unique par clic (`sys_idempotency`) dans la fonction `placeBid`. Empêche techniquement tout doublon d'enchère en cas de clics frénétiques ou de lag réseau.
*   **Système de "Réveil" (Warm-up)** : Déclenchement silencieux de la fonction `wakeUp` dès l'ouverture d'une fiche produit. Réduit le délai de "Cold Start" de Google Cloud, rendant la première enchère instantanée pour l'utilisateur.
*   **Blindage Storage** : Verrouillage des `storage.rules` (Admins uniquement, max 10Mo, images uniquement). Prévention du vandalisme par saturation de stockage.
*   **UX "Fake Progress"** : Synchronisation chirurgicale entre le front et le back. Le bouton d'enchère simule une progression ultra-fluide (0-90%) et saute à 100% au signal exact du serveur. Effet de réactivité premium garanti.
*   **Force Login Guard** : Redirection automatique vers le modal de connexion si un visiteur tente d'enchérir sans être identifié.

### 🔒 Audit de Sécurité Complet (Février 2026 - Session 13:57)
Suite à un audit de sécurité exhaustif (score initial 7.8/10), les mesures suivantes ont été implémentées :

*   **Rate Limiting Enchères** : Protection anti-spam avec limite de 5 enchères par minute par utilisateur. Collection dédiée `sys_ratelimit` gérée exclusivement par le backend (Admin SDK). Empêche les attaques DoS économiques sur Firestore.
*   **Blocage Webhook Stripe Non-Sécurisé** : Suppression du mode "fallback" qui acceptait les webhooks non signés. Si `STRIPE_WH_SECRET` n'est pas configuré, le webhook renvoie une erreur 500 au lieu d'accepter des requêtes potentiellement forgées.
*   **Email Vérifié Obligatoire** : La fonction `createOrder` exige désormais `email_verified = true` sur le token utilisateur. Empêche les commandes fantômes avec des emails non vérifiables.
*   **Headers de Sécurité CSP** : Ajout dans `firebase.json` des headers modernes :
    *   `Content-Security-Policy` : Blocage des scripts/styles/images non autorisés
    *   `X-Frame-Options: DENY` : Protection anti-clickjacking
    *   `X-Content-Type-Options: nosniff` : Protection MIME sniffing
    *   `Referrer-Policy: strict-origin-when-cross-origin` : Contrôle du Referer
*   **Règles Firestore sys_* sécurisées** : Les collections `sys_ratelimit` et `sys_idempotency` sont verrouillées côté client (`allow: if false`).

### 🐛 Debugging & Fixes (Session du 09/02/2026 - 15:00)

*   **GSAP "Safety Refresh" (Stacked Cards)** : Correction du bug d'affichage (flou/petit) au premier chargement Desktop. 
    *   **Cause** : Le layout Shift (chargement images/fontes) désynchronisait ScrollTrigger.
    *   **Solution** : Implémentation d'un **Refresh Polling** (recalcul à 100ms, 500ms, 1s, 2s) et d'un **ResizeObserver** sur le conteneur. Dès que la taille change, l'animation se recalibre.
*   **Images Homepage (Règles Sécurité)** : Correction des règles Firestore qui bloquaient l'affichage des images pour les visiteurs non-connectés.
    *   **Fix** : Autorisation publique (`allow read`) spécifique pour le document `sys_metadata/homepage_images`.
*   **Hauteur Cartes Unifiée** : Standardisation de la hauteur des cartes "Stacked" à `88vh` sur tous les devices (Mobile & Desktop) pour garantir la cohérence des triggers.

### 🌍 8. Mise en Production & Domaine (10 Février 2026)

Le site est officiellement déployé en Production avec une séparation stricte des environnements.

*   **Identité PROD** :
    *   **Projet Firebase** : `tousatable-client`
    *   **Domaine Principal** : [tousatable-madeinnormandie.fr](https://tousatable-madeinnormandie.fr) (Configuré via OVH)
    *   **Domaine Technique** : `tousatable-client.web.app` (Toujours accessible, idéal pour tester si le domaine principal propage)
    *   **Commande** : `firebase use prod`

*   **Configuration DNS (OVH)** :
    *   **A Record** : `199.36.158.100` (Pointe vers l'IP de Firebase Hosting)
    *   **TXT Record** : `hosting-site=tousatable-client` (Validation de propriété Google)
    *   *Note : Les anciennes entrées (213.186.33.5) ont été supprimées pour éviter les conflits.*

*   **Correctifs Critiques de Déploiement** :
    *   **White Screen of Death (MIME Type Error)** : Correction de `firebase.json`. La règle de réécriture (`rewrites`) pointait tout (`**`) vers une fonction `shareMeta`, ce qui interceptait les fichiers JS/CSS et causait un crash.
        *   *Fix* : `source: "**", destination: "/index.html"` (Standard SPA fallback).
    *   **Admin Label Fantôme** : Correction de `AuthContext.jsx`. L'ancienne méthode lisait `sys_metadata/admin_users` (interdit en lecture publique), ce qui cachait le statut réel.
        *   *Fix* : Le Frontend lit désormais le document `users/{uid}` de l'utilisateur connecté pour vérifier `role: "admin"`. Plus robuste et sécurisé.
    *   **Anonymous Users** : Explication de la présence de comptes sans email dans Firestore (`users/{uid}`). Ce sont des visiteurs temporaires (paniers/sécurité). Ils sont nettoyés automatiquement par le Garbage Collector après 30 jours.

---

*Dernière mise à jour par l'IA : Session du 2026-02-10. Déploiement Production, Configuration Domaine OVH & Fix Auth Admin.*

---
project_name: "Tous à Table - Atelier Normand"
last_updated: "2026-02-18 (App Check & Security Hardening)"
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
*   **`REGLES_ENV.md`** : Guide complet pour la gestion des environnements (Sandbox vs Production). À consulter avant tout déploiement.

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

## 🚀 9. Optimisation Performance & Architecture (11 Février 2026)

**Transition Majeure : "No-CDN / Native v4"**

Le projet a effectué une transition technique critique pour passer d'un mode "Prototypage Rapide" (via CDN) à une architecture "Production Grade" (Compilée).

### ✂️ Suppression du CDN Tailwind (Le "Grand Nettoyage")
*   **Avant** : Le site chargeait `cdn.tailwindcss.com` (120KB+ de JS bloquant) au démarrage pour calculer le CSS en temps réel dans le navigateur du client.
    *   *Symptômes* : Démarrage lent, flash de contenu non stylisé (FOUC), surchauffe mobile, dépendance externe risquée.
*   **Après** : Le CSS est entièrement généré à la construction (`npm run build`) par **Tailwind v4 + Vite**.
    *   *Gain* : **+30 points** sur PageSpeed Desktop (Score ~85/100). Démarrage instantané. Zéro Javascript bloquant pour le style.

### 📐 Standardisation des Breakpoints (Layout "Rituel")
Pour supprimer le CDN, il a fallu convertir toutes les règles CSS "exotiques" (arbitrary values) qui n'étaient pas comprises par le compilateur v4 natif.
*   **Problème** : Le layout horizontal de la section "Process" utilisait `min-[1920px]` qui entrait en conflit avec les règles Tablette (`md:`).
*   **Solution** : Remplacement systématique par le standard Tailwind **`2xl`** (1536px+) et utilisation de **`max-2xl`** pour cloisonner les styles Tablette.
    *   *Code* : `md:max-2xl:flex-row` (Tablette uniquement) vs `2xl:flex-col` (Desktop Géant uniquement).
    *   *Résultat* : Un code robuste, standard, et maintenable qui ne dépend plus de "hacks" CSS.

### 📦 Code Splitting (Optimisation Chargement)
*   **Lazy Loading** : Les routeurs (`Router.jsx`) n'importent plus toutes les pages d'un coup. `GalleryView`, `ProductDetail`, et `Checkout` sont chargés à la demande (`React.lazy`).
*   **Impact** : Le bundle initial (le "poids" de la page d'accueil) a été drastiquement réduit, accélérant le **First Contentful Paint (FCP)**.

---

---

## 📈 11. Audit & Optimisation SEO / Branding (16 Février 2026)

**Objectif : Harmonisation de l'image de marque et visibilité Google.**

Suite à l'analyse des résultats de recherche Google, une refonte complète des métadonnées a été effectuée pour mieux refléter l'activité réelle de l'atelier et améliorer le taux de clic.

### 🏷️ Nouvelle Stratégie de Positionnement
*   **Identité de Marque** : Passage de "Tous à Table - Made in Normandie" à **"Atelier Normand — Tous à Table"**.
*   **Slogan SEO** : `Restauration de Mobilier & Meubles Anciens`.
*   **Mots-clés Prioritaires** : Chêne, Table de ferme, Armoire parisienne, Buffet, Restauration de meubles.
*   **Focus Géographique** : Ifs (14123), Caen, Calvados, Normandie.
*   **Focus Logistique** : Suppression du terme "Intervention" (car l'atelier ne se déplace pas pour les travaux) au profit d'un message fort sur la **Livraison France & Europe**.

### 🛠️ Modifications Techniques de Structure
*   **Index.html (Statique)** : 
    *   Mise à jour du titre et de la description `meta`.
    *   Configuration forcée du **favicon marteau** en `apple-touch-icon` pour faciliter l'affichage du logo dans les résultats Google.
    *   Correction de l'adresse dans le Schema.org (JSON-LD) : `346 Chemin de Fleury, 14123 Ifs`.
*   **Google Search Console (GSC)** : Validation de la propriété via fichier HTML (`google72f08140b6217ed3.html`) et lancement d'une **demande d'indexation prioritaire** pour accélérer la prise en compte des changements par Google.
*   **SEO.jsx (Composant)** : Harmonisation des valeurs par défaut pour tout le site.
*   **Footer.jsx** : Enrichissement du "Legacy Text" (Bas de page) pour inclure les villes de Normandie et la mention de livraison internationale.
*   **HomeView.jsx** : Ajout d'une balise `h1` descriptive masquée (`sr-only`) : *"Restauration de mobilier normand et meubles anciens à Caen"*.

---

## 🧪 12. Stabilisation "Process Section" (16 Février 2026 - Session 05:20)

**Objectif : Éliminer les sursauts visuels (rollbacks) lors de la transition horizontale vers verticale.**

### 🔍 Problème Identifié
Le paramètre `scrub: 1` de GSAP créait un délai de fluidité. Lors d'un scroll rapide, la section se "dépinglait" avant que l'animation n'ait fini de rattraper son retard, causant un décalage brutal sur l'image V.

### 🛠️ Solution : "Zone de Stabilisation" (End Buffer)
*   **Séparation des Triggers** : Le "Pinning" (blocage de la page) est désormais géré par un trigger indépendant de l'animation de translation (`x`).
*   **Buffer de Sécurité** : Ajout d'une zone morte de **400px** à la fin du scroll. La section reste bloquée après que l'image V a atteint sa position finale, laissant le temps au "scrub" de s'immobiliser totalement.
*   **Hard-Fix (`onLeave`)** : Utilisation d'un callback forçant la position `x` finale exacte à la sortie de la zone, garantissant zéro pixel de décalage peu importe la vitesse du scroll.
*   **Padding Desktop** : Ajustement chirurgical à **18vw** pour un équilibre visuel parfait.

---

*Dernière mise à jour par l'IA : Session du 2026-02-16. Optimisation SEO, GSC Validation, Correction Adresse Ifs, Stabilisation Transition Process.*

---

## 🌀 10. Stacked Cards & iOS Optimization (Upgrade Février 2026)

**Transition Stratégique : GSAP → Framer Motion**

Pour résoudre définitivement le problème de "Jitter" (tremblement) des cartes empilées sur iOS, le composant `StackedCards.jsx` a été entièrement réécrit en utilisant **Framer Motion**.

### 📱 Pourquoi Framer Motion ?
*   **Conflit GSAP/iOS** : GSAP modifiait le DOM impérativement (`style="..."`) à chaque frame de scroll. Sur iOS, cela entrait en conflit avec le thread de scroll natif ultra-prioritaire, créant des micro-décalages visuels.
*   **Approche Motion** : Framer Motion utilise des `MotionValues` qui se synchronisent directement avec le cycle de rendu React et l'accélération matérielle, contournant le bottleneck du "Main Thread" JS.

### 🏗️ Nouvelle Architecture "Parallax Flow"
L'ancien système "Sticky Stack" (où les cartes restaient physiquement collées en haut) a été abandonné au profit d'un **Flux Naturel**.
1.  **Scroll Standard** : Les cartes défilent normalement (pas de `position: sticky`).
2.  **Illusion de Profondeur** : L'effet d'empilement est simulé par une animation de **Sortie** (`Exit Animation`).
    *   Quand une carte monte, elle rétrécit (`scale`) et s'assombrit (`opacity`) juste avant de sortir de l'écran.
    *   Le cerveau interprète cela comme un empilement 3D, alors que c'est un simple scroll 2D. C'est le secret de la fluidité à 60fps sur mobile.

### 🌓 Logique Hybride (Responsive UX)
Une logique différenciée a été codée pour offrir la meilleure expérience selon le device :

*   **📱 Mobile (Alive & Flow)** :
    *   **Scale** : `[0.25 -> 1]`. L'animation commence **très tôt** (dès le bas de l'écran). La carte est en transformation perpétuelle pour accompagner le mouvement du pouce. C'est organique et vivant.
    *   **Opacité** : `[0.85 -> 1]`. Fade-out progressif pour une transition douce.

*   **💻 Desktop (Stable & Premium)** :
    *   **Scale** : `[0.75 -> 1]`. La carte reste **immobile** et large pendant 75% du trajet. Elle ne bouge qu'au tout dernier moment. Cela évite l'effet "flottant" sur grand écran et renforce le côté "Galerie d'Art".
    *   **Opacité** : `[0.95 -> 1]`. Retardée au maximum pour éviter que les couleurs ne ternissent (grisaillement) sur les grands écrans lumineux.

*Note : L'effet Parallax interne (image bougeant dans son cadre) a été retiré pour garantir une netteté absolue et éviter les bandes grises indésirables.*

---

*Dernière mise à jour par l'IA : Session du 2026-02-16. Intégration Framer Motion, Stabilisation iOS, Responsive UX Logic.*

---

## 🔒 16. Blindage Sécuritaire & App Check (18 Février 2026)

**Focus : Protection Anti-Bot, Anti-XSS et Suppression de Faille Critique.**

Une refonte majeure de la sécurité a été opérée pour passer d'un site "public" à une véritable forteresse numérique, protégeant l'intégrité des données et du serveur.

### 🔴 Suppression Définitive de la Backdoor
*   **Action** : Suppression irréversible de la fonction Cloud `initSuperAdmin`.
*   **Raison** : Cette fonction permettait de promouvoir n'importe quel compte au rang d'admin via un secret textuel, constituant une faille critique de niveau 10/10.
*   **Alternative** : La gestion des administrateurs se fait désormais exclusivement via la console Firebase (ajout manuel de `role: "admin"` dans le document `users/{uid}`).

### 👻 Firebase App Check (reCAPTCHA v3)
Mise en place d'un système de vérification silencieuse pour garantir que seules les requêtes venant du **vrai site** (Sandbox ou Prod) sont acceptées par Google.
*   **Provider** : reCAPTCHA v3 Invisible (pas de puzzles à résoudre pour l'utilisateur).
*   **Status** : **Mode Observation** actif sur Prod. Permet de monitorer le trafic avant de passer au blocage physique (Enforcement).
*   **Infrastructure** :
    *   **Prod** : `tousatable-madeinnormandie.fr` autorisé.
    *   **Sandbox** : `tatmadeinnormandie.web.app` autorisé.
    *   **Local** : Token de débogage activé pour le développement sans blocage.
*   **Auth Anonyme** : Activation obligatoire dans la console Firebase pour permettre l'initialisation du service sans friction.

### 🛡️ Content Security Policy (CSP) "Luxe & Sécurisé"
Mise en place d'un header `Content-Security-Policy` complet dans `firebase.json` pour prévenir les attaques XSS.
*   **Stratégie** : `default-src 'self'`. Tout ce qui n'est pas explicitement invité est bloqué.
*   **Liste Blanche (Whitelist)** :
    *   **Design** : `fonts.googleapis.com`, `fonts.gstatic.com`, `transparenttextures.com`, `images.unsplash.com`.
    *   **Infra** : `firebaseio.com`, `googleapis.com`, `cloudfunctions.net`.
    *   **Paiement** : `js.stripe.com`, `api.stripe.com`, `checkout.stripe.com`.
    *   **Sécurité** : `www.google.com/recaptcha`, `www.gstatic.com`.
*   **Résultat** : Un pirate ne peut plus charger de script extérieur malveillant, même s'il trouve une faille d'injection.

### 🩹 Patchs Anti-XSS & Sanitization
*   **Backend (`functions/index.js`)** :
    *   **`shareMeta`** : Sanitization stricte du `productId` via Regex (Alphanumérique + Underscore uniquement) avant injection dans le HTML du bot Facebook/Twitter.
    *   **`sendTestEmail`** : Nettoyage des données de debug pour ne plus fuiter le `cwd` (chemin serveur).
*   **Frontend (`HomeView.jsx`, `Footer.jsx`)** :
    *   **`sanitizeHtml` helper** : Création d'un utilitaire filtrant les balises HTML. Autorise uniquement le `<br />` pour la mise en forme.
    *   **`dangerouslySetInnerHTML`** : Toutes les utilisations de cette fonction React sont désormais "enveloppées" par le sanitizer pour bloquer l'exécution de scripts cachés dans Firestore.

### 📊 Optimisation Firestore (Console Debugging)
*   **Règles `sys_metadata`** : Passage de la lecture `sys_metadata` en accès public (`allow read: if true`).
*   **Raison** : Le thème et les images de marque étant essentiels au rendu visuel dès la première seconde, cela élimine les erreurs `Missing or insufficient permissions` dans la console et fluidifie le chargement pour les visiteurs anonymes.

---

*Dernière mise à jour par l'IA : Session du 2026-02-18 (23:10). App Check v3, CSP Hardening, XSS Sanitization & Backdoor Removal.*

---


## 🎨 11. Restauration Expérience Historique & Polish Tactile (16 Février 2026)

**Focus : Authenticité v26.9 & Support Ultra-Tablettes**

### 🥚 Easter Egg "Rotating Symbol" (Restauré)
*   **Retour aux Sources** : Réimplémentation complète du composant `RotatingSymbol` tel qu'il existait au commit 26.9.
*   **Design** : Texte circulaire répété ("TOUS À TABLE • 2026 •"), couleur Or Atelier (`#9C8268`), mix-blend `screen` et icône `Star` (Lucide) en contour fin uniquement.
*   **Positionnement** : Stabilisé pour les versions Desktop (fixe à droite) et Mobile (centré au-dessus du titre).

### 🔢 Chiffres Romains & Process Section
*   **Esthétique Musée** : Restauration du style original des chiffres (`I`, `II`, `III`) :
    *   **Italique** & **Text-Stroke** : Pour un tracé fin et élégant.
    *   **Overlay Z-Index** : Les chiffres passent désormais visuellement *par-dessus* l'image avec une opacité maîtrisée.
    *   **Pointer Events** : Désactivation des événements de clic sur les chiffres pour permettre l'interaction directe avec l'image sous-jacente.
*   **Scroll Tightening** : Suppression des espaces vides (spacers) en fin de scroll horizontal pour un arrêt net et professionnel sur Desktop.

### 📱 Optimisation Tactile "Force Color" (2000px)
*   **Problème** : Les tablettes haute résolution (iPad Pro, Samsung Tab S10 Ultra) étaient détectées comme des PC, bloquant les images en Noir & Blanc (effet hover impossible à déclencher au doigt).
*   **Solution "Force-Color"** :
    *   Création d'une utilité CSS `.force-color-tablet` forçant `grayscale(0)`.
    *   **Seuil critique élevé à 2000px** dans `index.css`. Cette valeur garantit que même les tablettes géantes en mode paysage restent en couleur.
    *   L'effet Noir & Blanc (Hover) est désormais strictement réservé aux moniteurs Desktop de grande taille (> 2000px).
*   **Stabilité Mobile** : Suppression systématique des effets `scale-105` (zoom) sur mobile pour éviter les tremblements (jitter) lors du défilement tactile.

---

---

*Dernière mise à jour par l'IA : Session du 2026-02-16 (02:45). Restauration Easter Egg, Polish Chiffres Romains et Blindage Tactile 2000px.*

---

## 🏛️ 12. Global Footer & Secured Prod Workflow (16 Février 2026 - 04:00)

**Focus : Architecture Globale, Accessibilité Publique & Blindage Environnemental**

### 🌐 Footer Global (Composant Réutilisable)
*   **Centralisation** : Le pied de page n'est plus un bloc interne à `HomeView`. Il a été extrait dans `src/components/Footer.jsx` et intégré directement dans `app.jsx`.
*   **Visibilité Intelligente** : S'affiche sur toutes les pages publiques (`home`, `gallery`, `detail`, etc.) mais reste invisible dans le back-office Admin pour un espace de travail pur.
*   **Performance Firestore** : Intègre son propre `onSnapshot` sur `sys_metadata/contact_info` pour une mise à jour en temps réel des coordonnées sans alourdir le state global de l'application.

### 📱 Responsiveness "Luxe & Longueur"
*   **Fix Dead-Zone (1024px - 1280px)** : Le passage en mode horizontal (côte-à-côté) a été décalé à **1280px (`xl`)**. Les laptops de 13 pouces conservent ainsi une disposition verticale aérée, évitant que l'adresse email ne soit écrasée par le titre. 
*   **Email "Anti-Break"** : Implémentation du `break-all` sur mobile pour forcer le retour à la ligne des adresses emails très longues (ex: `tousatablemadeinnormandie@gmail.com`). Réduction de la taille de police (`text-3xl` max sur Desktop) pour un rendu minimaliste.
*   **Social Hub Animations** : 
    *   **Couleurs de Marque** : Hover spécifique Instagram (`#E1306C`) et Facebook (`#1877F2`).
    *   **Layout** : Vertical sur mobile pour le confort du pouce, horizontal sur Desktop pour l'équilibre visuel.

### 🛡️ Blindage du Déploiement (Workflow PROD)
*   **Audit Obligatoire** : Création d'une règle d'or interdisant le déploiement sur la production sans l'exécution préalable de `.agent/skills/production/scripts/verify_prod.ps1`.
*   **Isolation des Clés** : Utilisation impérative de `npm run build:prod`. L'usage d'un build standard (`npm run build`) sur le projet client est désormais classé comme une erreur critique (risque de contamination des données Sandbox).

### 🔒 Sécurité Firestore
*   **Accessibilité Publique** : Ouverture contrôlée de la règle `read` sur le document `sys_metadata/contact_info`. Permet d'afficher instantanément les coordonnées et les textes de marque aux visiteurs non-identifiés sans compromettre le reste des métadonnées système.

---

*Dernière mise à jour par l'IA : Session du 2026-02-16 (04:15). Global Footer, Dead-Zone Responsiveness Fix & Audit de Sécurité PROD.*

---

## 🔧 13. Hotfix Admin & Homepage (16 Février 2026 - Session 06:25)

**Objectif : Raccorder le contenu dynamique (Admin) au Frontend et corriger les bugs de données.**

Suite au déploiement des fonctionnalités "Admin Homepage", plusieurs incohérences critiques ont été identifiées et corrigées en urgence sur l'environnement de Production.

### 🔗 Connexion Dynamique (Frontend)
*   **Problème** : Les sections "Textes & Chiffres Clés" (Section 12) affichaient des valeurs codées en dur ("25 Ans", "400h") au lieu des données de Firestore.
*   **Correction** : Remplacement systématique par les variables `homepageImages['stat_X_text']`.
*   **Sécurité** : Ajout de **Fail-Safes** (`||`) pour gérer les champs manquants (ex: si le suffixe est vide en base, afficher "").

### 💾 Bug Critique : "Champs Orphelins" (Admin)
*   **Diagnostic** : L'éditeur de texte (`TextEditorModal`) renvoyait un objet incomplet lors de la sauvegarde si certains champs n'étaient pas touchés (ex: sauvegarde de la `value` seule, écrasant `suffix` et `label` qui devenaient `undefined`).
*   **Fix** : Réécriture de l'initialisation du formulaire (`useEffect`) pour fusionner systématiquement les données existantes avec des valeurs par défaut (`''`) pour tous les champs du schéma, garantissant l'intégrité de l'objet envoyé à Firestore.

### 🎬 Bug Animation GSAP (Compteurs Bloqués)
*   **Symptôme** : Les chiffres restaient bloqués sur leur valeur initiale (ex: 25) même après la mise à jour des données (ex: 150).
*   **Cause** : L'animation GSAP (`innerText`) était initialisée une seule fois au montage du composant (`useLayoutEffect`), capturant la valeur par défaut avant l'arrivée des données Firebase.
*   **Solution** : Extraction de l'animation dans un `useEffect` dédié, dépendant de `homepageImages`. L'animation est désormais **Réactive** : elle se réinitialise et se rejoue automatiquement dès que les données changent.

### 🔍 Validation SEO
*   **Google Search Console** : Déploiement du fichier de vérification `google72f08140b6217ed3.html` à la racine pour valider la propriété du domaine.

---

*Dernière mise à jour par l'IA : Session du 2026-02-16 (06:25). Admin Hotfix, GSAP Reactivity, Data Integrity & GSC.*

---

## 🚀 14. Branding & SEO Finalization (17 Février 2026)

**Focus : Identité Visuelle, Visibilité Google & Sécurité du Déploiement**

Une étape majeure a été franchie pour professionnaliser l'image de marque et l'infrastructure SEO du projet.

### 🎨 Stratégie Favicon "Full-Bleed"
*   **Problème** : Les favicons ronds ou détourés (PNG transparents) apparaissaient souvent flous ou trop petits dans les onglets de navigateur (16px).
*   **Solution "Carré Universel"** : Adoption d'un favicon **Carré Plein** (`favV51.png` -> `favicon_final.png`).
    *   **Style** : Marteau Or sur Fond Noir Charbon. Contraste maximal pour une lisibilité parfaite.
    *   **Technique** : En fournissant un carré plein (Bleed), on laisse les plateformes gérer le découpage :
        *   **Navigateurs PC** : Affichent le carré propre (Standard Moderne).
        *   **Google Search / Mobile** : Arrondissent automatiquement les coins (Circle/Squircle) pour une intégration native.
    *   **Implémentation** : Mise à jour de `index.html` et `manifest.json` pour pointer harmonieusement vers cette ressource unique.

### 🗺️ SEO Technique & Sitemap Dynamique
*   **Sitemap Automatisé** : Création d'une Cloud Function `sitemap` générant le XML en temps réel.
    *   **Contenu** : Inclut dynamiquement toutes les routes statiques (`/`, `/gallery`) ET les produits actifs (`?product=ID`) depuis Firestore.
    *   **Routing** : Configuration de `firebase.json` (`rewrites`) pour servir cette fonction sur `/sitemap.xml`.
*   **Google Business Profile** : Création et validation de la fiche établissement "Atelier Normand — Tous à Table" (Ifs, 14123).
    *   **Catégorie** : Magasin de meubles / Atelier de restauration.
    *   **Impact** : Corrige l'affichage erroné (Traiteur) dans le Knowledge Graph de Google.

### 🛡️ Sécurité Déploiement PROD (Rappel Critique)
*   **Incident "Sandbox Data in Prod"** : Détection d'un risque majeur où un déploiement en production (`firebase use prod`) affichait les données de test.
*   **Cause** : L'utilisation de la commande standard `npm run build` charge par défaut le fichier `.env` (qui pointe vers la Sandbox), même si l'alias Firebase est sur Prod.
*   **Correctif** : L'environnement de PRODUCTION nécessite impérativement la commande :
    ```bash
    npm run build:prod
    ```
    Celle-ci charge `.env.prod` et connecte le Frontend à la base de données de production (`tousatable-client`).
*   **Workflow Forcé** : Utilisation obligatoire de la commande `/production_workflow` pour garantir l'exécution des scripts de vérification.

---

## 🌀 15. Refonte Marketplace Discovery ("Ondulation") (18 Février 2026 - 04:15)

**Objectif : Design Immersif & Transition Cinématographique**

Une refonte complète de la popup d'incitation à la Marketplace a été réalisée pour maximiser l'élégance et la fluidité de l'expérience utilisateur.

### 🎨 Design "Ondulation" (Héritage Magic UI)
*   **Identité Visuelle** : Adoption d'un style **Sombre & Profond** (Dark Mode Only).
*   **Fond Immersif** : Création d'un **Dégradé Radial** (`#2a2a2a` Centre -> `#000000` Bords) qui agit comme un projecteur mettant en lumière le titre.
*   **Animation Ripple** : Intégration d'un effet d'onde (cercles concentriques) avec un **Masque Dégradé** (`mask-image: linear-gradient`) pour que l'animation s'estompe élégamment vers le bas.
*   **Typographie** : "MARKETPLACE" en majuscules Serif, très espacé (`tracking-[0.2em]`), centré en majesté.

### 🧠 Logique de Déclenchement (Smart Trigger)
*   **Détection Scroll** : Abandon de l'`IntersectionObserver` (instable) au profit d'un écouteur de scroll simple vérifiant la proximité du bas de page (< 300px).
*   **Fréquence** : **Une seule fois par vie**. La popup s'affiche lors de la première visite, puis son état est enregistré définitivement dans le `localStorage`. Elle ne réapparaît plus jamais pour ne pas harceler l'habitué.
*   **Temporisation** : Délai de sécurité de 2 secondes au chargement pour éviter les déclenchements intempestifs lors de la restauration du scroll.

### 🎬 Transition Cinématographique (Lag-Free)
*   **Problème** : Le chargement standard de la page Marketplace (`href`) pouvait causer un "blanc" ou un lag visible.
*   **Solution "Le Rideau"** :
    1.  **Clic "Explorer"** : La popup joue son animation de fermeture.
    2.  **Fade to Black** : Le rideau de transition global (`startGalleryTransition`) fond au noir par-dessus l'interface.
    3.  **Switch Invisible** : Le changement de vue React (`setView('gallery')`) s'opère pendant que l'écran est noir.
    4.  **Révélation** : Le rideau se lève (`completeGalleryTransition`) sur la Galerie chargée et prête.
*   **Résultat** : Une navigation ressentie comme **instantanée et premium**.

### 📱 Responsive & Accessibilité
*   **Bouton "Explorer" Hybride** :
    *   **Desktop** : Apparaît uniquement au **Survol** (élégance minimaliste).
    *   **Mobile** : Reste **Toujours Visible** (accessibilité tactile immédiate sans clic préalable).

---

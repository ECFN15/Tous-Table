---
name: FirebaseKit Builder
description: Expert en construction du FirebaseKit — Kit modulaire pour déployer des sites e-commerce Firebase à la chaîne. Extraction du projet "Tous à Table" vers un template réutilisable.
---

# 🔥 FirebaseKit Builder — Skill Agent

> **Mission** : Transformer le projet "Tous à Table" (source) en un kit réutilisable `firebasekit/` sur le PC de l'utilisateur.
> **Destination** : `C:\Users\matth\firebasekit\`
> **Source** : `C:\Users\matth\Travail\Tous à Table\`

---

## 🚨 RÈGLES ABSOLUES (NON NÉGOCIABLES)

1. **NE JAMAIS modifier le projet source** (`Tous à Table/`). Tout travail se fait dans `C:\Users\matth\firebasekit\`.
2. **NE JAMAIS hardcoder** d'emails, d'URLs ou de noms de projet. Tout doit être paramétrable via `.env` ou `constants.js`.
3. **NE JAMAIS supprimer** de fonctionnalité existante. Le kit doit avoir 100% des features du projet source.
4. **Toujours vérifier** que les imports sont corrects après chaque copie/adaptation.
5. **Le dossier `vitrine/`** est le SEUL dossier que le client final personnalise. Tout le reste est standardisé.
6. **Le thème "architectural"** est le thème par défaut du marketplace. NE PAS créer de système multi-thème.

---

## 📐 Architecture Cible

### Séparation des Responsabilités

```
firebasekit/template/src/
│
├── kit/          ← 🔒 NE PAS TOUCHER (code standardisé)
│   ├── config/   ← Firebase init, constantes, thème
│   ├── contexts/ ← AuthContext, CartContext, ThemeContext  
│   ├── hooks/    ← useAuth, useCart, useLiveTheme, useProducts, useNavigation
│   ├── marketplace/  ← GalleryView + ProductDetail + ProductCard + Header
│   ├── commerce/     ← Checkout + Cart + MyOrders + OrderSuccess
│   ├── admin/        ← Backoffice complet (14 modules)
│   ├── layout/       ← Footer + GlobalMenu + NewsletterModal
│   ├── shared/       ← SEO + Analytics + ErrorBoundary + LoginModal
│   └── ui/           ← Toast + AnimatedPrice + AuctionTimer + ...
│
├── vitrine/      ← 🎨 PERSONNALISABLE (design unique par client)
│   ├── HomeView.jsx
│   └── components/
│
└── utils/        ← Utilitaires
```

---

## 📝 ÉTAPES D'EXÉCUTION (Ordre strict)

### PHASE 0 — Créer la Structure

```
Créer les dossiers suivants dans C:\Users\matth\firebasekit\ :

firebasekit/
├── template/
│   ├── src/
│   │   ├── kit/
│   │   │   ├── config/
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── marketplace/
│   │   │   ├── commerce/
│   │   │   ├── admin/
│   │   │   │   └── components/
│   │   │   ├── layout/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   ├── vitrine/
│   │   │   └── components/
│   │   └── utils/
│   ├── functions/
│   │   ├── src/
│   │   │   ├── commerce/
│   │   │   ├── auction/
│   │   │   ├── auth/
│   │   │   ├── email/
│   │   │   ├── analytics/
│   │   │   ├── maintenance/
│   │   │   ├── seo/
│   │   │   └── triggers/
│   │   └── helpers/
│   └── public/
├── scripts/
└── docs/
```

### PHASE 1 — Config Files (Racine)

Créer ces fichiers à la racine de `template/` :

#### `package.json`
Copier depuis le source MAIS :
- Changer `"name"` en `"firebasekit-app"`
- Garder TOUTES les dépendances identiques (voir liste exhaustive ci-dessous)
- Garder les scripts identiques
- **SUPPRIMER** la dépendance `recharts` (inutilisée dans le code source)

**Liste exhaustive des dépendances frontend :**
```
DEPENDENCIES RUNTIME (obligatoires):
  @stripe/react-stripe-js  ^5.6.1     ← Composants paiement Stripe
  @stripe/stripe-js        ^8.9.0     ← SDK Stripe
  @studio-freight/lenis    ^1.0.42    ← Smooth scroll (vitrine)
  @tailwindcss/postcss     ^4.1.18    ← PostCSS plugin Tailwind v4
  canvas-confetti          ^1.9.4     ← Confettis NewsletterModal
  firebase                 ^11.1.0    ← SDK Firebase
  framer-motion            ^12.34.3   ← Moteur animation #1
  gsap                     ^3.12.5    ← Moteur animation #2
  jspdf                    ^4.2.0     ← Génération factures PDF
  jspdf-autotable          ^5.0.7     ← Tables dans factures PDF
  lucide-react             ^0.468.0   ← Icônes SVG
  react                    ^18.3.1    ← Framework UI
  react-dom                ^18.3.1    ← Renderer React
  react-easy-crop          ^5.5.6     ← Crop images (Admin ImageCropperModal)
  react-helmet-async       ^2.0.5     ← SEO <head> management
  three                    ^0.160.0   ← Background 3D (vitrine)
  xlsx                     ^0.18.5    ← Export Excel (import dynamique dans AdminDashboard)

DEV DEPENDENCIES:
  @eslint/js               ^10.0.1
  @vitejs/plugin-react     ^4.3.3
  autoprefixer             ^10.4.23   ← PRÉSENT mais NON UTILISÉ (voir postcss.config.js)
  eslint-plugin-react      ^7.37.5
  eslint-plugin-react-hooks ^7.0.1
  eslint-plugin-unused-imports ^4.4.1
  postcss                  ^8.5.6
  tailwindcss              ^4.1.18
  vite                     ^5.4.11
```

**Dépendances backend (`functions/package.json`) :**
```
  firebase-admin           ^13.6.0
  firebase-functions       ^7.0.5
  nodemailer               ^6.9.4    ← Emails transactionnels
  stripe                   ^20.3.0   ← API Stripe côté serveur
  Engines: node 20
```

#### `vite.config.js`
Copier tel quel depuis le source.

#### `tailwind.config.js`
Copier tel quel depuis le source.

#### `postcss.config.js`
Copier tel quel depuis le source.

#### `eslint.config.js`
Copier tel quel depuis le source. Contient les browser globals et le plugin unused-imports.

#### `.gitignore`
Copier depuis le source. Contient les exclusions pour `.env.*`, `dist/`, `node_modules/`, Firebase cache, credentials.

#### `firebase.json`
Copier depuis le source MAIS adapter la CSP dans les headers :
- Le `Content-Security-Policy` contient des domaines Firebase spécifiques au projet
- Remplacer les domaines `*.firebaseapp.com` par le domaine du nouveau projet si nécessaire

#### `.env.example`
```env
# ============================================================
# FirebaseKit — Variables d'Environnement
# ============================================================

# --- FIREBASE CONFIG ---
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# --- APP CHECK (reCAPTCHA v3) ---
VITE_RECAPTCHA_SITE_KEY=

# --- IDENTIFIANT LOGIQUE (Préfixe Firestore) ---
VITE_APP_LOGICAL_NAME=my-store

# --- STRIPE (Paiement) ---
VITE_STRIPE_PUBLIC_KEY=

# --- SUPER ADMIN ---
VITE_SUPER_ADMIN_EMAIL=admin@example.com

# --- MARQUE / BRANDING ---
VITE_BRAND_NAME=Ma Boutique
VITE_BRAND_TAGLINE=Artisanat d'exception
VITE_BRAND_SEO_TITLE=Ma Boutique — Artisanat

# --- DONNÉES BUSINESS (Factures PDF, CGV, Footer) ---
VITE_BUSINESS_NAME=Nom Entreprise
VITE_BUSINESS_OWNER=Prénom Nom
VITE_BUSINESS_LEGAL_FORM=Entrepreneur individuel
VITE_BUSINESS_SIREN=
VITE_BUSINESS_ADDRESS=1 rue du Commerce
VITE_BUSINESS_CITY=Paris
VITE_BUSINESS_POSTAL=75001
VITE_BUSINESS_PHONE=06 00 00 00 00
VITE_BUSINESS_IBAN=
VITE_BUSINESS_BIC=
```

#### `firestore.rules`
Copier depuis le source MAIS remplacer TOUTES les occurrences de :
- `'matthis.fradin2@gmail.com'` → accès via variable ou custom claim uniquement
- `'tat-made-in-normandie'` → garder le path dynamique via le code

**IMPORTANT** : La fonction `isArtisan()` dans firestore.rules doit rester avec l'email hardcodé MAIS ajouter un commentaire `// CHANGEZ CET EMAIL POUR VOTRE SUPER ADMIN` car les rules ne supportent PAS les variables d'environnement. L'alternative est de se reposer uniquement sur `request.auth.token.admin == true` (Custom Claims).

#### `storage.rules`
Même traitement que `firestore.rules`.

#### `.firebaserc.example`
```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID",
    "production": "YOUR_PRODUCTION_PROJECT_ID"
  }
}
```

### PHASE 2 — Kit Config

#### `src/kit/config/firebase.js`
Copier `src/firebase/config.js` depuis le source. Adapter :
- Changer le path d'import : aucun changement nécessaire, les env vars restent les mêmes
- L'export reste identique : `{ auth, db, storage, functions, analytics, appId, googleProvider }`

#### `src/kit/config/constants.js`
Créer ce nouveau fichier :
```js
/**
 * FirebaseKit — Configuration Centralisée
 * Toutes les constantes paramétrable du kit sont ici.
 */

export const KIT_CONFIG = {
  // ─── IDENTIFIANTS ───
  APP_ID: import.meta.env.VITE_APP_LOGICAL_NAME || 'my-store',
  SUPER_ADMIN_EMAIL: import.meta.env.VITE_SUPER_ADMIN_EMAIL || '',

  // ─── MARQUE / BRANDING ───
  BRAND: {
    name: import.meta.env.VITE_BRAND_NAME || 'Ma Boutique',
    tagline: import.meta.env.VITE_BRAND_TAGLINE || 'Artisanat d\'exception',
    seoTitle: import.meta.env.VITE_BRAND_SEO_TITLE || 'Ma Boutique — Artisanat',
    // Textes du marquee dans MarketplaceLayout
    marqueeTexts: ['Ma Boutique', 'Savoir-Faire', 'Artisanat', 'Design', 'Excellence'],
    // Crédit développeur dans le footer (optionnel)
    developer: null,
    developerPhone: null,
  },

  // ─── DONNÉES BUSINESS (Factures, CGV, Footer) ───
  BUSINESS: {
    legalName: import.meta.env.VITE_BUSINESS_NAME || 'Nom Entreprise',
    owner: import.meta.env.VITE_BUSINESS_OWNER || 'Prénom Nom',
    legalForm: import.meta.env.VITE_BUSINESS_LEGAL_FORM || 'Entrepreneur individuel',
    siren: import.meta.env.VITE_BUSINESS_SIREN || '',
    address: import.meta.env.VITE_BUSINESS_ADDRESS || '',
    city: import.meta.env.VITE_BUSINESS_CITY || '',
    postalCode: import.meta.env.VITE_BUSINESS_POSTAL || '',
    phone: import.meta.env.VITE_BUSINESS_PHONE || '',
    iban: import.meta.env.VITE_BUSINESS_IBAN || '',
    bic: import.meta.env.VITE_BUSINESS_BIC || '',
  },

  // ─── COLLECTIONS PRODUITS ───
  PRODUCT_COLLECTIONS: [
    { id: 'furniture', label: 'Mobilier', icon: 'Layout' },
    { id: 'cutting_boards', label: 'Planches', icon: 'LayoutPanelTop' },
  ],
  DEFAULT_COLLECTION: 'furniture',

  // ─── FILTRES PRODUITS ───
  PRODUCT_FILTERS: {
    FIXED: 'fixed',
    AUCTION: 'auction',
  },

  // ─── FONCTIONNALITÉS ACTIVABLES ───
  FEATURES: {
    AUCTIONS: true,
    NEWSLETTER: true,
    ANALYTICS: true,
    SEO: true,
    APP_CHECK: true,
    THREE_JS_BACKGROUND: false,
  },

  // ─── DOMAINES CORS (Cloud Functions) ───
  ALLOWED_ORIGINS: [
    // Sera configuré dans functions/helpers/config.js
  ],
};
```

#### `src/kit/config/theme.js`
```js
/**
 * FirebaseKit — Configuration Thème
 * Le thème architectural est le thème par défaut.
 */
export const THEME_CONFIG = {
  DESIGN_ID: 'architectural',
  DEFAULT_MODE: 'light', // 'light' | 'dark'
  FONTS: {
    SANS: 'Plus Jakarta Sans',
    SERIF: 'Cormorant Garamond',
  },
  COLORS: {
    BACKGROUND_LIGHT: '#FAFAF9',
    BACKGROUND_DARK: '#0A0A0A',
    PRIMARY: 'stone', // Tailwind color palette
  },
};
```

### PHASE 3 — Kit Contexts

#### `src/kit/contexts/AuthContext.jsx`
Copier depuis `src/contexts/AuthContext.jsx` MAIS :
1. Remplacer `'matthis.fradin2@gmail.com'` par `import { KIT_CONFIG } from '../config/constants'; ... KIT_CONFIG.SUPER_ADMIN_EMAIL`
2. Changer le path d'import Firebase : `from '../config/firebase'` au lieu de `from '../firebase/config'`
3. Garder TOUTE la logique PWA iOS/Android identique

#### `src/kit/contexts/CartContext.jsx`
**NOUVEAU FICHIER** — Extraire la logique cart depuis `App.jsx` :
```jsx
// Extraire de App.jsx (lignes ~76-497) :
// - cartItems state
// - isCartOpen state
// - cartInteracted state
// - addToCart function
// - removeFromCart function
// - cartTotal computed
// - useEffect cart sync avec Firestore
// - useEffect auto-add pending item after login
// Fournir via Context Provider
```

#### `src/kit/contexts/ThemeContext.jsx`
**NOUVEAU FICHIER** — Extraire la logique thème depuis `App.jsx` :
```jsx
// Extraire de App.jsx :
// - darkMode state + localStorage persistence
// - useLiveTheme hook integration
// - forcedMode sync
// - document.documentElement dark class toggle
// Fournir via Context Provider
```

### PHASE 4 — Kit Hooks

#### `src/kit/hooks/useAuth.js`
```js
export { useAuth } from '../contexts/AuthContext';
```

#### `src/kit/hooks/useCart.js`
```js
export { useCart } from '../contexts/CartContext';
```

#### `src/kit/hooks/useLiveTheme.js`
Copier depuis `src/hooks/useLiveTheme.js`. Adapter l'import Firebase.

#### `src/kit/hooks/useProducts.js`
**NOUVEAU FICHIER** — Extraire la logique produits depuis `App.jsx` :
```jsx
// Extraire de App.jsx (lignes ~254-270) :
// - items state (furniture)
// - boardItems state (cutting_boards)
// - onSnapshot subscriptions
// Utiliser KIT_CONFIG.PRODUCT_COLLECTIONS pour être dynamique
```

#### `src/kit/hooks/useNavigation.js`
**NOUVEAU FICHIER** — Extraire la logique navigation depuis `App.jsx` :
```jsx
// Extraire de App.jsx :
// - view state + setView
// - selectedItemId state
// - URL hash sync
// - Deep link handling
// - Gallery state persistence (persistentGalleryState)
// - Header visibility scroll logic
```

### PHASE 5 — Kit Marketplace

Copier ces fichiers avec adaptation des imports :

| Source | Destination Kit | Adaptations |
|--------|----------------|-------------|
| `src/pages/GalleryView.jsx` | `kit/marketplace/GalleryView.jsx` | Import from `../config/firebase` |
| `src/designs/architectural/MarketplaceLayout.jsx` | `kit/marketplace/MarketplaceLayout.jsx` | — |
| `src/designs/architectural/components/ProductCard.jsx` | `kit/marketplace/ProductCard.jsx` | — |
| `src/designs/architectural/ArchitecturalProductDetail.jsx` | `kit/marketplace/ProductDetail.jsx` | — |
| `src/designs/architectural/components/ArchitecturalHeader.jsx` | `kit/marketplace/MarketplaceHeader.jsx` | — |

### PHASE 6 — Kit Commerce

| Source | Destination Kit | Adaptations |
|--------|----------------|-------------|
| `src/pages/CheckoutView.jsx` | `kit/commerce/CheckoutView.jsx` | Import from `../config/firebase` |
| `src/components/cart/CartSidebar.jsx` | `kit/commerce/CartSidebar.jsx` | — |
| `src/components/cart/CheckoutPaymentStep.jsx` | `kit/commerce/CheckoutPaymentStep.jsx` | — |
| `src/pages/MyOrdersView.jsx` | `kit/commerce/MyOrdersView.jsx` | — |
| `src/components/orders/OrderSuccessModal.jsx` | `kit/commerce/OrderSuccessModal.jsx` | — |

### PHASE 7 — Kit Admin (COPIE DIRECTE)

Copier TOUS les fichiers `src/features/admin/` → `kit/admin/` sans modification de logique.
Adapter UNIQUEMENT les imports pour pointer vers `../config/firebase` et `../config/constants`.

**Fichiers à copier (15 fichiers — LISTE EXHAUSTIVE) :**
- `AdminDashboard.jsx` — ⚠️ Contient email hardcodé L.665 + `xlsx` import dynamique
- `AdminAnalytics.jsx` — Custom SVG charts (PAS de Recharts)
- `AdminOrders.jsx` — ⚠️ Contient `appId` hardcodé L.48
- `AdminForm.jsx`
- `AdminItemList.jsx`
- `AdminHomepage.jsx` — Module de personnalisation vitrine depuis l'admin
- `AdminUsers.jsx` — ⚠️ Contient email hardcodé 3x (L.125, L.143, L.148)
- `AdminAuctions.jsx`
- `AdminComments.jsx` — Module commentaires/avis clients
- `AdminNewsletter.jsx`
- `AdminSEO.jsx` — ⚠️ Contient données téléphone/texte locaux hardcodés
- `AdminIPManager.jsx`
- `AdminPaymentSettings.jsx`
- `AdminStudio.jsx`
- `components/AdminImageCard.jsx`
- `components/ImageCropperModal.jsx` — Utilise `react-easy-crop`
- `components/TextEditorModal.jsx`

### PHASE 8 — Kit Layout + Shared + UI

#### Layout
| Source | Destination |
|--------|------------|
| `src/components/layout/Footer.jsx` | `kit/layout/Footer.jsx` |
| `src/components/layout/GlobalMenu.jsx` | `kit/layout/GlobalMenu.jsx` |
| `src/components/auth/NewsletterModal.jsx` | `kit/layout/NewsletterModal.jsx` |

#### Shared
| Source | Destination |
|--------|------------|
| `src/components/shared/AnalyticsProvider.jsx` | `kit/shared/AnalyticsProvider.jsx` |
| `src/components/shared/ErrorBoundary.jsx` | `kit/shared/ErrorBoundary.jsx` |
| `src/components/shared/SEO.jsx` | `kit/shared/SEO.jsx` |

**NOUVEAU** : `kit/shared/LoginModal.jsx` — Extraire le JSX du modal login depuis `App.jsx` (lignes ~588-719) en composant séparé.

#### UI
Copier TOUS les fichiers de `src/components/ui/` → `kit/ui/` :
- `AnimatedPrice.jsx`
- `AnimatedThemeToggler.jsx`
- `AuctionTimer.jsx`
- `ConfettiRain.jsx`
- `CurvedLoop.jsx` + `CurvedLoop.css`
- `EditorialMarquee.jsx`
- `TextType.jsx` + `TextType.css`
- `Toast.jsx`

### PHASE 9 — Kit Admin IP Tracker
| Source | Destination |
|--------|------------|
| `src/components/admin/AdminIPTracker.jsx` | `kit/admin/AdminIPTracker.jsx` |

### PHASE 10 — Vitrine Placeholder

#### `src/vitrine/HomeView.jsx`
```jsx
import React from 'react';

/**
 * ============================================================
 * VITRINE — Page d'Accueil (PERSONNALISABLE)
 * ============================================================
 * 
 * Ce fichier est le SEUL que vous devez modifier pour chaque nouveau site.
 * Il reçoit des props du kit pour se connecter au marketplace.
 * 
 * PROPS DISPONIBLES :
 * - onEnterMarketplace()       → Naviguer vers la boutique
 * - onStartMarketplaceTransition() → Animation de transition
 * - darkMode (boolean)         → État du thème sombre
 * - onOpenDiscovery()          → Ouvrir le popup découverte (optionnel)
 * 
 * RÈGLES :
 * 1. DOIT contenir au moins UN bouton/CTA appelant onEnterMarketplace
 * 2. DOIT respecter darkMode pour la cohérence visuelle
 * 3. PEUT importer des composants depuis ./components/
 * 4. NE DOIT PAS importer depuis ../kit/ directement
 */
const HomeView = ({ 
  onEnterMarketplace, 
  onStartMarketplaceTransition,
  darkMode,
  onOpenDiscovery 
}) => {
  const handleEnterShop = () => {
    if (onStartMarketplaceTransition) onStartMarketplaceTransition();
    setTimeout(() => {
      if (onEnterMarketplace) onEnterMarketplace();
    }, 600);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${
      darkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAF9] text-stone-900'
    }`}>
      {/* ========================================= */}
      {/* REMPLACEZ CE CONTENU PAR VOTRE DESIGN     */}
      {/* ========================================= */}
      
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
          Votre Marque
        </h1>
        <p className={`text-lg ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
          Remplacez ce contenu par votre page vitrine personnalisée.
        </p>
        
        {/* CTA OBLIGATOIRE : Doit appeler handleEnterShop */}
        <button
          onClick={handleEnterShop}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all hover:scale-105 ${
            darkMode 
              ? 'bg-white text-stone-900 hover:bg-stone-100' 
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
        >
          Découvrir la Boutique →
        </button>
      </div>
    </div>
  );
};

export default HomeView;
```

### PHASE 11 — App.jsx Refactoré

Le nouveau `App.jsx` du kit doit :

1. **Importer** depuis `./kit/` au lieu de chemins dispersés
2. **Utiliser les Contexts** : `AuthProvider`, `CartProvider`, `ThemeProvider`
3. **Utiliser les Hooks** : `useNavigation`, `useProducts`, `useCart`
4. **Être BEAUCOUP plus court** (~300 lignes max vs 918 actuellement)
5. **Importer HomeView** depuis `./vitrine/HomeView`

Structure du nouveau App.jsx :
```jsx
import { AuthProvider } from './kit/contexts/AuthContext';
import { CartProvider } from './kit/contexts/CartContext';
import { ThemeProvider, useTheme } from './kit/contexts/ThemeContext';
import { ToastProvider, useToast } from './kit/ui/Toast';
import ErrorBoundary from './kit/shared/ErrorBoundary';
import SEO from './kit/shared/SEO';
import AnalyticsProvider from './kit/shared/AnalyticsProvider';
// ... etc

// Vitrine (PERSONNALISABLE)
import HomeView from './vitrine/HomeView';

// Kit Components  
import AppRouter from './Router';
import CartSidebar from './kit/commerce/CartSidebar';
import GlobalMenu from './kit/layout/GlobalMenu';
import Footer from './kit/layout/Footer';
import MarketplaceHeader from './kit/marketplace/MarketplaceHeader';
import LoginModal from './kit/shared/LoginModal';
import NewsletterModal from './kit/layout/NewsletterModal';
```

### PHASE 12 — Router.jsx Refactoré

Copier `src/Router.jsx` mais adapter les imports pour pointer vers `./kit/` :
```jsx
// Avant :
import HomeView from './pages/HomeView';
// Après :
import HomeView from './vitrine/HomeView';

// Avant :
const GalleryView = React.lazy(() => import('./pages/GalleryView'));
// Après :
const GalleryView = React.lazy(() => import('./kit/marketplace/GalleryView'));

// Avant :
const AdminDashboard = React.lazy(() => import('./features/admin/AdminDashboard'));
// Après :
const AdminDashboard = React.lazy(() => import('./kit/admin/AdminDashboard'));
```

### PHASE 13 — Cloud Functions

Copier l'intégralité de `functions/` → `template/functions/` avec ces adaptations :

1. **`functions/helpers/config.js`** — Doit lire le super admin email depuis Firebase Environment Config
2. **`functions/helpers/security.js`** — Les domaines CORS doivent être configurables
3. **`functions/src/analytics/sessions.js`** — Remplacer la liste hardcodée de domaines CORS par un import depuis `security.js`

### PHASE 14 — Fichiers Restants (⚠️ CRITIQUE POUR L'UI)

| Source | Destination | ⚠️ Instructions CRITIQUES |
|--------|------------|--------------------------|
| `src/main.jsx` | `template/src/main.jsx` | Copie DIRECTE (contient `stripePromise` global + `HelmetProvider` SEO) |
| `src/index.css` | `template/src/index.css` | **COPIE INTÉGRALE** — 344 lignes avec 30+ animations/keyframes/perf hacks |
| `src/utils/generateInvoice.js` | `template/src/utils/generateInvoice.js` | **⚠️ CONTIENT DONNÉES BUSINESS** — voir PHASE 15 |
| `src/utils/imageUtils.js` | `template/src/utils/imageUtils.js` | Copie directe (compression WebP + crop) |
| `src/utils/time.js` | `template/src/utils/time.js` | Copie directe (helpers Firestore timestamps) |
| `index.html` | `template/index.html` | **⚠️ FICHIER LE PLUS CRITIQUE POUR L'UI** — voir détail ci-dessous |
| `postcss.config.js` | `template/postcss.config.js` | **COPIE EXACTE** — NE PAS ajouter autoprefixer (cause jitter iOS) |
| `public/manifest.json` | `template/public/manifest.json` | **⚠️ PERSONNALISER** nom, icônes, couleurs |
| `public/robots.txt` | `template/public/robots.txt` | **⚠️ ADAPTER** l'URL du sitemap |
| `public/favicon_final.png` | `template/public/` | Copie directe (placeholder — le client mettra le sien) |
| `public/apple-touch-icon.png` | `template/public/` | Copie directe (placeholder) |

#### ⚠️ `index.html` — TEMPLATE OBLIGATOIRE

Le `index.html` source contient des éléments INDISPENSABLES pour l'UI. Le template DOIT conserver :

**À CONSERVER INTACT :**
```html
<!-- VIEWPORT PWA (ligne 6) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="theme-color" content="#1a120b" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- GOOGLE FONTS NON-BLOQUANT (lignes 35-47) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://firebasestorage.googleapis.com" crossorigin>
<link rel="preconnect" href="https://firestore.googleapis.com" crossorigin>
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
  media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap">
</noscript>
```

**À PERSONNALISER :**
- `<title>` → Nom du site client
- `<meta name="description">` → Description du site client
- `<meta property="og:*">` → OpenGraph du client
- `<link rel="canonical">` → URL du client
- `<script type="application/ld+json">` → JSON-LD schema du client (ou supprimer)
- `<link rel="icon">` / `<link rel="apple-touch-icon">` → Favicons du client

**Si les polices Google Fonts sont absentes, 4 polices retomberont sur les fallbacks système et TOUTE la typographie sera cassée.**

---

## 🎨 GARANTIE UI / ANIMATIONS / POLICES

### 🚨 SECTION CRITIQUE — NE PAS IGNORER

Le projet utilise **3 moteurs d'animation** simultanés et **4 polices Google Fonts**.
Chaque couche est INDISPENSABLE pour l'expérience premium du site.

### Polices Google Fonts (4 familles)

| Police | Usage | Fichier de référence |
|--------|-------|---------------------|
| **Plus Jakarta Sans** (200-800) | Police principale (`font-sans`) | `index.css:18`, `tailwind.config.js:19` |
| **Cormorant Garamond** (300,400,600,italic) | Titres serif (`font-serif`) | `index.css:7,71`, `tailwind.config.js:20` |
| **DM Serif Display** (normal,italic) | Marquee textes (inline) | `EditorialMarquee.jsx:87` |
| **Playfair Display** (700,italic) | Vitrine (Home) | Utilisé dans HomeView |

> **Toutes sont chargées via `index.html`** avec la technique non-bloquante `media="print" onload`.
> Si le `<link>` Google Fonts est absent → fallback système → UI cassée.

### Moteur 1 : Framer Motion — Interactions Complexes

| Composant Kit | Animation |
|--------------|-----------|
| `MarketplaceLayout.jsx` | `conic-gradient` rotating border (mobile nav) — `rotate -360°, 6s infinite` |
| `AnimatedThemeToggler.jsx` | `AnimatePresence popLayout` + spring(150,15) + View Transition API `clip-path circle()` |
| `Toast.jsx` | `AnimatePresence` spring(400,30) slide-in `y:-20` |
| `GlobalMenu.jsx` | Per-letter `motion.span` hover — stagger 0.015s, ease `[0.19,1,0.22,1]` |
| `CartSidebar.jsx` | `AnimatePresence` slide-in panel |
| `ProductDetail.jsx` | Image transitions `AnimatePresence` |

### Moteur 2 : GSAP — Animations Continues (Ticker 60fps)

| Composant Kit | Animation |
|--------------|-----------|
| `TextType.jsx` | Curseur clignotant `gsap.to(opacity, repeat:-1, yoyo)` + `power2.inOut` |
| `AnimatedPrice.jsx` | Count-up `gsap.to(val, duration:0.8)` + color flash emerald→inherit |
| `EditorialMarquee.jsx` | Scroll-velocity marquee `gsap.ticker.add()` — scroll reactive |
| `CurvedLoop.jsx` | SVG textPath scrolling `gsap.ticker.add()` — pixel-perfect wrap |

### Moteur 3 : CSS Compositor Thread — Performance 120fps+

| Composant Kit | Animation CSS |
|--------------|-------------|
| `GlobalMenu.jsx` | Panel: `translate3d(100%→0)` 700ms + items: `skewX(14°)` stagger `transition-delay` |
| `ArchitecturalHeader.jsx` | Smart scroll: `translate-y-0 ↔ -translate-y-full` 300ms |
| `ProductCard.jsx` | Image zoom: `group-hover:scale-110` duration-800ms `cubic-bezier(0.23,1,0.32,1)` |
| `ProductCard.jsx` | Museum overlay: 4 coins `translate-x/y` reveal 600ms |
| `ProductCard.jsx` | "Découvrir" text: `translate-y-2→0` + line `scale-x-0→100` 800ms |
| `Footer.jsx` | Social icons `group-hover:scale-110` 500ms + title `hover:translate-x-4` 700ms |
| `ArchitecturalHeader.jsx` | Cart badge: `animate-[radar-ping_3s]` double pulse |
| `ArchitecturalHeader.jsx` | Menu↔X icon: `rotate-90 scale-50` morph 500ms |
| `ArchitecturalHeader.jsx` | Nav underline: `w-0→w-full` 500ms ease-out |

### Easing Constants (GlobalMenu.jsx)
```js
const EASE_OPEN  = 'cubic-bezier(0.23,1,0.32,1)';   // Spring overdamped (ζ≈1.24)
const EASE_CLOSE = 'cubic-bezier(0.12,0.8,0.3,1)';   // Spring underdamped (ζ≈0.85, ~4% overshoot)
```

### Fichiers CSS Critiques (3 fichiers — COPIE INTÉGRALE)

| Fichier | Lignes | Contenu critique |
|---------|--------|------------------|
| `src/index.css` | 344 | `@theme` tokens Tailwind v4, `@custom-variant dark`, 10+ `@keyframes`, iOS safe-area, PWA, modal scroll lock, GPU hacks, autofill fixes, View Transition API, `prefers-reduced-motion` |
| `src/components/ui/TextType.css` | 14 | Styles `.text-type`, `.text-type__cursor` pour le composant typewriter |
| `src/components/ui/CurvedLoop.css` | 24 | Styles `.curved-loop-jacket/svg` pour le marquee SVG — font-size 6rem, aspect-ratio |

### Optimisations Performance (Dans index.css — NE PAS SUPPRIMER)

| Technique | Ligne CSS | Rôle |
|-----------|-----------|------|
| `overflow-x: clip` (vs `hidden`) | L.23 | Ne casse PAS `position: sticky` |
| `will-change: transform` | L.87-89 | GPU pre-promotion |
| `.transform-gpu { translateZ(0) }` | L.191-195 | Force GPU layer |
| `@media (prefers-reduced-motion)` | L.214-224 | A11y animations |
| `.custom-scrollbar` | L.229-254 | Admin panel scrollbar custom |
| `@keyframes radar-ping` | L.258-268 | Cart badge pulse |
| `@keyframes shimmer-sweep` | L.293-300 | Skeleton loading |
| `.autofill-dark/light` | L.305-323 | Chrome autofill color override |
| `::view-transition-old/new(root)` | L.328-344 | Theme toggle circular reveal |

---

## 🔧 RÈGLES DE TRANSFORMATION DES IMPORTS

Quand tu copies un fichier, applique SYSTÉMATIQUEMENT ces règles de remplacement :

```
ANCIEN                                  → NOUVEAU
──────────────────────────────────────────────────────────────
from '../../firebase/config'            → from '../config/firebase'
from '../firebase/config'               → from '../config/firebase'
from '../../contexts/AuthContext'       → from '../contexts/AuthContext'
from '../contexts/AuthContext'          → from '../contexts/AuthContext'
from '../../hooks/useLiveTheme'         → from '../hooks/useLiveTheme'
from '../hooks/useLiveTheme'            → from '../hooks/useLiveTheme'
from '../../utils/time'                 → from '../../utils/time'  (inchangé, utils est hors kit)
from '../designs/architectural/...'     → from '../kit/marketplace/...'
from '../features/admin/...'           → from '../kit/admin/...'
from '../components/layout/...'        → from '../kit/layout/...'
from '../components/cart/...'          → from '../kit/commerce/...'
from '../components/shared/...'        → from '../kit/shared/...'
from '../components/ui/...'            → from '../kit/ui/...'
from '../components/orders/...'        → from '../kit/commerce/...'
from '../components/auth/...'          → from '../kit/layout/...'
from '../components/admin/...'         → from '../kit/admin/...'
```

**ATTENTION IMPORTS INTERNES AU KIT** :
Les imports entre fichiers du kit doivent utiliser des chemins relatifs COURTS.
La profondeur varie selon le sous-dossier :
```
// Fichier dans kit/admin/AdminDashboard.jsx
from '../config/firebase'              // ✅ Correct (admin → config = 1 niveau)
from '../../kit/config/firebase'       // ❌ Faux (ne pas remonter hors du kit)

// Fichier dans kit/marketplace/ProductCard.jsx
from '../ui/AuctionTimer'              // ✅ Correct (marketplace → ui = 1 niveau)
from '../../components/ui/AuctionTimer' // ❌ Ancien chemin cassé

// Fichier dans kit/admin/components/AdminImageCard.jsx
from '../../config/firebase'           // ✅ Correct (admin/components → config = 2 niveaux)
```

---

## ✅ CHECKLIST DE VALIDATION FINALE

Avant de considérer le kit terminé, vérifier :

**Fonctionnel :**
- [ ] `npm install` dans `template/` → 0 erreur
- [ ] `npm run dev` dans `template/` → app démarre
- [ ] `npm run build` → 0 erreur
- [ ] Aucun import cassé dans la console (0 erreur, 0 warning)

**Vitrine :**
- [ ] La page placeholder s'affiche avec la bonne police (Plus Jakarta Sans)
- [ ] Le bouton "Découvrir la Boutique" amène au marketplace

**Marketplace :**
- [ ] Le marketplace affiche la grille produits (même vide, message "Aucune pièce")
- [ ] Le titre utilise la police Cormorant Garamond (serif)
- [ ] L'animation TextType (typewriter) fonctionne dans le header galerie
- [ ] Le hover sur une ProductCard montre le zoom image + overlay musée
- [ ] Les boutons navigation mobile ont le border rotatif conic-gradient

**Layout :**
- [ ] Le menu global s'ouvre avec animation slide + skew
- [ ] Le hover par lettres fonctionne sur desktop dans le menu
- [ ] Le footer s'affiche avec la bonne typo serif italique
- [ ] Le toggle dark mode a l'animation circulaire (View Transition API)
- [ ] Le cart badge a le double pulse radar-ping

**Admin :**
- [ ] L'accès admin (`#admin`) affiche le login
- [ ] Le scrollbar custom s'affiche dans le panel admin
- [ ] AnimatedPrice fait le count-up GSAP sur les KPIs

**Configuration :**
- [ ] `functions/` a son propre `package.json` complet
- [ ] `.env.example` contient toutes les variables nécessaires
- [ ] `firestore.rules` a le commentaire pour changer le super admin
- [ ] `index.html` contient les 4 Google Fonts + preconnects + PWA meta
- [ ] Le dossier `vitrine/` ne contient QUE le placeholder

---

## ⚠️ PIÈGES CONNUS À ÉVITER

### 1. App.jsx est ÉNORME (918 lignes)
Ne PAS copier tel quel. Extraire en sous-contextes/hooks d'abord.

### 2. Chemins d'import relatifs
Le plus gros risque de casse. Toujours vérifier les profondeurs de dossier.
Utiliser le tableau de mapping ci-dessus SYSTÉMATIQUEMENT.

### 3. `appId` dans les paths Firestore
Le path `artifacts/{appId}/public/data/` est utilisé PARTOUT. Vérifier que `KIT_CONFIG.APP_ID` ou l'import `appId` de firebase config est utilisé correctement.

### 4. Email admin hardcodé dans AuthContext
```js
// LIGNE CRITIQUE dans AuthContext.jsx :
if (user.email === 'matthis.fradin2@gmail.com') {
  setIsAdmin(true);
}
// DOIT devenir :
if (user.email === KIT_CONFIG.SUPER_ADMIN_EMAIL) {
  setIsAdmin(true);
}
```

### 5. Composants `home/` du source
Les composants `src/components/home/` (`MarketplaceDiscovery`, `ProcessSection`, `StackedCards`, `ThreeBackground`) sont SPÉCIFIQUES à la vitrine "Tous à Table". Ils ne doivent PAS être dans le kit. Seul `MarketplaceDiscovery.jsx` peut être pertinent comme popup optionnel dans le kit.

### 6. CSS Files associés aux composants UI
Ne PAS oublier de copier `CurvedLoop.css` et `TextType.css` avec leurs composants `.jsx` respectifs.
Ces fichiers DOIVENT rester dans le même dossier que leur composant `.jsx`.

### 7. Le fichier `index.html` (⚠️ LE PLUS CRITIQUE POUR L'UI)
Contient **4 polices Google Fonts**, le viewport PWA, les preconnects, et le chargement non-bloquant.
- **DOIT conserver** : viewpport meta, Apple PWA meta, Google Fonts `<link>`, preconnects, `<noscript>` fallback
- **DOIT adapter** : `<title>`, meta description, OG tags, canonical URL, JSON-LD, favicons

### 8. `postcss.config.js` — NE PAS ajouter autoprefixer
Le projet utilise Tailwind v4 qui gère les vendor prefixes nativement.
Ajouter autoprefixer cause des **doublons `-webkit-`** → **jitter scroll sur iOS Safari**.

### 9. `main.jsx` contient des exports critiques
- `stripePromise` est exporté globalement et utilisé par `CheckoutView`
- `HelmetProvider` wrape toute l'app pour le SEO `<Helmet>`
- Sans ces deux éléments, le paiement ET le SEO sont cassés.

### 10. `EditorialMarquee.jsx` utilise DM Serif Display en inline
```jsx
style={{ fontFamily: '"DM Serif Display", serif' }}
```
Cette police est chargée via `index.html`. Si elle manque → fallback serif (Cormorant ou Times).
Le marquee est utilisé dans la vitrine MAIS pourrait être réutilisé dans la vitrine d'un futur client.

### 11. `AdminComments.jsx` oublié de Phase 7
Ce module de gestion des commentaires/avis clients existe dans `features/admin/` mais n'était pas listé.

### 12. `xlsx` utilisé en import dynamique
Dans `AdminDashboard.jsx` L.379 et L.454, `xlsx` est importé dynamiquement :
```jsx
const XLSX = await import('xlsx');
```
Cela signifie qu'il DOIT être dans `package.json` même s'il n'apparaît pas dans les imports statiques.

### 13. `recharts` est dans package.json mais INUTILISÉ
Le code utilise des charts SVG custom (pas Recharts). La dépendance peut être supprimée pour alléger le bundle.

---

## 🗺️ TABLE EXHAUSTIVE DES VALEURS HARDCODÉES

> **RÈGLE** : L'agent DOIT remplacer CHAQUE occurrence ci-dessous lors de la copie.
> Toute valeur non remplacée signifie que le kit est **livré avec les données d'un autre business**.

### Catégorie A — Emails Super Admin

| Fichier Source | Ligne(s) | Valeur hardcodée | Remplacer par |
|---------------|----------|------------------|---------------|
| `src/contexts/AuthContext.jsx` | 98, 107, 114 | `'matthis.fradin2@gmail.com'` | `KIT_CONFIG.SUPER_ADMIN_EMAIL` |
| `src/features/admin/AdminDashboard.jsx` | 665 | `'matthis.fradin2@gmail.com'` | `KIT_CONFIG.SUPER_ADMIN_EMAIL` |
| `src/features/admin/AdminUsers.jsx` | 125, 143, 148 | `'matthis.fradin2@gmail.com'` | `KIT_CONFIG.SUPER_ADMIN_EMAIL` |
| `functions/helpers/security.js` | 8 | `'matthis.fradin2@gmail.com'` | Variable d'env ou `.env` |
| `storage.rules` | 11 | `'matthis.fradin2@gmail.com'` | Commentaire + instruction |
| `firestore.rules` | (isArtisan) | `'matthis.fradin2@gmail.com'` | Commentaire + instruction |

### Catégorie B — Données Business / Facture

| Fichier Source | Ligne(s) | Valeur hardcodée | Action |
|---------------|----------|------------------|--------|
| `src/utils/generateInvoice.js` | 16-17 | `"Tous à table Made in Normandie"` | Extraire vers `KIT_CONFIG.BUSINESS` |
| `src/utils/generateInvoice.js` | 21 | `"Olivier Pegoix"` | `KIT_CONFIG.BUSINESS.owner` |
| `src/utils/generateInvoice.js` | 22-23 | `"346 chemin de Fleury, 14123 IFS"` | `KIT_CONFIG.BUSINESS.address` |
| `src/utils/generateInvoice.js` | 24 | `"07 77 32 41 78"` | `KIT_CONFIG.BUSINESS.phone` |
| `src/utils/generateInvoice.js` | 25 | `"803 328 756"` | `KIT_CONFIG.BUSINESS.siren` |
| `src/utils/generateInvoice.js` | 26 | `"Entrepreneur individuel"` | `KIT_CONFIG.BUSINESS.legalForm` |
| `src/utils/generateInvoice.js` | 121-125 | IBAN + BIC | `KIT_CONFIG.BUSINESS.iban/bic` |

### Catégorie C — Données de Contact / Marque

| Fichier Source | Ligne(s) | Valeur hardcodée | Action |
|---------------|----------|------------------|--------|
| `src/components/layout/Footer.jsx` | 16 | `'07 77 32 41 78'` | `KIT_CONFIG.BUSINESS.phone` |
| `src/components/layout/Footer.jsx` | 148 | `"Matthis Fradin"` | `KIT_CONFIG.BRAND.developer` ou supprimer |
| `src/components/layout/Footer.jsx` | 150 | `"0782013155"` | Supprimer ou paramétrer |
| `src/components/layout/Footer.jsx` | 21 | Texte SEO "Tous à Table" | `KIT_CONFIG.BRAND.seoText` |
| `src/pages/MyOrdersView.jsx` | 275, 432 | `"07 77 32 41 78"` | `KIT_CONFIG.BUSINESS.phone` |
| `src/pages/MyOrdersView.jsx` | 320 | `"L'équipe Tous à Table"` | `KIT_CONFIG.BRAND.name` |
| `src/components/shared/SEO.jsx` | 5-6 | `"Tous à Table Made in Normandie"` | `KIT_CONFIG.BRAND.name` |
| `src/features/admin/AdminSEO.jsx` | 13, 19 | Téléphone + texte SEO | `KIT_CONFIG.BUSINESS.phone` |

### Catégorie D — Marquee / Branding Marketplace

| Fichier Source | Ligne(s) | Valeur hardcodée | Action |
|---------------|----------|------------------|--------|
| `src/designs/architectural/MarketplaceLayout.jsx` | 68 | `["Tous à Table", "Savoir-Faire", ...]` | `KIT_CONFIG.BRAND.marqueeTexts` |
| `src/designs/architectural/ArchitecturalProductDetail.jsx` | 117 | JSON-LD brand name | `KIT_CONFIG.BRAND.name` |
| `src/designs/architectural/components/ArchitecturalHeader.jsx` | 90 | `"Tous à Table"` | `KIT_CONFIG.BRAND.name` |
| `src/App.jsx` | 758 | `"Tous à Table"` | `KIT_CONFIG.BRAND.name` |

### Catégorie E — Cloud Functions

| Fichier Source | Ligne(s) | Valeur hardcodée | Action |
|---------------|----------|------------------|--------|
| `functions/helpers/config.js` | 6 | `'tat-made-in-normandie'` | Variable d'env |
| `functions/helpers/config.js` | 18-19 | URLs tousatable/tatmadeinnormandie | Paramétrer |
| `functions/helpers/security.js` | 8 | Email super admin | Variable d'env |
| `functions/src/email/orderEmails.js` | 50 | `tousatablemadeinnormandie@gmail.com` | Variable d'env ou supprimer le CC |
| `functions/src/analytics/sessions.js` | 101-107 | Liste CORS origins hardcodée | Import depuis `config.js` |
| `src/features/admin/AdminOrders.jsx` | 48 | `'tat-made-in-normandie'` | `import { appId } from config` |

### Catégorie F — Fichiers de Configuration

| Fichier Source | Contenu hardcodé | Action |
|----------------|------------------|--------|
| `public/manifest.json` | `"Tous à Table Made in Normandie"` | Placeholder générique |
| `public/robots.txt` | `tousatable-madeinnormandie.fr` | Placeholder `YOUR_DOMAIN` |
| `index.html` | `<title>`, meta description, OG, JSON-LD | Template avec placeholders |


### PHASE 15 — Paramétrage des Données Business (⚠️ CRITIQUE)

Cette phase consiste à remplacer TOUTES les valeurs hardcodées recensées dans la table ci-dessus.
L'agent DOIT appliquer les remplacements fichier par fichier.

#### 15.1 — `generateInvoice.js`
Ce fichier doit importer `KIT_CONFIG` et utiliser `KIT_CONFIG.BUSINESS.*` pour :
- Nom entreprise, gérant, forme juridique
- Adresse, téléphone, SIREN
- IBAN, BIC

#### 15.2 — `Footer.jsx`
- Téléphone → `KIT_CONFIG.BUSINESS.phone`
- Crédit développeur → `KIT_CONFIG.BRAND.developer` (nullable, masquer si null)
- Texte SEO → `KIT_CONFIG.BRAND.name`

#### 15.3 — `MyOrdersView.jsx`
- Téléphones → `KIT_CONFIG.BUSINESS.phone`
- "L'équipe Tous à Table" → `KIT_CONFIG.BRAND.name`

#### 15.4 — `SEO.jsx`
- `siteTitle` → `KIT_CONFIG.BRAND.seoTitle`

#### 15.5 — `MarketplaceLayout.jsx`
- Marquee textes → `KIT_CONFIG.BRAND.marqueeTexts`

#### 15.6 — `ArchitecturalProductDetail.jsx`
- JSON-LD brand name → `KIT_CONFIG.BRAND.name`

#### 15.7 — `ArchitecturalHeader.jsx`
- Logo texte → `KIT_CONFIG.BRAND.name`

#### 15.8 — `AdminOrders.jsx`
- `appId` hardcodé → `import { appId } from '../config/firebase'`

#### 15.9 — Fichiers publics
- `manifest.json` → Placeholders `YOUR BRAND`, `YOUR DESCRIPTION`, couleurs neutres
- `robots.txt` → `Sitemap: https://YOUR_DOMAIN/sitemap.xml`

#### 15.10 — Cloud Functions
- `orderEmails.js` L.50 → Supprimer le CC email hardcodé ou le rendre configurable
- `sessions.js` L.101-107 → Importer les origins depuis `config.js`
- `config.js` → Lire `APP_ID` et URLs depuis env config Firebase

---

## 📚 DOCUMENTATION À CRÉER

### `docs/VITRINE_API.md`
Documenter le contrat de props entre le kit et la vitrine custom.

### `docs/SETUP.md`
Guide pas à pas pour créer un nouveau projet avec le kit :
1. Copier le template
2. Setup Firebase (console)
3. Configurer `.env.local` (toutes les variables VITE_*)
4. Configurer Stripe (clés API + webhook)
5. Configurer reCAPTCHA
6. Configurer Firebase Secrets (GMAIL_EMAIL, GMAIL_PASSWORD, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
7. Modifier `firestore.rules` et `storage.rules` (email super admin)
8. Personnaliser la vitrine
9. `npm install && npm run dev`
10. Deploy (`firebase deploy`)

### `docs/COLLECTIONS.md`
Documenter le schéma Firestore complet avec types de champs.

### `README.md`
Le README racine du kit est dans `firebasekit/README.md`. Ne PAS le dupliquer dans le SKILL.


# 🔥 FirebaseKit

> Kit modulaire pour déployer des sites e-commerce sur Firebase à la chaîne.
> Seule la page vitrine est unique par projet. Tout le reste est standardisé.

## Quick Start

```bash
# 1. Copier le template
cp -r template/ mon-nouveau-site/

# 2. Setup
cd mon-nouveau-site
cp .env.example .env.local
# Remplir .env.local avec vos clés Firebase / Stripe / reCAPTCHA + données business

# 3. Installer et lancer
npm install
npm run dev

# 4. Personnaliser
# Éditer src/vitrine/HomeView.jsx avec votre design unique

# 5. Déployer
npm run build
firebase deploy
```

## Architecture

```
template/src/
├── kit/          ← 🔒 Code standardisé (NE PAS MODIFIER)
│   ├── config/   ← Firebase, constantes (KIT_CONFIG), thème
│   ├── contexts/ ← Auth, Cart, Theme  
│   ├── hooks/    ← useAuth, useCart, useProducts, useNavigation
│   ├── marketplace/  ← Galerie + Fiches produit + Header
│   ├── commerce/     ← Checkout + Panier + Commandes
│   ├── admin/        ← Backoffice complet (15 modules)
│   ├── layout/       ← Footer + Menu + Newsletter
│   ├── shared/       ← SEO + Analytics + ErrorBoundary
│   └── ui/           ← Toast, Animations, Timers...
│
├── vitrine/      ← 🎨 VOTRE DESIGN UNIQUE
│   ├── HomeView.jsx
│   └── components/
│
└── utils/        ← Utilitaires (Factures, Images, Temps)
```

## Configuration Centralisée

Toute la personnalisation métier se fait dans **2 fichiers** :

### 1. `.env.local` — Variables d'environnement
```env
# Firebase / Stripe / reCAPTCHA → Clés API
VITE_SUPER_ADMIN_EMAIL=admin@example.com
VITE_APP_LOGICAL_NAME=my-store

# Marque
VITE_BRAND_NAME=Ma Boutique
VITE_BRAND_TAGLINE=Artisanat d'exception

# Business (Factures PDF, CGV, Footer)
VITE_BUSINESS_NAME=Nom Entreprise
VITE_BUSINESS_OWNER=Prénom Nom
VITE_BUSINESS_PHONE=06 00 00 00 00
VITE_BUSINESS_SIREN=123456789
VITE_BUSINESS_ADDRESS=1 rue du Commerce
VITE_BUSINESS_IBAN=FR76...
```

### 2. `src/kit/config/constants.js` — Configuration avancée
- Collections produits (catégories)
- Textes marquee du marketplace
- Feature flags (enchères, newsletter, analytics...)
- Domaines CORS

## Stack Technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | React 18 + Vite 5 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion + GSAP + CSS Compositor |
| **Polices** | Plus Jakarta Sans, Cormorant Garamond, DM Serif Display, Playfair Display |
| **Backend** | Firebase Cloud Functions (Node 20) |
| **Database** | Firestore |
| **Auth** | Firebase Auth (Google + Email + Anonymous) |
| **Storage** | Firebase Storage |
| **Paiement** | Stripe (Elements + Checkout) |
| **Emails** | Nodemailer (Gmail) |
| **PDF** | jsPDF + jsPDF-AutoTable |
| **SEO** | React Helmet Async + sitemap dynamique |

## Features Incluses

| Feature | Status |
|---------|--------|
| Marketplace avec filtres et enchères | ✅ |
| Tunnel de commande Stripe (Elements + différé) | ✅ |
| Dashboard admin (KPIs, Revenue, Sessions) | ✅ |
| Analytics live (sessions temps réel) | ✅ |
| CRUD Produits (Images, Prix, Enchères) | ✅ |
| Gestion Commandes (shipped, completed, cancelled) | ✅ |
| Gestion Clients (rôles, désactivation) | ✅ |
| Newsletter avec popup intelligent | ✅ |
| Commentaires / Avis clients | ✅ |
| SEO dynamique (Sitemap + OpenGraph + JSON-LD) | ✅ |
| Auth Google + Email + Anonymous | ✅ |
| App Check anti-bot (reCAPTCHA v3) | ✅ |
| Dark Mode (Auto/Forcé via Firestore) | ✅ |
| PWA ready (iOS + Android) | ✅ |
| Emails transactionnels (commande, expédition, livraison) | ✅ |
| Génération factures PDF | ✅ |
| Export Excel (commandes, clients) | ✅ |
| IP Tracking admin | ✅ |
| Sécurité Firestore + Storage Rules | ✅ |
| Code Splitting optimisé (vendor, firebase, gsap, three) | ✅ |

## Animations Préservées

Le kit conserve **3 moteurs d'animation** simultanés :

- **Framer Motion** → Transitions de composants, panels, toasts
- **GSAP** → Typewriter, compteurs animés, marquees 60fps
- **CSS Compositor** → Hover cards, scroll header, menu skew

> Toutes les animations sont identiques au projet source. Voir le [SKILL.md](../.agent/skills/firebasekit/SKILL.md) pour l'inventaire complet.

## Cloud Functions (Backend)

26 fonctions organisées en modules :

| Module | Fonctions |
|--------|-----------|
| **Commerce** | createCheckoutSession, createPaymentIntent, confirmPaymentIntent, handleStripeWebhook, createManualOrder |
| **Enchères** | placeBid, closeBid, autoCloseExpiredAuctions |
| **Auth** | setAdminRole, setInitialCustomClaims |
| **Email** | onOrderCreated, onOrderUpdated, sendNewsletter |
| **Analytics** | initLiveSession, syncSession, syncSessionBeacon, deleteSession, clearAllSessions |
| **Maintenance** | staleOrderCleanup, scheduleCleanupSessions, forceCleanupSessions |
| **SEO** | sitemapXml, sitemapProducts, robotsTxt |
| **Triggers** | onNewUserCreated |

## Documentation

- [Skill Agent (instructions complètes)](../.agent/skills/firebasekit/SKILL.md) — Plan exécutoire pour l'agent AI
- `docs/SETUP.md` — Guide setup nouveau projet
- `docs/VITRINE_API.md` — Contrat d'interface vitrine ↔ kit
- `docs/COLLECTIONS.md` — Schéma Firestore complet

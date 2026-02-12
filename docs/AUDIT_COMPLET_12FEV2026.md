# 🔍 Audit Complet — Tous à Table
> **Date** : 12 Février 2026, 01:40  
> **Post-Optimisation** : P1 (Chunking) + P2 (CDN→npm) + P3 (Dead deps) + P4 (Tree-shake)

---

## 📊 Score Global : **8.7 / 10** ⬆️ (vs. ~6.5 avant optimisation)

| Catégorie | Score | Détail |
|---|:---:|---|
| 🏗️ Architecture | 9/10 | Propre, bien séparée, lazy loading |
| 📦 Build & Bundle | 8.5/10 | 24 chunks intelligents, ~2MB total |
| 🔒 Sécurité | 9/10 | Rules solides, rate-limit, headers |
| ⚡ Performance | 8/10 | Bon mais Three.js encore lourd |
| 🎨 UX/Design | 9.5/10 | Premium, animations GSAP fluides |
| 📝 Code Quality | 8/10 | Lisible mais quelques monolithes |
| 🔎 SEO | 9/10 | Schema.org, meta, Open Graph |

---

## 📦 1. BUILD & BUNDLE (8.5/10)

### Métriques Actuelles
```
Total Build:     24 fichiers JS + 2 CSS
Taille Totale:   2,111 KB (~2.06 MB) — code non-gzippé
Temps de Build:  ~6 secondes
```

### Breakdown par Chunk

| Chunk | Taille | Chargement | Commentaire |
|---|---|---|---|
| `firebase` | 550 KB | Initial | SDK Firebase (incompressible) |
| `three` | 432 KB | Lazy | Three.js — lazy via React.lazy ✅ |
| `xlsx` | 418 KB | Dynamique | Import dynamique au clic ✅ |
| `vendor` | 138 KB | Initial | React + React-DOM |
| `index` | 118 KB | Initial | App principale |
| `gsap` | 111 KB | Initial | Animations |
| `icons` | 27 KB | Initial | Lucide-react |
| 16× pages | ~10 KB moy. | Lazy | Chargement à la demande ✅ |

### Ce que le visiteur télécharge réellement au 1er chargement :
```
firebase   550 KB  (nécessaire pour auth + data)
vendor     138 KB  (React)
index      118 KB  (App principale)
gsap       111 KB  (Animations)
icons       27 KB  (Icônes)
CSS        136 KB  (Styles)
─────────────────
TOTAL     1,080 KB  (~1.05 MB avant gzip)
           ~350 KB  (~0.34 MB après gzip estimé)
```

### ✅ Points Forts
- **Lazy Loading** : Three.js, xlsx, et toutes les pages sont chargés à la demande
- **manualChunks** : Séparation intelligente par domaine (firebase / gsap / three / vendor)
- **Pas de CDN externe** : Tout est self-hosted, zéro dépendance tierce au runtime
- **Cache immutable** : Headers `max-age=31536000, immutable` sur `/assets/**`

### ⚠️ Axes d'Amélioration
- `firebase` (550KB) est le plus gros chunk — inévitable avec Firestore+Auth+Storage+Functions
- `three` (432KB) est lazy-loaded mais reste lourd — seules 8 classes sont utilisées mais le tree-shaking Three.js est limité par son architecture ESM

---

## 🏗️ 2. ARCHITECTURE (9/10)

### Statistiques Codebase
```
Fichiers source:   44 fichiers (.jsx, .js, .css)
Lignes de code:    8,124 lignes
Dépendances:       17 packages directs
```

### Structure
```
src/
├── pages/           → 5 Vues (Home, Gallery, Product, Checkout, MyOrders)
├── components/      → 7 Composants réutilisables
├── designs/         → 1 Design System (Architectural)
├── features/admin/  → 8 Modules admin (Dashboard, Orders, Auctions, etc.)
├── firebase/        → 1 Config centralisée
├── hooks/           → Hooks custom (useLiveTheme, etc.)
└── utils/           → Utilitaires (time, etc.)
```

### ✅ Points Forts
- **Séparation claire** : Pages / Composants / Features / Design System
- **Single Design** : Plus de multi-thèmes, architecture simplifiée
- **Config centralisée** : Un seul `config.js` pour tout Firebase
- **Lazy routing** : Toutes les pages via `React.lazy()` dans le Router
- **ErrorBoundary** : Protection globale contre les crashes

### ⚠️ Axes d'Amélioration
- `HomeView.jsx` est un **monolithe** (~1,418 lignes) — ce n'est pas bloquant mais une extraction en sous-composants (HeroSection, ManifestoSection, ProcessSection, DataSection, TeamSection, FAQSection) améliorerait la maintenabilité
- `app.jsx` fait aussi ~700 lignes — mériterait une extraction des logiques (AuthContext, CartContext, etc.)

---

## 🔒 3. SÉCURITÉ (9/10)

### Firestore Rules ✅
| Règle | Statut |
|---|---|
| Admin vérifié (email + custom claim) | ✅ |
| Validation de schéma produit (`isValidProduct`) | ✅ |
| Isolation panier par utilisateur | ✅ |
| Commandes créées via Cloud Function uniquement | ✅ |
| Bids créés via Cloud Function uniquement | ✅ |
| Collections `sys_*` verrouillées client-side | ✅ |
| Images Homepage publiques | ✅ |

### Storage Rules ✅
| Règle | Statut |
|---|---|
| Upload admin uniquement | ✅ |
| Limite 10MB par fichier | ✅ |
| Images uniquement (`image/*`) | ✅ |
| Lecture publique | ✅ |

### Headers HTTP (firebase.json) ✅
| Header | Statut |
|---|---|
| `X-Content-Type-Options: nosniff` | ✅ |
| `X-Frame-Options: DENY` | ✅ |
| `X-XSS-Protection: 1; mode=block` | ✅ |
| `Referrer-Policy: strict-origin-when-cross-origin` | ✅ |
| Cache immutable sur assets | ✅ |
| HTML non-caché (must-revalidate) | ✅ |

### Backend (Cloud Functions)
| Protection | Statut |
|---|---|
| Rate limiting enchères (5/min) | ✅ |
| Idempotence enchères (anti-doublon) | ✅ |
| Email vérifié pour commandes | ✅ |
| Stripe Webhook signature obligatoire | ✅ |
| Super-admin protégé contre suppression | ✅ |

### ⚠️ Axes d'Amélioration
- **CSP manquant** dans `firebase.json` — le `Content-Security-Policy` a été supprimé à un moment. Le remettre renforcerait la protection XSS
- `X-XSS-Protection` est **déprécié** par les navigateurs modernes — CSP le remplace

---

## ⚡ 4. PERFORMANCE (8/10)

### Optimisations Actives
| Technique | Statut |
|---|---|
| Code Splitting (React.lazy) | ✅ |
| Dynamic Import (xlsx) | ✅ |
| Image WebP + Thumbnails | ✅ |
| Preconnect Firebase/Fonts | ✅ |
| Fonts non-bloquantes (`media=print` trick) | ✅ |
| GPU acceleration (will-change, force3D) | ✅ |
| Three.js pause hors viewport | ✅ |
| Lenis smooth scroll | ✅ |
| ScrollTrigger refreshPriority | ✅ |
| GSAP Safety Refresh (polling) | ✅ |
| Image optimization (HD + Thumb) | ✅ |

### ⚠️ Axes d'Amélioration
- **Images Unsplash dans l'HTML** : Les fallback OG/Twitter pointent vers Unsplash au lieu d'images Firebase hébergées — pas critique mais suboptimal pour le SEO
- **Pas de Service Worker** : Un SW pourrait cacher les assets statiques pour un chargement offline/instant sur visites suivantes
- **Three.js tree-shaking limité** : Malgré les imports nommés, Three.js bundle encore ~430KB à cause de son architecture interne

---

## 🎨 5. UX/DESIGN (9.5/10)

| Élément | Qualité |
|---|---|
| Preloader animé (GSAP) | ✅ Premium |
| Hero 3D (Three.js wireframe) | ✅ Unique |
| Scroll horizontal Process (≥1536px) | ✅ Impressionnant |
| Stacked Cards (scrub) | ✅ Cinématique |
| Parallax Manifesto (smart mobile) | ✅ Adaptatif |
| Museum Gallery hover (Desktop) | ✅ Architectural |
| Mode Light/Dark forceable | ✅ Flexible |
| Smart Scroll Header | ✅ Space-efficient |
| AnimatedPrice (GSAP counter) | ✅ Luxueux |
| Mobile-first responsive | ✅ Propre |

### ⚠️ Seul bémol
- Le preloader ajoute ~3 secondes au premier affichage — c'est voulu (effet luxe), mais ça impacte le score PageSpeed FCP

---

## 🔎 6. SEO (9/10)

| Élément | Statut |
|---|---|
| `<title>` descriptif | ✅ |
| `<meta description>` | ✅ |
| Open Graph (Facebook/WhatsApp) | ✅ |
| Twitter Card | ✅ |
| Schema.org LocalBusiness (JSON-LD) | ✅ |
| `lang="fr"` | ✅ |
| `robots.txt` | ✅ |
| `manifest.json` | ✅ |
| Helmet async (React) | ✅ |

### ⚠️ Axes d'Amélioration
- Images OG/Twitter pointent vers **Unsplash** (pas vers les vraies photos de l'atelier)
- Pas de `sitemap.xml` généré automatiquement
- Le numéro de téléphone dans le Schema.org est un placeholder (`+33 6 00 00 00 00`)

---

## 🗂️ 7. DÉPENDANCES (17 packages)

| Package | Version | Rôle | Critique ? |
|---|---|---|---|
| react | 18.3.1 | UI Framework | ✅ |
| react-dom | 18.3.1 | DOM Rendering | ✅ |
| firebase | 11.10.0 | Backend complet | ✅ |
| gsap | 3.14.2 | Animations | ✅ |
| three | 0.160.1 | 3D Background | ⚡ Lazy |
| xlsx | 0.18.5 | Export Excel admin | ⚡ Dynamic |
| lucide-react | 0.468.0 | Icônes | ✅ |
| @studio-freight/lenis | 1.0.42 | Smooth scroll | ✅ |
| react-easy-crop | 5.5.6 | Cropper admin | ⚡ Lazy |
| react-helmet-async | 2.0.5 | SEO | ✅ |
| tailwindcss | 4.1.18 | CSS | Build |
| @tailwindcss/postcss | 4.1.18 | PostCSS plugin | Build |
| postcss | 8.5.6 | CSS Processing | Build |
| autoprefixer | 10.4.23 | CSS Prefixing | Build |
| vite | 5.4.21 | Bundler | Build |
| @vitejs/plugin-react | 4.7.0 | JSX Transform | Build |
| firebase-admin | 13.6.1 | ⚠️ Voir note | ⚠️ |

### ⚠️ Note : `firebase-admin` dans le frontend
`firebase-admin` (13.6.1) est dans les dépendances du frontend `package.json`. C'est une dépendance **backend** qui ne devrait être que dans `functions/package.json`. Elle n'est pas importée dans le code frontend mais elle alourdit inutilement `node_modules`.

---

## 📈 8. ÉVOLUTION (Avant → Après Optimisation)

| Métrique | Avant (P0) | Après (P1-P4) | Gain |
|---|---|---|---|
| Fichiers JS build | **1,018** | **24** | **-97.6%** |
| Taille build | **~49 MB** | **~2.1 MB** | **-95.7%** |
| Requêtes CDN | **3** (GSAP, Lenis, ScrollTrigger) | **0** | **-100%** |
| Dépendances mortes | **4** (emailjs, crisp, 4 auth providers) | **0** | **-100%** |
| Bundle initial (visiteur) | **~3+ MB** | **~1.1 MB** | **-63%** |
| Stacked Cards ≥1536px | **🔴 Cassé** | **🟢 Fonctionnel** | Bug fix |

---

## 🎯 9. RECOMMANDATIONS (Priorité)

### 🟢 Quick Wins (1-2h)
1. **Remettre le CSP header** dans `firebase.json`
2. **Remplacer les images Unsplash** dans `index.html` par des images Firebase Storage
3. **Mettre le vrai numéro de téléphone** dans le Schema.org
4. **Retirer `firebase-admin`** du `package.json` racine (le garder uniquement dans `functions/`)

### 🟡 Nice-to-Have (demi-journée)
5. **Extraire HomeView.jsx** en sous-composants (HeroSection, ManifestoSection, etc.)
6. **Générer un `sitemap.xml`** automatiquement au build
7. **Ajouter un Service Worker** pour le cache offline

### 🔵 Long Terme
8. **Remplacer Three.js** par un canvas WebGL léger custom (~5KB vs 430KB) si le design le permet
9. **Migration vers React 19** quand la version stable sera mature

---

*Audit généré le 12/02/2026 à 01:40 — Post-optimisation P1→P4.*

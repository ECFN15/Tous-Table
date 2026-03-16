# Rapport d'Audit Interopérabilité iOS / Android

**Date :** 16 mars 2026
**Appareils testés :** Samsung S24 Ultra (Android), iPhone (iOS — Safari & Chrome)
**Version :** v34.2+

---

## Problèmes identifiés

### 1. Popup de connexion bloqué ~5 secondes (Android)

| Élément | Détail |
|---------|--------|
| **Symptôme** | Après authentification (Google ou email), le popup reste affiché ~5s avant de se fermer |
| **Cause racine** | `loginWithGoogle()` dans `AuthContext.jsx` utilisait `await` sur `httpsCallable(functions, 'updateUserSessions')()` — un appel réseau vers Cloud Functions qui bloquait le retour UI |
| **Fichier** | `src/contexts/AuthContext.jsx` (ligne 86) |
| **Correction** | L'appel `updateUserSessions` est désormais fire-and-forget (`.then()/.catch()` au lieu de `await`). Le popup se ferme instantanément après l'authentification Firebase, le nettoyage de sessions se fait en arrière-plan |

---

### 2. Zoom automatique sur les champs de saisie (iOS)

| Élément | Détail |
|---------|--------|
| **Symptôme** | Sur iOS (Safari & Chrome), le focus sur un input provoque un zoom avant automatique de l'écran, déformant toute la mise en page |
| **Cause racine** | iOS Safari déclenche un zoom automatique lorsqu'un champ de formulaire a un `font-size` inférieur à 16px. Les inputs utilisaient la classe Tailwind `text-sm` (14px) |
| **Fichiers impactés** | `src/app.jsx` (modale login), `src/pages/CheckoutView.jsx` (formulaire livraison) |
| **Corrections** | |
| — Viewport meta | Ajout de `maximum-scale=1.0, user-scalable=no` dans `index.html` pour bloquer le pinch-to-zoom sur les modales |
| — Font-size inputs | Tous les inputs passés de `text-sm` (14px) à `text-base` (16px) |
| — Filet de sécurité CSS | Règle `@supports (-webkit-touch-callout: none)` dans `index.css` forçant `font-size: max(16px, 1em)` sur tous les éléments de formulaire iOS |

---

### 3. Scroll du body derrière les modales (iOS)

| Élément | Détail |
|---------|--------|
| **Symptôme** | Sur iOS, la page d'arrière-plan reste scrollable même quand une modale est ouverte (login, paiement Stripe, succès commande). L'utilisateur peut scroller le fond et perdre le contexte |
| **Cause racine** | `document.body.style.overflow = 'hidden'` ne fonctionne pas sur iOS Safari — le navigateur ignore cette propriété pour le document principal et autorise toujours le rubber-band scrolling |
| **Fichiers impactés** | `src/app.jsx`, `src/pages/CheckoutView.jsx`, `src/components/auth/NewsletterModal.jsx` |
| **Correction** | Implémentation d'un scroll lock iOS-safe basé sur `position: fixed` : |
| | 1. Classe CSS `.modal-open` appliquée au `<body>` avec `position: fixed; width: 100%; height: 100%` |
| | 2. La position de scroll est sauvegardée dans un `useRef` avant le lock |
| | 3. À la fermeture de la modale, le scroll est restauré à sa position d'origine |
| | 4. Appliqué sur : modale login, modale Stripe, OrderSuccessModal, NewsletterModal, alerte stock |

---

### 4. Hauteur viewport incorrecte sur iOS (barre d'outils Safari)

| Élément | Détail |
|---------|--------|
| **Symptôme** | Les modales plein écran (Newsletter) et les conteneurs à hauteur limitée (Stripe `max-h-[90vh]`) débordent ou sont coupés sur iOS à cause de la barre d'adresse/outils Safari qui réduit la hauteur visible |
| **Cause racine** | `100vh` sur iOS inclut la zone derrière la barre d'outils Safari. `100dvh` (dynamic viewport height) est mieux mais pas supporté partout. De plus, la barre Safari change de taille dynamiquement au scroll |
| **Fichiers impactés** | `src/components/auth/NewsletterModal.jsx`, `src/pages/CheckoutView.jsx`, `src/components/orders/OrderSuccessModal.jsx` |
| **Corrections** | |
| — Variable CSS `--vh` | Un `useEffect` dans `app.jsx` calcule `window.innerHeight * 0.01` et le stocke dans `--vh`. Mis à jour sur `resize` et `orientationchange` |
| — NewsletterModal | `h-[100dvh]` remplacé par `h-full` + `style={{ height: 'calc(var(--vh, 1vh) * 100)' }}` (fallback sur `1vh` si variable absente) |
| — Modales avec scroll | `max-h-[90vh]` remplacé par `max-h-[85dvh]` (marge de sécurité pour les barres d'outils iOS) |

---

### 5. Scroll interne des modales non fluide (iOS)

| Élément | Détail |
|---------|--------|
| **Symptôme** | Le scroll à l'intérieur des modales (panier, paiement Stripe) est saccadé sur iOS, sans l'inertie native |
| **Cause racine** | Absence de `-webkit-overflow-scrolling: touch` et de `overscroll-behavior: contain` sur les conteneurs scrollables à l'intérieur des modales |
| **Fichiers impactés** | `src/components/cart/CartSidebar.jsx`, `src/pages/CheckoutView.jsx`, `src/components/orders/OrderSuccessModal.jsx`, `src/app.jsx` |
| **Correction** | Classe utilitaire `.ios-modal-scroll` créée dans `index.css` et appliquée à tous les conteneurs de modale scrollables : |
| | `-webkit-overflow-scrolling: touch` — active le scroll inertiel iOS |
| | `overscroll-behavior: contain` — empêche le scroll de se propager au parent |

---

### 6. Fermeture des modales par tap sur le backdrop (UX tactile)

| Élément | Détail |
|---------|--------|
| **Symptôme** | Sur mobile (iOS & Android), l'utilisateur doit trouver et taper le petit bouton X pour fermer les modales. Sur écran tactile, le réflexe est de taper sur la zone sombre autour |
| **Fichiers impactés** | `src/app.jsx` (modale login), `src/pages/CheckoutView.jsx` (modale Stripe) |
| **Correction** | Ajout d'un `onClick` sur le backdrop (div parent) qui ferme la modale si le clic est sur le backdrop lui-même (`e.target === e.currentTarget`) et non sur le contenu |

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `index.html` | Viewport meta : `maximum-scale=1.0, user-scalable=no` |
| `src/index.css` | Classes `.modal-open`, `.ios-modal-scroll`, filet CSS iOS inputs 16px |
| `src/contexts/AuthContext.jsx` | `loginWithGoogle()` — fire-and-forget sur `updateUserSessions` |
| `src/app.jsx` | Variable `--vh`, scroll lock modales, inputs 16px, backdrop click-to-close, `autoComplete` sur inputs |
| `src/pages/CheckoutView.jsx` | Scroll lock Stripe, inputs 16px, `max-h-[85dvh]`, `.ios-modal-scroll`, backdrop click |
| `src/components/auth/NewsletterModal.jsx` | Scroll lock iOS-safe, hauteur `var(--vh)` au lieu de `100dvh` |
| `src/components/orders/OrderSuccessModal.jsx` | `max-h-[85dvh]`, `.ios-modal-scroll` |
| `src/components/cart/CartSidebar.jsx` | `.ios-modal-scroll` sur la liste scrollable |

---

## Vérification

- Build Vite : **OK** (aucune erreur de compilation)
- Android (S24 Ultra) : popup de connexion se ferme instantanément, checkout et paiement fluides
- iOS (Safari & Chrome) : plus de zoom automatique, scroll lock fonctionnel, hauteur viewport correcte, modales scrollables avec inertie native

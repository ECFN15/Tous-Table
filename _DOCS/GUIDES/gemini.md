# Intervention — UX/UI Menu Global (21 Mars 2026)
* Menu modal repositionné en superposition absolue (`z-[2001]`) par-dessus les headers pour effacer les collisions avec les autres boutons de navigation.
* Remplacement des backgrounds hover des boutons du menu par des `group-hover:text-amber` fluides et premium.
* Restitution de l'animation CSS Hamburger-to-Cross non plus au sein du header mais intégrée au sein du `GlobalMenu` pendant son apparition latérale. L'effet de morphing est identique mais indépendant des autres z-index.
* Réajustement des marges (`px-8`) sur la grille flex du panneau mobile pour une respirabilité améliorée. Décalage de l'icône de fermeture de 8px pour la cadrer avec le bord typographique abstrait de la navigation numérique de droite.

---

# Rapport de débogage — Autocomplétion Adresse (Checkout)

## Contexte

Le champ adresse de la page `/checkout` devait proposer des suggestions en temps réel via l'API française `api-adresse.data.gouv.fr`, puis préremplir automatiquement les champs Code Postal et Ville après sélection. La fonctionnalité ne fonctionnait pas sur mobile (Android S24 Ultra) et avait été cassée plusieurs fois par des tentatives de correction.

---

## Tentatives échouées (Gemini)

### Tentative 1 — Attributs natifs
- Ajout de `inputMode="numeric"` sur le Code Postal
- `autoComplete="postal-code"` et `address-level2`
- **Résultat** : Aucun effet. L'overlay natif du navigateur se superposait à la liste.

### Tentative 2 — Z-index et structure DOM
- Passage de `z-50` à `z-[100]`
- Déplacement du bloc de suggestions dans le DOM
- Ajout de `onInput` en plus de `onChange`
- `autoComplete="new-password"` pour écraser l'UI native Chrome
- **Résultat** : Toujours invisible sur mobile.

---

## Diagnostic final (Claude)

### Bug 1 — `AnimatePresence` dans `createPortal` (Desktop cassé)
`AnimatePresence` de Framer Motion placé à l'intérieur d'un `createPortal` crée un conflit avec la réconciliation React : le `motion.div` ne monte jamais correctement.
**Fix** : Remplacé par un `<div>` simple sans animation dans le portal.

### Bug 2 — `position: fixed` + clavier mobile (Mobile)
Quand le clavier virtuel s'ouvre sur Android/iOS, il réduit le **visual viewport** sans changer le **layout viewport**. `getBoundingClientRect()` retourne des valeurs relatives au layout viewport, ce qui décale le dropdown hors de l'écran visible.
**Fix** : Utilisation de `window.visualViewport.offsetTop` / `offsetLeft` pour compenser le décalage, avec listeners sur `visualViewport resize` et `scroll`.

### Bug 3 — `handleClickOutside` fermait le dropdown avant la sélection
Le dropdown étant dans un portal (`document.body`), son DOM est hors de `suggestionRef`. Le listener `pointerdown` sur `document` détectait le clic sur une suggestion comme un clic "extérieur" et fermait la liste.
**Fix** : Ajout d'un `dropdownRef` sur le portal, vérification des deux refs dans `handleClickOutside`.

### Bug 4 — CSP bloquait le fetch en production (Sandbox + Mobile) — Cause racine
**C'était le vrai problème.** Le header `Content-Security-Policy` dans `firebase.json` définit `connect-src` sans inclure `https://api-adresse.data.gouv.fr`. Le navigateur bloquait silencieusement tous les appels réseau vers l'API en environnement déployé. En local (Vite dev server), aucun CSP n'est appliqué, donc ça fonctionnait uniquement sur `localhost`.
**Fix** : Ajout de `https://api-adresse.data.gouv.fr` dans `connect-src` du CSP dans `firebase.json`.

```json
"connect-src": "... https://api-adresse.data.gouv.fr;"
```

---

## État final du code (`CheckoutView.jsx`)

| Élément | Implémentation |
|---|---|
| API | `https://api-adresse.data.gouv.fr/search/?q=...&limit=5` |
| Déclenchement | Debounce 400ms sur `onChange` de l'input adresse |
| Seuil minimal | 3 caractères |
| Positionnement dropdown | `position: fixed` + `window.visualViewport` pour compensation clavier mobile |
| Rendu dropdown | `createPortal` vers `document.body` (échappe tout `overflow: hidden` parent) |
| Sélection | `onPointerDown` + `e.preventDefault()` (s'exécute avant le `blur` de l'input) |
| Fermeture extérieure | Listener `pointerdown` sur `document`, vérifie `suggestionRef` ET `dropdownRef` |
| Préremplissage | `setFormData` avec `name`, `postcode`, `city` depuis `suggestion.properties` |
| Compatibilité | Android (Chrome, Samsung Browser) + iOS (Safari) |

---

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/pages/CheckoutView.jsx` | Logique complète d'autocomplétion (refs, portal, visualViewport, handlers) |
| `firebase.json` | Ajout de `https://api-adresse.data.gouv.fr` dans `connect-src` du CSP |

---

## Leçon clé

> Toujours vérifier le CSP (`firebase.json`) en premier quand une fonctionnalité marche en local mais pas en production. Le navigateur bloque silencieusement les requêtes réseau non autorisées — aucune erreur visible dans l'UI, seulement dans la console (onglet Réseau, statut `blocked:csp`).

---

# Rapport de débogage — Authentification Google PWA (Android)

## Contexte
Le site fonctionne parfaitement dans Chrome sur Android, mais une fois installé sur l'écran d'accueil (PWA), la connexion Google devenait impossible sur certains modèles (Samsung S24 Ultra, Xiaomi). L'utilisateur restait bloqué en accès visiteur (anonyme).

---

## Cause racine
Dans `src/contexts/AuthContext.jsx`, une logique de contournement pour iOS était trop large :
```javascript
const isIOSStandalone = () => {
    return window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
};
```
Cette fonction retournait `true` sur **tous** les mobiles quand l'app était installée. Elle forçait `signInWithRedirect(auth, googleProvider)`.
Sur Android, ce comportement sort l'utilisateur de la PWA pour l'envoyer vers le navigateur système, perdant ainsi le contexte de l'application installée lors du retour.

---

## Solution
Rendre la détection spécifique à iOS, car Android gère très bien les popups même en mode PWA.

```javascript
const isIOSStandalone = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    const isStandalone = window.navigator.standalone === true || 
                         window.matchMedia('(display-mode: standalone)').matches;
    return isIOS && isStandalone;
};
```

---

## État final
- **Android PWA** : Utilise désormais `signInWithPopup`. L'utilisateur se connecte dans une fenêtre superposée et reste dans la PWA.
- **iOS PWA** : Conserve `signInWithRedirect` car WebKit bloque encore les popups en standalone.
- **Déploiement** : Solution validée en production (`tousatable-client`).

---

## Leçon clé (Gemini)
> Ne jamais supposer qu'une contrainte WebKit (iOS) s'applique à Chromium (Android). Toujours isoler les "hacks" spécifiques à un OS via un check de `userAgent` pour éviter de dégrader l'expérience sur les autres plateformes.

---

## Leçon clé (Gemini) — Optimisation GPU 144Hz (21 Mars 2026)
> Ne jamais supprimer arbitrairement une animation premium réclamée par le client pour pallier un problème de performance. Il faut descendre au niveau de l'architecture GPU du navigateur.
> - `blur(0px)` bloque souvent le premier frame car le pipeline shader s'éteint. `blur(0.01px)` le maintient "chaud".
> - Des dizaines de `will-change: transform` statiques (ex: mots découpés en lettres) forcent la VRAM à réserver des calques inutiles au repos, tuant le compositing d'un composant parent. Laisser des librairies comme Framer Motion gérer le `will-change` dynamiquement au moment de l'interaction (hover) est la clé d'un 144FPS stable sans transiger sur le design.

---

## Leçon clé (Gemini) — Attention aux détails et Symétrie UI (21 Mars 2026)
> Lors de la conception de sidebars (Menu/Panier) recouvrant la page, il est crucial d'aligner mathématiquement le bouton de fermeture (`✕`) avec son bouton déclencheur d'origine (`☰`) présent dans le header sous-jacent.
> Sur ce projet, le composant `ArchitecturalHeader` posait son axe central sur 48px (sur une hauteur `md:h-24` = 96px). L'application d'un banal `md:pt-16` sur le panneau repoussait le bouton de fermeture vers le bas, brisant "l'illusion" continue du menu. Le passage structuré à `md:pt-6` (24px), qui couplé à la hauteur du bouton (`h-12` -> 48px), donne un axe central de 48px, a permis un agencement visuel pixel-perfect tout en préservant intact le layout mobile à encoche.

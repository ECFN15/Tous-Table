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

# Interopérabilité iOS / Android — Référence du projet

> Ce document recense tous les problèmes de compatibilité rencontrés sur ce projet entre iOS (WebKit/Safari) et Android (Chrome/Chromium), avec les causes techniques et les solutions appliquées. À consulter avant tout ajout de fonctionnalité qui touche le navigateur mobile.

---

## Règle générale iOS

**Sur iOS, TOUS les navigateurs (Safari, Chrome, Firefox, Edge…) utilisent le moteur WebKit.** Il n'existe pas de "vrai Chrome" sur iPhone. Cela signifie que les bugs Safari s'appliquent à 100% des utilisateurs iOS, sans exception.

---

## Problèmes recensés et solutions

---

### 1. Authentification Google — 3 bugs imbriqués sur iOS

**Symptôme** : Clic sur "Continuer avec Google" → rien / chargement bref / page revient sans être connecté.

#### Bug 1.a — `signInWithPopup` bloqué par WebKit
`signInWithPopup` utilise `window.open()` en interne. WebKit (iOS) bloque `window.open()` dans les contextes async, donc le popup OAuth ne s'ouvre jamais → silence total.

**Fix** : Utiliser `signInWithRedirect` sur iOS.
```javascript
const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if (isIOS()) {
    await signInWithRedirect(auth, googleProvider);
} else {
    await signInWithPopup(auth, googleProvider);
}
```

#### Bug 1.b — Safari ITP bloque `signInWithRedirect` (cause racine réelle)
`signInWithRedirect` redirige l'utilisateur vers `firebaseapp.com/__/auth/handler`. Google renvoie le token → Firebase tente de le stocker dans le localStorage de `firebaseapp.com` → puis redirige vers `web.app`. **Safari ITP (Intelligent Tracking Prevention) bloque l'accès cross-origin** entre `tatmadeinnormandie.firebaseapp.com` et `tatmadeinnormandie.web.app`. `getRedirectResult()` retourne null. `signInAnonymously` prend le relais. Résultat : modal fermée (page rechargée), utilisateur toujours anonyme.

**Fix** : Changer `authDomain` pour qu'il corresponde EXACTEMENT au domaine d'hébergement — tout le flux devient same-origin, ITP ne bloque plus rien.
```
# .env.local
VITE_FIREBASE_AUTH_DOMAIN=tatmadeinnormandie.web.app   ← était firebaseapp.com

# .env.prod
VITE_FIREBASE_AUTH_DOMAIN=tousatable-client.web.app    ← était firebaseapp.com
```

#### Bug 1.c — Race condition `getRedirectResult` vs `signInAnonymously`
Au retour du redirect, `onAuthStateChanged` pouvait déclencher `signInAnonymously` AVANT que `getRedirectResult` ait fini de traiter le credential Google. L'utilisateur anonyme écrasait l'utilisateur Google.

**Fix** : `getRedirectResult` est lancé en premier. `onAuthStateChanged` attend la résolution de sa promise avant d'appeler `signInAnonymously`.
```javascript
const redirectPromise = getRedirectResult(auth).then(r => !!r?.user).catch(() => false);

onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
        const wasRedirect = await redirectPromise;
        if (!wasRedirect) signInAnonymously(auth);
    }
});
```

**Règle à retenir** :
- `authDomain` doit toujours correspondre au domaine d'hébergement (`*.web.app` ou domaine custom)
- Ne jamais laisser `signInAnonymously` concurrencer `getRedirectResult`
- Vérifier cette configuration à chaque changement de domaine

---

### 2. Scroll lock modal — `position: fixed` sur body

**Symptôme** : Quand un modal s'ouvre, le fond de page scrolle encore sur iOS Safari.

**Cause** : `overflow: hidden` sur `body` ne bloque pas le scroll sur iOS. Safari ignore cette règle sur le `body`.

**Solution appliquée** (`index.css`) :
```css
body.modal-open {
    overflow: hidden !important;
    position: fixed !important;   /* iOS Safari: seul moyen de bloquer le scroll */
    width: 100% !important;
    background-color: #000 !important; /* Évite le flash gris pendant l'animation */
}
```
La position scroll est sauvegardée dans un `useRef` avant d'appliquer `position: fixed`, puis restaurée à la fermeture avec `window.scrollTo(0, savedY)`.

**Règle à retenir** : Sur iOS, le scroll lock nécessite `position: fixed` sur `body`. Toujours sauvegarder/restaurer `window.scrollY`.

---

### 3. Autocomplete adresse — dropdown hors écran au-dessus du clavier

**Symptôme** : Le dropdown de suggestions apparaît à une position incorrecte ou derrière le clavier sur Android et iOS.

**Cause** :
- `getBoundingClientRect()` retourne des valeurs relatives au *layout viewport*, pas au *visual viewport*. Quand le clavier ouvre, le visual viewport rétrécit mais le layout viewport reste identique.
- `position: fixed` calculé avec ces valeurs place le dropdown dans la zone cachée derrière le clavier.

**Solution appliquée** (`CheckoutView.jsx`) :
- **Mobile (< 768px)** : Bottom sheet `position: fixed; bottom: 0; left: 0; right: 0` — ancré automatiquement au bord supérieur du clavier sur Android et iOS.
- **Desktop** : Dropdown classique avec compensation `window.visualViewport.offsetTop/Left`.

```jsx
if (window.innerWidth < 768) {
    setDropdownPos({ mobile: true }); // bottom sheet, pas de calcul nécessaire
    return;
}
// Desktop : compensation visual viewport
const vvTop = window.visualViewport?.offsetTop ?? 0;
setDropdownPos({ top: rect.bottom + 4 - vvTop, ... });
```

**Règle à retenir** : Sur mobile, préférer `bottom: 0` fixe pour tout élément qui doit apparaître au-dessus du clavier. Éviter les calculs de position avec `getBoundingClientRect()` quand le clavier est ouvert.

---

### 4. `backdrop-blur` — rendu gris sur Android Chrome

**Symptôme** : L'overlay du modal de paiement affiche un fond grisâtre flou au lieu d'un fond sombre sur Android.

**Cause** : `backdrop-filter: blur()` (Tailwind : `backdrop-blur-sm`) a un rendu incohérent sur Android Chrome selon la version GPU. Sur certains appareils il rend un gris clair au lieu de flouter le contenu derrière.

**Solution appliquée** (`CheckoutView.jsx`) :
```jsx
// Avant : className="... bg-black/60 backdrop-blur-sm ..."
// Après : style={{ background: 'rgba(0,0,0,0.82)' }}
```
Overlay opaque sans blur — visuellement propre sur tous les appareils.

**Règle à retenir** : Ne pas se fier à `backdrop-blur` pour les overlays critiques. Utiliser un fond opaque ou semi-opaque en `rgba()`.

---

### 5. Input zoom — agrandissement automatique sur iOS Safari

**Symptôme** : Quand l'utilisateur tape dans un `<input>`, iOS Safari zoome automatiquement sur le champ.

**Cause** : iOS Safari zoome si la `font-size` d'un input est inférieure à **16px**.

**Solution appliquée** (`index.css`) :
```css
input, textarea, select {
    font-size: 16px !important; /* Empêche le zoom auto iOS */
}
```

**Règle à retenir** : Tous les inputs doivent avoir `font-size >= 16px` ou équivalent Tailwind (`text-base`).

---

### 6. `AnimatePresence` dans `createPortal` — Framer Motion + React

**Symptôme** : Le dropdown d'adresse ne s'affichait pas du tout sur desktop après refactoring.

**Cause** : `AnimatePresence` placé à l'intérieur d'un `createPortal` crée un conflit avec la réconciliation React — le `motion.div` ne monte jamais correctement car Framer Motion perd le contexte d'animation.

**Solution appliquée** : Remplacé par un `<div>` standard dans le portal. Pas d'animation Framer Motion dans un portal.

**Règle à retenir** : Ne jamais mettre `AnimatePresence`/`motion.*` directement dans un `createPortal`. Si animation nécessaire, animer avec du CSS natif (`transition`, `@keyframes`).

---

### 7. CSP (Content-Security-Policy) — API externes bloquées en production

**Symptôme** : Une fonctionnalité marche en local (`localhost`) mais pas sur le site déployé.

**Cause** : `firebase.json` définit un header CSP strict. `connect-src` liste les domaines autorisés pour les requêtes `fetch`. Tout domaine absent est bloqué silencieusement par le navigateur (visible uniquement dans la console, onglet Réseau → statut `blocked:csp`). En local, Vite ne sert pas le CSP.

**Exemple** : `api-adresse.data.gouv.fr` n'était pas dans `connect-src` → toutes les suggestions d'adresse échouaient silencieusement en production.

**Solution** : Ajouter le domaine dans `connect-src` dans `firebase.json` :
```json
"connect-src": "... https://api-adresse.data.gouv.fr;"
```

**Règle à retenir** : À chaque intégration d'une API externe, ajouter son domaine dans le CSP de `firebase.json` **avant** de déployer. Tester systématiquement sur le sandbox après chaque déploiement.

---

## Checklist de test mobile avant déploiement production

- [ ] Authentification Google sur iPhone (Safari)
- [ ] Authentification Google sur Android (Chrome)
- [ ] Formulaires : pas de zoom automatique sur tap
- [ ] Modals : scroll du fond bloqué sur iOS Safari
- [ ] Dropdowns/bottom sheets : position correcte avec clavier ouvert
- [ ] Overlays : fond correct sans artefacts gris
- [ ] Fonctionnalités réseau : tester sur sandbox (CSP actif), pas seulement localhost

---

## Stack de détection iOS (helper universel)

```javascript
const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    // Le 2e cas couvre l'iPad Pro en mode desktop
```

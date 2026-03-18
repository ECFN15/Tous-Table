# TODO iOS — Récap session du 16 mars 2026

## ✅ Déjà fait (code modifié, build OK)

### Auth Google — robustesse iOS
- **`AuthContext.jsx`** — Détection du mode PWA standalone iOS (`window.navigator.standalone`) → utilise `signInWithRedirect` au lieu de `signInWithPopup` (popup bloqué par WebKit en mode standalone)
- **`AuthContext.jsx`** — `getRedirectResult` géré correctement au montage, AVANT que `signInAnonymously` puisse se déclencher
- **`AuthContext.jsx`** — Remplacement du `useRef` par `sessionStorage` (`tat_google_redirect_pending`) pour le guard anti-race condition → le flag survit maintenant aux rechargements de page causés par `signInWithRedirect`
- **`LoginView.jsx`** — Utilise maintenant `loginWithGoogle()` du contexte au lieu d'appeler `signInWithPopup` directement → bénéficie de toute la logique iOS
- **`LoginView.jsx`** — Inputs email/password passés de `text-sm` (14px) à `text-base` (16px) → empêche le zoom automatique iOS Safari sur focus

### PWA & Meta tags
- **`index.html`** — Ajout de `apple-mobile-web-app-capable` → vrai mode standalone sur iPhone
- **`index.html`** — Ajout de `apple-mobile-web-app-status-bar-style: black-translucent` → status bar intégrée proprement
- **`manifest.json`** — Ajout de l'icône 180x180 → taille utilisée par iOS pour l'écran d'accueil

### CSS & UX mobile
- **`index.css`** — Ajout de la classe `.safe-area-bottom` avec `env(safe-area-inset-bottom)` → éléments ancrés en bas visibles au-dessus du home indicator iPhone X+
- **`CartSidebar.jsx`** — Classe `safe-area-bottom` appliquée → bouton "Commander" jamais masqué sur iPhone X+
- **`CheckoutView.jsx`** — Classe `safe-area-bottom` appliquée → contenu bas de page visible sur iPhone X+

### Google Cloud Console (fait manuellement)
- **Origines JavaScript autorisées** → ajout de `https://tatmadeinnormandie.web.app`
- **URI de redirection autorisés** → ajout de `https://tatmadeinnormandie.web.app/__/auth/handler`

### .env.local (sandbox)
- **`authDomain`** changé de `tatmadeinnormandie.firebaseapp.com` → `tatmadeinnormandie.web.app`
- Raison : Safari 16.1+ bloque les cookies cross-origin (ITP) → `getRedirectResult` retournait `null` silencieusement avec l'ancien domaine

---

## 🔲 À faire demain

### 1. Deploy sandbox + test iPhone (PRIORITÉ 1)
```
firebase deploy --only hosting
```
Tester sur `tatmadeinnormandie.web.app` depuis un iPhone :
- [ ] Login Google fonctionne en Safari normal
- [ ] Login email/password fonctionne
- [ ] Les inputs du checkout ne zooment pas
- [ ] Le bouton "Commander" est visible (pas masqué par le home indicator)
- [ ] Les modaux ne scrollent pas le fond de page

### 2. Si sandbox OK → faire pareil pour la PROD (tousatable-madeinnormandie.fr)

#### 2a. Google Cloud Console — projet `tousatable-client`
- [ ] Aller sur console.cloud.google.com → projet `tousatable-client`
- [ ] APIs & Services → Credentials → Web client OAuth 2.0
- [ ] **Origines JavaScript autorisées** → ajouter `https://tousatable-madeinnormandie.fr`
- [ ] **URI de redirection autorisés** → ajouter `https://tousatable-madeinnormandie.fr/__/auth/handler`

#### 2b. Firebase Console — projet `tousatable-client`
- [ ] console.firebase.google.com → projet `tousatable-client`
- [ ] Authentication → Settings → Authorized domains
- [ ] Vérifier que `tousatable-madeinnormandie.fr` est dans la liste (normalement déjà présent)

#### 2c. Code — modifier `.env.prod`
```
VITE_FIREBASE_AUTH_DOMAIN=tousatable-madeinnormandie.fr
```
(Claude peut le faire)

#### 2d. Deploy prod
```
firebase deploy --only hosting --project tousatable-client
```

---

## ⚠️ Limitation connue (rien à faire, juste à savoir)

**Google login en mode PWA standalone iOS = instable par nature**

Quand un utilisateur ajoute l'app sur son écran d'accueil iPhone ET essaie de se connecter avec Google, WebKit peut bloquer aussi bien `signInWithPopup` que `signInWithRedirect`. C'est un bug connu Firebase/WebKit (issue #77, fermée won't-fix par Google).

**Ce qui est en place comme filet de sécurité :**
- Le code tente `signInWithRedirect` en mode standalone (notre implémentation)
- Si ça échoue quand même → **le login email/password reste toujours disponible**
- La vraie solution long terme serait Capacitor (app native) mais ce n'est pas l'objectif

---

## 📋 Ce qui était déjà bien (aucune modification nécessaire)

- Body scroll lock iOS (position: fixed + scrollY sauvegardé/restauré) ✅
- `-webkit-overflow-scrolling: touch` sur les modaux ✅
- Input zoom prevention `font-size: max(16px, 1em)` global ✅
- Variable CSS `--vh` pour la barre d'adresse Safari ✅
- `viewport-fit=cover` dans le meta viewport ✅
- `onPointerDown` sur les dropdowns (pas onClick) ✅
- `inputMode="numeric"` sur le code postal checkout ✅
- CSP headers complets (Firebase, Stripe, Google) ✅
- Webkit prefixes (`-webkit-backdrop-filter`, etc.) ✅
- Pas d'AnimatePresence dans createPortal ✅
- apple-touch-icon en PNG ✅

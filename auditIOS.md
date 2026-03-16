# Audit iOS — Rapport d'incident & Guide pour l'audit complet

## Contexte de l'incident (16 mars 2026)

### Problème initial signalé
L'authentification Google ne fonctionnait pas sur iPhone 16 (iOS 18, Safari). Clic sur "Continuer avec Google" → rien ne se passait. La version production (`tousatable-client.web.app`) fonctionnait correctement. Seul le sandbox (`tatmadeinnormandie.web.app`) était affecté.

### Ce qui a été tenté (et pourquoi c'était une erreur)

**Tentative 1 — `signInWithRedirect` sur iOS**
- Hypothèse : `signInWithPopup` bloqué par WebKit iOS
- Résultat : comportement différent mais toujours non fonctionnel ("chargement sans connexion")
- Erreur de raisonnement : la prod utilise `signInWithPopup` et fonctionne → le popup n'est pas le problème

**Tentative 2 — Changement de `authDomain` vers `web.app`**
- Hypothèse : Safari ITP bloque le cross-origin entre `firebaseapp.com` et `web.app`
- Résultat : **"Access blocked — This app's request is not valid"** → auth complètement cassée
- Cause de la casse : changer `authDomain` change le `redirect_uri` envoyé à Google OAuth. Ce nouveau URI n'était pas enregistré dans les credentials Google Cloud Console → blocage immédiat par Google
- Erreur de raisonnement : solution théoriquement correcte mais incomplète — nécessite aussi d'ajouter le domaine dans Google Cloud Console

**Résolution finale**
- Revert complet vers `signInWithPopup` sans logique iOS spécifique
- Revert de `authDomain` vers `firebaseapp.com`
- **Conclusion** : le problème initial était probablement contextuel (navigateur in-app, mode privé Safari, session spécifique) et non un bug de code. La prod et le sandbox utilisent maintenant exactement le même code auth.

---

## Leçon clé de cet incident

> **Ne jamais supposer qu'un comportement iOS est un bug de code si la version de production fonctionne avec le même code.** Toujours commencer par comparer le comportement prod vs sandbox avant de toucher à l'auth.

> **`authDomain` ne se change jamais sans faire les 3 étapes en même temps** : (1) `.env`, (2) Firebase Console → Auth → Authorized domains, (3) Google Cloud Console → OAuth credentials → Authorized redirect URIs. Si une étape manque, l'auth casse complètement en prod.

---

## Guide pour l'audit iOS complet de la codebase

Ce qui suit est une checklist structurée à donner à Claude pour qu'il audite chaque fichier du projet.

---

### 1. Authentification Firebase

**Fichiers à auditer** : `src/contexts/AuthContext.jsx`, `src/pages/LoginView.jsx`

**Questions à poser** :
- [ ] `signInWithPopup` est-il utilisé directement dans un handler de clic synchrone ?
- [ ] Y a-t-il des `await` ou des opérations async AVANT l'appel `signInWithPopup` dans le handler ? (si oui → potentiellement bloqué sur iOS)
- [ ] `signInAnonymously` peut-il créer une race condition avec un résultat OAuth en cours ?
- [ ] Si `signInWithRedirect` est utilisé, `getRedirectResult` est-il appelé au bon moment (avant `signInAnonymously`) ?
- [ ] **Si `authDomain` est changé un jour** : les 3 étapes (env + Firebase Console + Google Cloud Console) ont-elles toutes été faites ?

**Config à vérifier** :
```
.env.local  → VITE_FIREBASE_AUTH_DOMAIN=tatmadeinnormandie.firebaseapp.com
.env.prod   → VITE_FIREBASE_AUTH_DOMAIN=tousatable-client.firebaseapp.com
```
Ces domaines doivent être enregistrés dans :
- Firebase Console → Authentication → Settings → Authorized domains
- Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Web client → Authorized redirect URIs (`https://[domain]/__/auth/handler`)

---

### 2. Scroll & Modaux

**Fichiers à auditer** : `src/index.css`, `src/app.jsx`, `src/pages/CheckoutView.jsx`

**Questions à poser** :
- [ ] `overflow: hidden` sur `body` est-il utilisé seul pour bloquer le scroll ? (ne fonctionne pas sur iOS Safari → doit être accompagné de `position: fixed`)
- [ ] Quand `position: fixed` est appliqué à `body` (scroll lock), `window.scrollY` est-il sauvegardé et restauré ?
- [ ] Y a-t-il des modaux qui utilisent `backdrop-filter: blur()` / `backdrop-blur-*` ? (rendu gris/incohérent sur Android Chrome et parfois iOS)
- [ ] Les modaux ont-ils un `max-height: 85dvh` ou `85vh` pour éviter d'être coupés par le bottom bar Safari ?
- [ ] Les éléments scrollables dans les modaux ont-ils `-webkit-overflow-scrolling: touch` ?

---

### 3. Formulaires & Inputs

**Fichiers à auditer** : tous les fichiers avec `<input>`, `<textarea>`, `<select>`

**Questions à poser** :
- [ ] Tous les inputs ont-ils une `font-size` ≥ 16px ? (en dessous → zoom automatique iOS Safari, très mauvaise UX)
- [ ] Les inputs de type `number` utilisent-ils `inputMode="numeric"` plutôt que `type="number"` pour les CP/téléphones ? (`type="number"` sur iOS affiche un pavé numérique mal adapté)
- [ ] `autoComplete="off"` est-il appliqué sur les champs avec autocomplétion custom pour éviter le conflit avec le gestionnaire natif iOS ?
- [ ] Y a-t-il des `onInput` en double avec `onChange` ? (peut créer des doubles appels sur certains claviers iOS)

---

### 4. Touch Events & Interactions

**Fichiers à auditer** : tous les composants avec handlers de clic/tap

**Questions à poser** :
- [ ] Y a-t-il des listeners `mousedown` / `mouseover` / `mouseenter` sans équivalent `touch` ? (pas de "hover" sur iOS)
- [ ] Les éléments cliquables ont-ils une taille minimum de 44×44px (recommandation Apple) ?
- [ ] Y a-t-il des `cursor: pointer` manquants sur des éléments interactifs ? (iOS requiert parfois `cursor: pointer` pour déclencher les tap events sur des `div`)
- [ ] Les dropdowns / menus utilisent-ils `onPointerDown` plutôt que `onClick` pour les sélections ? (`onClick` peut déclencher `blur` avant la sélection sur iOS)
- [ ] Des animations CSS utilisent-elles `transform` ou `will-change` sans `-webkit-` prefix ? (iOS Safari ≤ 15 en a besoin)

---

### 5. Position & Viewport avec Clavier Mobile

**Fichiers à auditer** : `src/pages/CheckoutView.jsx`, tout composant avec dropdown/autocomplete

**Questions à poser** :
- [ ] Les éléments en `position: fixed` recalculent-ils leur position quand le clavier ouvre/ferme ? (nécessite `window.visualViewport` listeners)
- [ ] Les dropdowns sur mobile utilisent-ils `bottom: 0` (bottom sheet) plutôt qu'une position calculée absolue ? (plus stable avec clavier)
- [ ] `window.visualViewport.offsetTop/Left` est-il utilisé pour compenser le décalage clavier sur desktop ?
- [ ] Y a-t-il `env(safe-area-inset-bottom)` dans les éléments ancrés en bas d'écran ? (home indicator iPhone X et +)

---

### 6. CSP (Content-Security-Policy)

**Fichier à auditer** : `firebase.json`

**Questions à poser** :
- [ ] Chaque API externe appelée par `fetch` est-elle dans `connect-src` ?
- [ ] Les domaines Firebase Auth (`firebaseapp.com`) sont-ils dans `connect-src` ET `frame-src` ?
- [ ] Les scripts tiers (Stripe, Google) sont-ils dans `script-src` ?
- [ ] **Procédure de test** : toujours tester sur le sandbox après deploy, pas seulement en local (Vite ne sert pas le CSP)

**Domaines actuellement autorisés** :
```
connect-src: googleapis.com, firebaseio.com, cloudfunctions.net, stripe.com,
             firebasestorage.googleapis.com, ip-api.com, firebaseapp.com,
             api-adresse.data.gouv.fr   ← ajouté suite au bug checkout
```

---

### 7. Framer Motion / Animations

**Fichiers à auditer** : tout fichier avec `motion.*` ou `AnimatePresence`

**Questions à poser** :
- [ ] Y a-t-il des `AnimatePresence` ou `motion.*` à l'intérieur d'un `createPortal` ? (conflit React réconciliation → dropdown invisible)
- [ ] Les animations utilisent-elles `transform` pour les performances ? (GPU-accelerated, OK sur iOS)
- [ ] Y a-t-il des animations qui utilisent `height: auto` avec Framer Motion ? (peut causer des glitches sur iOS Safari)

---

### 8. PWA / Standalone Mode

**Questions à poser** :
- [ ] L'app a-t-elle un `manifest.json` ? Si oui, les icônes sont-elles en format PNG (pas SVG) pour iOS ?
- [ ] Y a-t-il `<meta name="apple-mobile-web-app-capable" content="yes">` dans le `index.html` ?
- [ ] En mode standalone (ajouté à l'écran d'accueil iOS), la navigation fonctionne-t-elle sans rechargement de page ?
- [ ] `signInWithPopup` fonctionne-t-il en mode standalone iOS ? (souvent bloqué — nécessite `signInWithRedirect` spécifiquement dans ce contexte)

---

## Commande pour lancer l'audit

Pour demander l'audit complet à Claude :

```
Fais un audit iOS complet de la codebase en te basant sur auditIOS.md.
Pour chaque section, lis les fichiers concernés et réponds à chaque question
avec : ✅ OK / ⚠️ À vérifier / ❌ Problème identifié + explication.
Propose un plan de fix priorisé par impact utilisateur.
```

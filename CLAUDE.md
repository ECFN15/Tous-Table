# CLAUDE.md — Journal de bord technique

## 25 mars 2026 (Suite) — Refonte Premium Admin Analytics (Bento Grid & Sessions Groupées)

**Fichier** : `src/features/admin/AdminAnalytics.jsx`

**Objectif** : Transformer la liste infinie de sessions en une interface structurée, temporelle et visuellement premium (Bento Grid).

**Solution : Organisation Temporelle & UX Live**
1. **Groupement par Jour** : Les sessions ne sont plus listées en vrac mais regroupées par date (Aujourd'hui, Hier, etc.) via `useMemo`.
2. **Système d'Accordéons** : Chaque jour est une section repliable, avec le jour le plus récent ouvert par défaut, optimisant l'espace vertical.
3. **Module "Live Sessions"** : Bandeau dédié en haut de page pour les sessions actives (en temps réel), séparé de l'historique pour une visibilité immédiate des pics de trafic.
4. **Pagination (Performance UX)** : Limitation de la vue à 10 jours par page avec un système de navigation numérique, évitant le scroll infini et améliorant la réactivité sur mobile.
5. **Design "Celoci Inc"** : Alignement total sur le design système premium (`#161616`, `white/5`).
6. **Indicateurs de Statut** : Badges "En ligne" pulsants (émeraude) et "Terminé" discrets (stone) pour une lecture rapide de l'état des sessions.

**Résultat** : Un outil d'analyse puissant, organisé et esthétique, permettant de suivre le trafic en temps réel sans perdre de vue l'historique structuré.

---

## 25 mars 2026 (Suite) — Refonte Premium du Dashboard Admin (Style Celoci/Bento)

**Fichier** : `src/features/admin/AdminDashboard.jsx`

**Objectif** : Transformer un dashboard administratif classique en une interface "SaaS Premium" ultra-dense, visuelle et performante (Style Celoci Inc. / Bento Grid).

**Solution : Réarchitecture Graphique & Data-Visualization Custom**
1. **Architecture Bento Grid** : Grille asymétrique utilisant des cartes sombres (`#161616`), des bordures subtiles (`white/5`) et une typographie massive pour les KPIs (Hero Section).
2. **Visualisation de Données (Zéro Dépendance)** : Remplacement de Recharts par des composants SVG 100% natifs :
   - **`RevenueChart`** : Area chart avec gradient néon, hachures de fond et système de *scrubbing* (le tooltip suit le doigt/souris sur tout le graphe avec une précision chirurgicale).
   - **`StatusArc`** : Gauge circulaire SVG pour le ratio Commandes Payées / En attente, avec halo lumineux vert.
3. **Optimisation UX Administrative** :
   - Fusion des KPIs éparpillés en 3 blocs majeurs (CA, Commandes, Clients).
   - Remplacement du flux d'activité par un tableau "Top Products" ultra-compact et lisible.
4. **Maintenance & Danger Zone (High-Fidelity)** : 
   - Intégration d'un panneau de contrôle compact respectant le design "Danger" (bordures pointillées rouges `border-red-900/40` et lueur subtile).
   - Actions critiques protégées visuellement et isolées pour éviter les clics accidentels.

**Résultat** : Un dashboard qui allie esthétique "Apple-like" et exploitation de données fiable, sans aucune latence de rendu (SVG pré-calculé).

---

## 25 mars 2026 — Fix bug double session analytics (première visite)

**Fichier** : `src/components/shared/AnalyticsProvider.jsx`
**Audit complet** : `audit/audit_sessions.md`

**Problème** : Lorsqu'un utilisateur se connectait pour la première fois dans la journée, deux sessions étaient créées dans `analytics_sessions` : une session fantôme à **0s** et une session réelle qui trackait le parcours. Les visites suivantes ne créaient qu'une seule session.

**Cause racine** : Race condition dans le `useEffect` d'initialisation. Le `useEffect` dépendait de `[user, isAdmin]`. Au premier chargement :
1. `user = null` → Timer #1 démarrait (2s)
2. Firebase Auth résolvait → `user = anonymousUser` → Timer #2 démarrait
3. Si la Cloud Function n'avait pas encore répondu au Timer #1 quand le Timer #2 partait, `sessionIdRef.current` était encore `null` → les deux appels `initLiveSession()` partaient en parallèle → **2 sessions créées**

La session #1 restait à 0s car `sessionIdRef` était écrasé par la session #2, et le heartbeat ne mettait à jour que la session courante.

**Solution** :
1. `initCalledRef` : flag synchrone `useRef(false)` qui verrouille l'appel **immédiatement** (avant l'appel async), empêchant physiquement un 2ème appel concurrent
2. `if (!user) return` : ne crée jamais de session quand l'auth n'est pas encore résolue (élimine la session fantôme)
3. Timeout augmenté de 2s à 2.5s pour laisser Firebase Auth se stabiliser
4. Réouverture du flag en cas d'échec réseau ou de réponse négative

**Vérification comptage unique par IP** : Confirmé fonctionnel — `new Set(realTraffic.map(s => s.ip))` dans `AdminAnalytics.jsx` déduplique correctement. Même IP visitant N fois = 1 visiteur unique.

**Après** : 1 seule session par visite, KPIs corrects.

---

## 25 mars 2026 (Suite) — Optimisation Gestion IPs Admin & Skill Dashboard

**Fichiers** : `src/features/admin/AdminIPManager.jsx`, `.agent/skills/dashboard_premium/SKILL.md`

**Problème** : L'accumulation d'adresses IPv6 (Privacy Extensions) créait une liste infinie de cartes dans l'interface de gestion des IPs admin, rendant le panneau illisible.

**Solution : Regroupement par Administrateur & Design Premium**
1. **Logique de Grouping** : Les IPs sont désormais regroupées par email (`adminEmail`) via `useMemo`. Une seule carte par membre de l'équipe est affichée.
2. **KPI Central** : Affichage du nombre total d'IPs bloquées pour chaque admin comme métrique principale.
3. **Design "Celoci Inc"** : Application du nouveau Skill "Premium Dashboard" (fond `#161616`, bordures `white/5`, typographie massive et contrastée).
4. **Nouveau Skill** : Création d'une documentation d'expertise pour reproduire ce style (Bento grid, SVG custom, palettes sombres profondes).

**Résultat** : Interface épurée, suppression du scroll infini inutile, et UX alignée sur les standards SaaS premium.

---

## 25 mars 2026 — Refonte Graphique Analytics (SVG Custom & Scrubbing UX)

**Fichier** : `src/features/admin/AdminAnalytics.jsx`

**Problème** : La librairie Recharts (v3) imposait un rectangle blanc de sélection (cursor) impossible à masquer via CSS, dégradant l'UX sur desktop et rendant le graphique illisible sur petit écran. De plus, les barres étaient trop fines pour être touchées au doigt sur mobile.

**Cause racine** : Limitations structurelles des librairies de chart "off-the-shelf" pour des besoins de design ultra-spécifiques et premium.

**Solution : Migration vers un composant SVG 100% Custom (`TrafficChart`)**
1. **Zéro dépendance** : Contrôle total du rendu SVG (gradients, ombres, tracés). 
2. **Scrubbing Global (Style Apple Stocks)** : Au lieu de cliquer sur des barres minuscules, un overlay invisible capture les mouvements (Souris/Touch) sur tout le graphique. La barre la plus proche de l'index X est instantanément mise en valeur. 
3. **Tooltip Ancré** : Le tooltip ne suit plus le curseur (erratique sur mobile) mais s'ancre au-dessus de la barre active avec une flèche de direction et un effet glassmorphism (`backdrop-filter`).
4. **Responsive Adaptatif** :
   - Mobile (w < 500px) : Hauteur réduite (240px), moins de labels (max 5), barres épaissies (min 3px).
   - Desktop : Hauteur 320px, labels détaillés, effets de glow (filtre SVG GaussianBlur).
5. **Indicateurs de slots vides** : Points subtils sur la ligne de base pour indiquer les périodes sans trafic (meilleure lisibilité que le vide total).

**Résultat** : Une interface Analytics digne d'une app native, sans bug visuel, et 100% manipulable au doigt avec une précision chirurgicale (Scrubbing).

---

## 21 mars 2026 — Refonte de l'UX/UI du Menu Global et Header

**Fichiers** : `src/App.jsx`, `src/designs/architectural/components/ArchitecturalHeader.jsx`, `src/components/layout/GlobalMenu.jsx`

**Problème** : L'expérience du menu principal souffrait de superpositions avec les boutons du header. L'animation de fermeture n'existait pas pour le hamburger, et les marges mobiles du panneau latéral étaient insuffisantes.
**Solutions appliquées** :
1. **Épuration visuelle** : Suppression du mot "MENU" dans le header, retrait des fonds au survol (pastilles rouges) remplacés par une teinte subtile ambre sur le SVG.
2. **Resynchronisation du GlobalMenu** : Le header passe désormais derrière le GlobalMenu (`z-50` et `z-[110]`), imitant le comportement immersif du `CartSidebar` (`z-[2001]`).
3. **Animation Hamburger -> Croix** : Intégration d'une icône combinée (Menu morphant en X) placée au sein du `GlobalMenu`.
4. **Marges Mobile** : Augmentation du padding horizontal mobile (`px-4` -> `px-8`) et alignement horizontal de la croix (`-right-2`) avec les numéros du menu.

### Optimisation Couleurs et Dégradé "Golden Hour" (StackedCards)
**Fichiers** : `src/pages/HomeView.jsx`, `src/components/home/StackedCards.jsx`
**Action** : Refonte de la colorimétrie de la section "StackedCards". Les fonds des cartes passent d'un camaïeu fade à un dégradé très chaleureux et solaire (Crème Vanille, Miel Doré, Caramel, Terre Cuite). Ajout de l'héritage automatique de couleur au bouton "Découvrir la galerie" (`textColor`). Le grand dégradé d'arrière-plan a été revu (`#FFFFFF` -> `#D9956C`) pour créer une aura lumineuse enveloppante qui met particulièrement en valeur les images des meubles.
**Référence** : `_DOCS/AUDITS/audit_final_v35.md` (Section 7 — Pistes d'amélioration)
**Objectif** : Combler les lacunes identifiées dans l'audit sans casser les fonctionnalités existantes (anti-survente, iOS, auth Google, Stripe).
**Exclusion** : La partie emails (Gmail → service transactionnel) a été volontairement mise de côté.

---

### 1. Handler `payment_intent.canceled` (Priorité Haute)

**Fichier** : `functions/src/commerce/stripeWebhook.js`

**Problème** : Quand un utilisateur ouvre le checkout puis ferme son navigateur sans fermer la modale Stripe, le PaymentIntent expire après 24h côté Stripe. Sans handler pour cet événement, le stock restait bloqué indéfiniment (réservé mais jamais libéré).

**Solution** : Ajout d'un nouveau handler pour l'événement `payment_intent.canceled`, calqué sur le handler `payment_intent.payment_failed` existant. Quand Stripe signale l'expiration :
- Le handler vérifie que `stockReserved === true` et que la commande n'est pas déjà payée
- Il restaure le stock atomiquement (incrémente la quantité, remet `sold: false`, supprime `soldAt` et `buyerId`)
- Il passe le statut de la commande à `canceled`

**Avant** : Stock bloqué si le navigateur est fermé sans interaction avec la modale → le produit apparaît indéfiniment comme "vendu" alors qu'il ne l'est pas.
**Après** : Stripe envoie l'événement d'expiration → le stock est automatiquement restauré → le produit redevient disponible.

---

### 2. Protection du handler legacy `checkout.session.completed` (Priorité Haute)

**Fichier** : `functions/src/commerce/stripeWebhook.js`

**Problème** : L'ancien handler pour le mode Stripe Checkout (plus utilisé mais toujours actif) ne vérifiait pas le flag `stockReserved`. Si ce handler était déclenché pour une commande dont le stock était déjà réservé, il aurait décrémenté le stock une deuxième fois.

**Solution** : Ajout d'un garde `stockReserved` dans la transaction du handler legacy. Avant de décrémenter le stock, il vérifie si la commande existe déjà avec `stockReserved: true`. Si oui, le décrément est sauté.

**Avant** : Risque théorique de double-décrément du stock.
**Après** : Impossible de décrémenter deux fois, même si le handler legacy est invoqué.

---

### 3. Transaction unique pour `stripe_elements` (Priorité Moyenne)

**Fichier** : `functions/src/commerce/createOrder.js`

**Problème** : Le flow `stripe_elements` exécutait deux transactions Firestore séquentielles : une première pour valider le stock et calculer le prix, une seconde pour réserver le stock et créer la commande. La première était redondante car la seconde refaisait toutes les vérifications.

**Solution** : Fusion en une seule transaction atomique qui fait tout d'un coup : validation du stock, calcul du prix côté serveur (`currentPrice || startingPrice`), réservation du stock, et création de la commande. Le chemin `manual`/`deferred` garde ses deux transactions (il fonctionne différemment).

**Avant** : Deux transactions séquentielles → complexité inutile + fenêtre de temps entre les deux.
**Après** : Une seule transaction atomique → plus simple, plus rapide, zéro fenêtre de vulnérabilité.

**Bonus** : La commande stocke maintenant les noms et prix vérifiés côté serveur (depuis Firestore) au lieu des valeurs envoyées par le client.

---

### 4. Rate limiting atomique pour les enchères (Priorité Moyenne)

**Fichier** : `functions/src/auction/placeBid.js`

**Problème** : Le check de rate limiting (5 enchères/min) était fait en dehors de la transaction d'enchère. Deux requêtes simultanées pouvaient toutes les deux passer le check avant que l'une des deux n'incrémente le compteur.

**Solution** : Le check de rate limiting est maintenant à l'intérieur de la même transaction Firestore que l'enchère. Le document `sys_ratelimit/bid_{userId}` est lu via `transaction.get()`, vérifié, et mis à jour atomiquement dans la même transaction.

**Avant** : Sous charge, un utilisateur rapide pouvait envoyer 6-7 enchères dans la même minute.
**Après** : Strictement 5 enchères maximum par minute, garanti par la transaction atomique.

---

### 5. Batch paginé pour `clearAllSessions` (Priorité Basse)

**Fichier** : `functions/src/analytics/sessions.js`

**Problème** : La suppression de toutes les sessions utilisait un seul batch Firestore. Si plus de 500 sessions existaient, le batch échouait silencieusement (limite Firestore de 500 opérations par batch).

**Solution** : Boucle paginée qui requête 500 documents à la fois, les supprime en batch, puis continue jusqu'à ce qu'il n'y ait plus de sessions.

**Avant** : Avec 600+ sessions, le bouton "Vider tout" ne faisait rien.
**Après** : Fonctionne quel que soit le nombre de sessions.

---

### 6. Restriction CORS sur le beacon (Priorité Basse)

**Fichier** : `functions/src/analytics/sessions.js`

**Problème** : L'endpoint `syncSessionBeacon` (signal de fin de session) acceptait les requêtes de n'importe quel site (`Access-Control-Allow-Origin: *`). N'importe qui pouvait envoyer de fausses données analytics.

**Solution** : Remplacement par une allowlist de domaines autorisés :
- `https://tousatable-madeinnormandie.fr` (production)
- `https://tatmadeinnormandie.web.app` (sandbox)
- `https://tousatable-client.web.app` et `.firebaseapp.com` (Firebase hosting prod)
- `http://localhost:5173` et `:3000` (développement local)

**Avant** : Tout site pouvait envoyer des données dans les analytics.
**Après** : Seuls les domaines du projet sont autorisés.

---

### 7. Protection `newsletter_subscribers` (Priorité Moyenne)

**Fichier** : `firestore.rules`

**Problème** : La règle Firestore pour `newsletter_subscribers` était `allow create: if true` — n'importe qui, même sans authentification, pouvait créer des documents. Un bot pouvait flood la collection.

**Solution** :
- Authentification requise (`request.auth != null`) — les utilisateurs anonymes comptent, donc tous les vrais visiteurs peuvent s'inscrire
- Validation de schéma : seuls les champs `contactInfo`, `firstName`, `lastName`, `createdAt`, `source` sont autorisés
- Validation de type et de longueur sur les champs texte

**Avant** : Un script pouvait ajouter des milliers de faux abonnés.
**Après** : Authentification obligatoire + validation stricte du format des données.

---

### 8. Système de notifications Toast (Priorité Moyenne)

**Fichiers** :
- `src/components/ui/Toast.jsx` (nouveau)
- `src/app.jsx` (modifié)
- `src/pages/CheckoutView.jsx` (modifié)

**Problème** : Les erreurs utilisateur étaient affichées via `alert()` natif du navigateur — popup bloquante au design incohérent avec le site premium.

**Solution** : Création d'un système de notification maison utilisant Framer Motion (déjà présent dans le projet, aucune dépendance ajoutée) :
- 4 types visuels : erreur (rouge), succès (vert), avertissement (ambre), info (gris)
- Apparition animée depuis le haut, disparition automatique après 5 secondes
- Clic pour fermer manuellement
- `z-index: 100000` pour rester au-dessus de tout (y compris la modale Stripe à 99999)
- `ToastProvider` wrappant l'application, `useToast()` hook pour déclencher depuis n'importe quel composant

**Remplacement des alert()** :
- `CheckoutView.jsx` : 2 alertes remplacées (article indisponible + erreur de commande)
- `app.jsx` : 2 alertes remplacées (erreur ajout panier + erreur connexion)

**Avant** : Popup navigateur moche et bloquante.
**Après** : Notification élégante, non-bloquante, intégrée au design.

---

### 9. Suppression de puppeteer (Priorité Moyenne)

**Fichier** : `package.json` (racine)

**Problème** : `puppeteer` (v24.38.0, 300Mo+) était dans les dépendances client. Après vérification, il n'est importé nulle part dans le code source de l'application (uniquement dans un script de test standalone `scripts/test-puppeteer.cjs`).

**Solution** : Suppression de la dépendance. Le script de test peut être exécuté indépendamment si besoin.

**Avant** : 300Mo+ de téléchargement inutile à chaque `npm install`.
**Après** : Installation plus rapide, bundle plus léger.

---

### 10. Accessibilité formulaire checkout (Priorité Basse)

**Fichier** : `src/pages/CheckoutView.jsx`

**Problème** : Les 6 champs du formulaire de commande n'avaient que des placeholders, sans `<label>` HTML. Les lecteurs d'écran (utilisés par les malvoyants) ne pouvaient pas identifier les champs.

**Solution** :
- Ajout de `<label htmlFor="..." className="sr-only">` sur les 6 inputs (nom, téléphone, email, adresse, code postal, ville)
- Chaque input a reçu un `id` correspondant au `htmlFor`
- Ajout de `aria-label="Retour au panier"` sur le bouton retour

**Avant** : Champs invisibles pour les technologies d'assistance.
**Après** : Chaque champ est correctement identifié, conformité WCAG basique.

---

### 11. Fix bug TextType (animation titre galerie)

**Fichier** : `src/components/ui/TextType.jsx`

**Problème** : L'ajout du `ToastProvider` dans l'arbre de composants a exposé un bug latent : le `useMemo` du tableau de textes comparait la référence JavaScript au lieu du contenu. Comme le composant parent recréait un nouveau tableau à chaque render, le memo ne protégeait rien → l'effect principal se relançait en boucle → le timer du premier caractère était annulé avant de s'exécuter → le texte restait vide avec seulement le curseur `_` visible.

**Solution** : `useMemo(() => ..., [text])` remplacé par `useMemo(() => ..., [JSON.stringify(text)])`. Le memo compare maintenant le contenu textuel, pas la référence objet.

**Avant** : Le titre animé ("Tous à Table", "Savoir-Faire", "Made in Normandie"...) n'affichait que le curseur `_`.
**Après** : L'animation machine à écrire fonctionne normalement.

---

## 19 mars 2026 — Améliorations Analytics (hors audit)

**Objectif** : Corrections demandées par l'utilisateur sur le dashboard analytics admin après test visuel.

---

### 12. Statut "EN LIGNE" ne se mettait pas à jour en temps réel

**Fichier** : `src/features/admin/AdminAnalytics.jsx`

**Problème** : Le timestamp `now` utilisé pour calculer si une session est active ne se rafraîchissait que toutes les 30 secondes, et le seuil d'inactivité était à 60 secondes. Résultat : une session pouvait rester affichée "EN LIGNE" jusqu'à 90 secondes après le départ réel de l'utilisateur.

**Solution** :
- Intervalle de rafraîchissement : 30s → 10s
- Seuil d'inactivité : 60s → 30s
- Délai maximum avant mise à jour : 90s → 40s

**Avant** : "EN LIGNE" pendant 1min30 après le départ.
**Après** : Transition vers "SESSION TERMINÉE" en ~40 secondes max.

---

### 13. Comptage des visiteurs uniques par IP

**Fichier** : `src/features/admin/AdminAnalytics.jsx`

**Problème** : Le KPI "Visites Uniques" comptait le nombre de sessions (`realTraffic.length`), pas le nombre d'utilisateurs distincts. Un même utilisateur qui visitait le site 5 fois depuis la même IP était compté 5 fois.

**Solution** : Déduplication par adresse IP via `new Set(realTraffic.map(s => s.ip))`. Le compteur affiche maintenant le nombre d'IPs uniques.

**Avant** : 5 sessions = 5 "visites uniques" même si c'est la même personne.
**Après** : 5 sessions depuis la même IP = 1 visite unique.

---

### 14. Badges produit et email invisibles sur mobile

**Fichier** : `src/features/admin/AdminAnalytics.jsx`

**Problème** : Dans le parcours utilisateur version mobile (bouton "TRACER"), les badges violet indiquant le produit consulté (référence, nom, prix) n'étaient pas affichés — ils existaient uniquement dans la version desktop. De plus, l'email du client était tronqué et compressé sur la même ligne que l'IP, le rendant illisible sur petit écran.

**Solution** :
- Ajout des badges produit dans le parcours mobile (même format que desktop, adapté en taille)
- Email séparé sur sa propre ligne sous l'IP au lieu d'être compressé à côté

**Avant** : Sur mobile, pas de détail produit dans le parcours, email illisible.
**Après** : Toutes les informations visibles sur mobile et desktop.

---

## 21 mars 2026 — Optimisation performances GlobalMenu (animations 120fps+)

**Fichier** : `src/components/layout/GlobalMenu.jsx`
**Objectif** : Éliminer la sensation de 40fps sur le menu hamburger (mobile Android/iOS et desktop) sans casser les animations existantes.

---

### Diagnostic — Causes racines identifiées

1. **Framer Motion sur le main thread** : Toutes les animations ouverture/fermeture (backdrop, items, footer) tournaient via le RAF JavaScript de Framer Motion, plafonné à 60fps. Sur les écrans 120Hz/144Hz ProMotion, l'animation restait à 60fps.

2. **Aucune pré-promotion GPU sur le panel** : Le panneau principal n'avait ni `will-change: transform` ni `translate3d`. Au premier frame d'animation, le browser devait rasteriser + uploader la texture en VRAM → jank visible à l'ouverture.

3. **React.memo neutralisé** : `MenuItemHover` est `React.memo`'d mais recevait une nouvelle référence `handlePremiumClick` à chaque render (recréée dans le `.map()`). Le memo ne filtrait donc rien → tous les `motion.span` (20-30 par item sur desktop) re-renderaient à chaque ouverture/fermeture.

4. **`menuItems` recréé à chaque render** : L'array n'était pas mémoïsé, causant une cascade de re-renders inutiles.

5. **`AnimatePresence` importé mais jamais utilisé** : Import mort.

---

### Solution — Migration vers CSS Compositor Thread

**Architecture adoptée** : Toutes les animations ouverture/fermeture/clic migrent vers des **CSS transitions** (compositor thread = refresh rate natif de l'écran). Framer Motion est conservé **uniquement** pour le hover par lettres desktop (`motion.span` + `useAnimation`) qui ne peut pas être remplacé par CSS.

#### Changements techniques

| Élément | Avant | Après |
|---|---|---|
| Backdrop opacity | `motion.div` animate (JS RAF) | `div` + `transition: opacity 500ms` (GPU) |
| Items stagger entrée | Springs Framer Motion × 4 (JS) | CSS transitions avec `delay` calculé (GPU) |
| Items stagger sortie | Springs Framer Motion × 4 (JS) | CSS transitions stagger inversé (GPU) |
| Click feedback | Spring Framer Motion (JS) | CSS transition 300ms (GPU) |
| Footer | `motion.div` spring (JS) | CSS transition avec delay 300ms (GPU) |
| Tap feedback | `whileTap` (JS RAF) | CSS `:active` pseudo-class (GPU) |
| Panel slide | CSS transition (GPU) ✓ | CSS transition (GPU) ✓ inchangé |
| Hover lettres | `motion.span` (JS) | `motion.span` (JS) ✓ conservé |

#### Optimisations React

- `menuItems` mémoïsé via `useMemo` → stable tant que auth/design ne change pas
- `premiumClickHandlers` mémoïsé via `useMemo` → références stables → `React.memo` de `MenuItemHover` filtre effectivement
- `AnimatePresence` supprimé (import mort)
- `transitionsReady` state → empêche l'animation de fermeture au premier rendu (panel déjà fermé)

#### Courbes d'easing (approximation des springs)

```js
// Open spring (stiffness:250, damping:35, mass:0.8) → ζ≈1.24 overdamped
const EASE_OPEN = 'cubic-bezier(0.23,1,0.32,1)';
// Close spring (stiffness:450, damping:30, mass:0.7) → ζ≈0.85 underdamped (~4% overshoot)
const EASE_CLOSE = 'cubic-bezier(0.12,0.8,0.3,1)';
```

#### GPU pre-promotion panel

```js
style={{
    transform: isMenuOpen ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
}}
```

**Résultat** : Le menu tourne au refresh rate natif de l'écran (60Hz → 60fps, 120Hz → 120fps, 144Hz → 144fps). Les animations desktop (hover par lettres) restent identiques visuellement. Le comportement mobile est inchangé.

---

## 21 mars 2026 — Merge PR #2 : Fix mobile safe-area insets (Jules / Google Jules Bot)

**Référence** : PR #2 `fix-mobile-safe-area-insets` par ECFN15 (via Google Jules Bot)
**Objectif** : Fiabiliser le rendu sur les appareils à encoche (iPhone X+, Dynamic Island) en remplaçant les classes Tailwind arbitraires contenant `env()` par des inline styles CSS.

---

### Contexte — Pourquoi ce changement

Tailwind JIT ne parse pas toujours correctement `env(safe-area-inset-*)` dans les valeurs arbitraires (`pt-[max(4.5rem,env(safe-area-inset-top)+2rem)]`). Le CSS généré peut être invalide selon la version de PostCSS, ce qui fait que le padding safe-area est ignoré → le contenu passe sous l'encoche sur iPhone.

La solution : déplacer ces valeurs dans des `style={{}}` inline pour que le CSS arrive tel quel au navigateur, sans transformation PostCSS/Tailwind.

---

### Corrections appliquées par Jules (commits 1-3)

**1. App.jsx — Barre de navigation**
- `pt-[max(4.5rem,env(safe-area-inset-top)+2rem)]` → `style={{ paddingTop: 'max(4.5rem, calc(env(safe-area-inset-top, 0px) + 2rem))' }}`

**2. NewsletterModal.jsx — Modale newsletter**
- Ajout de `style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}` pour dégager la barre Home des iPhones

**3. CartSidebar.jsx — Panneau panier**
- Safe-area en inline style + restauration du pattern GPU performant (translate3d, willChange, backfaceVisibility)
- `md:p-8` → `md:px-8 md:pb-8` pour éviter le conflit de spécificité inline vs Tailwind

**4. ArchitecturalHeader.jsx — Header design architectural**
- `pt-[max(0rem,env(safe-area-inset-top))]` → `style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}`

**5. package.json — Dépendance react-is**
- Ajout de `react-is: ^18.3.1` (peer dependency de recharts, explicitement déclarée)

---

### Corrections appliquées lors du merge (review Claude)

**6. HomeView.jsx — Header page d'accueil**
- Jules avait utilisé `calc()` au lieu de `max()` : `calc(env(safe-area-inset-top, 0px) + 2rem)` donnait trop de padding sur iPhone (notch + 2rem au lieu de max des deux)
- Corrigé en : `max(2rem, env(safe-area-inset-top, 0px))` pour paddingTop, paddingRight, paddingLeft

**7. GlobalMenu.jsx — Conflit résolu**
- Jules avait remplacé le pattern GPU (translate3d, willChange, backfaceVisibility) par des classes Tailwind (transition-transform, translate-x-0/full) → régression performance
- Conflit résolu en gardant la version performante existante (inline translate3d + will-change)

---

### Erreurs de Jules corrigées pendant la review

| Erreur | Fichier | Correction |
|--------|---------|------------|
| `calc()` au lieu de `max()` — trop de padding sur notch | App.jsx, CartSidebar, HomeView | Remplacé par `max(valeur, calc(env(...) + offset))` |
| `md:p-8` conflicte avec inline `paddingTop` | CartSidebar | Éclaté en `md:px-8 md:pb-8` |
| `react-is: ^19.2.4` avec React 18 | package.json | Corrigé en `^18.3.1` |
| Pattern GPU supprimé (translate3d → Tailwind) | CartSidebar, GlobalMenu | Restauré le pattern inline performant |

---

### Impact utilisateur

- **iPhone à encoche / Dynamic Island** : le contenu ne passe plus sous l'encoche (nav, panier, newsletter, header accueil)
- **iPhone barre Home** : le bas de la modale newsletter n'est plus masqué
- **Android / Desktop** : aucun changement visible (`env()` retourne `0px`)
- **Performance** : aucune régression — les patterns GPU sont préservés

---

## Fichiers modifiés — Récapitulatif complet (19 mars 2026)

| Fichier | Type | Modifications |
|---------|------|---------------|
| `functions/src/commerce/stripeWebhook.js` | Backend | Handler `canceled` + guard `stockReserved` sur legacy |
| `functions/src/commerce/createOrder.js` | Backend | Transaction unique pour `stripe_elements` |
| `functions/src/auction/placeBid.js` | Backend | Rate limiting atomique |
| `functions/src/analytics/sessions.js` | Backend | Batch paginé + CORS restreint |
| `firestore.rules` | Sécurité | Protection newsletter_subscribers |
| `package.json` | Config | Suppression puppeteer |
| `src/components/ui/Toast.jsx` | Frontend | Nouveau composant notification |
| `src/app.jsx` | Frontend | ToastProvider + remplacement alert() |
| `src/pages/CheckoutView.jsx` | Frontend | Toast + accessibilité labels |
| `src/components/ui/TextType.jsx` | Frontend | Fix useMemo (bug animation) |
| `src/features/admin/AdminAnalytics.jsx` | Frontend | Sessions temps réel + uniques IP + mobile |

---

## 21 mars 2026 — Correction de l'authentification PWA sur Android

**Objectif** : Rétablir la connexion Google pour les utilisateurs ayant installé l'application sur Android.

---

### 15. Fix : Conflit de méthode d'authentification (Redirect vs Popup)

**Fichier** : `src/contexts/AuthContext.jsx`

**Problème** : L'application installée (PWA) sur Android ne parvenait pas à connecter l'utilisateur via Google. La méthode de redirection était forcée par erreur sur tous les appareils en mode standalone.

**Solution** : 
- Raffinement de la détection iOS Standalone.
- Limitation de `signInWithRedirect` aux seuls appareils iOS (où elle est indispensable).
- Restauration de `signInWithPopup` pour Android standalone, garantissant que la session reste dans l'application.

**Résultat** : Connexion fonctionnelle sur S24 Ultra et Xiaomi en mode application. Accès immédiat aux onglets Commande et Admin.

---

### 16. Optimisation Layout : Marge supérieure dynamique (Mobile)

**Fichiers** : `src/components/layout/GlobalMenu.jsx`, `src/components/cart/CartSidebar.jsx`

**Problème** : Grosse perte d'espace au sommet de l'écran (`~4.5rem` minimum de padding imposé) sur les appareils Android dans le menu et le panier, suite à l'introduction des fixes iOS safe-area.
 
### 14. Badges produit et email invisibles sur mobile

**Fichier** : `src/features/admin/AdminAnalytics.jsx`

**Problème** : Dans le parcours utilisateur version mobile (bouton "TRACER"), les badges violet indiquant le produit consulté (référence, nom, prix) n'étaient pas affichés — ils existaient uniquement dans la version desktop. De plus, l'email du client était tronqué et compressé sur la même ligne que l'IP, le rendant illisible sur petit écran.

**Solution** :
- Ajout des badges produit dans le parcours mobile (même format que desktop, adapté en taille)
- Email séparé sur sa propre ligne sous l'IP au lieu d'être compressé à côté

**Avant** : Sur mobile, pas de détail produit dans le parcours, email illisible.
**Après** : Toutes les informations visibles sur mobile et desktop.

---

## 21 mars 2026 — Optimisation performances GlobalMenu (animations 120fps+)

**Fichier** : `src/components/layout/GlobalMenu.jsx`
**Objectif** : Éliminer la sensation de 40fps sur le menu hamburger (mobile Android/iOS et desktop) sans casser les animations existantes.

---

### Diagnostic — Causes racines identifiées

1. **Framer Motion sur le main thread** : Toutes les animations ouverture/fermeture (backdrop, items, footer) tournaient via le RAF JavaScript de Framer Motion, plafonné à 60fps. Sur les écrans 120Hz/144Hz ProMotion, l'animation restait à 60fps.

2. **Aucune pré-promotion GPU sur le panel** : Le panneau principal n'avait ni `will-change: transform` ni `translate3d`. Au premier frame d'animation, le browser devait rasteriser + uploader la texture en VRAM → jank visible à l'ouverture.

3. **React.memo neutralisé** : `MenuItemHover` est `React.memo`'d mais recevait une nouvelle référence `handlePremiumClick` à chaque render (recréée dans le `.map()`). Le memo ne filtrait donc rien → tous les `motion.span` (20-30 par item sur desktop) re-rendraient à chaque ouverture/fermeture.

4. **`menuItems` recréé à chaque render** : L'array n'était pas mémoïsé, causant une cascade de re-renders inutiles.

5. **`AnimatePresence` importé mais jamais utilisé** : Import mort.

---

### Solution — Migration vers CSS Compositor Thread

**Architecture adoptée** : Toutes les animations ouverture/fermeture/clic migrent vers des **CSS transitions** (compositor thread = refresh rate natif de l'écran). Framer Motion est conservé **uniquement** pour le hover par lettres desktop (`motion.span` + `useAnimation`) qui ne peut pas être remplacé par CSS.

#### Changements techniques

| Élément | Avant | Après |
|---|---|---|
| Backdrop opacity | `motion.div` animate (JS RAF) | `div` + `transition: opacity 500ms` (GPU) |
| Items stagger entrée | Springs Framer Motion × 4 (JS) | CSS transitions avec `delay` calculé (GPU) |
| Items stagger sortie | Springs Framer Motion × 4 (JS) | CSS transitions stagger inversé (GPU) |
| Click feedback | Spring Framer Motion (JS) | CSS transition 300ms (GPU) |
| Footer | `motion.div` spring (JS) | CSS transition avec delay 300ms (GPU) |
| Tap feedback | `whileTap` (JS RAF) | CSS `:active` pseudo-class (GPU) |
| Panel slide | CSS transition (GPU) ✓ | CSS transition (GPU) ✓ inchangé |
| Hover lettres | `motion.span` (JS) | `motion.span` (JS) ✓ conservé |

#### Optimisations React

- `menuItems` mémoïsé via `useMemo` → stable tant que auth/design ne change pas
- `premiumClickHandlers` mémoïsé via `useMemo` → références stables → `React.memo` de `MenuItemHover` filtre effectivement
- `AnimatePresence` supprimé (import mort)
- `transitionsReady` state → empêche l'animation de fermeture au premier rendu (panel déjà fermé)

#### Courbes d'easing (approximation des springs)

```js
// Open spring (stiffness:250, damping:35, mass:0.8) → ζ≈1.24 overdamped
const EASE_OPEN = 'cubic-bezier(0.23,1,0.32,1)';
// Close spring (stiffness:450, damping:30, mass:0.7) → ζ≈0.85 underdamped (~4% overshoot)
const EASE_CLOSE = 'cubic-bezier(0.12,0.8,0.3,1)';
```

#### GPU pre-promotion panel

```js
style={{
    transform: isMenuOpen ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
}}
```

**Résultat** : Le menu tourne au refresh rate natif de l'écran (60Hz → 60fps, 120Hz → 120fps, 144Hz → 144fps). Les animations desktop (hover par lettres) restent identiques visuellement. Le comportement mobile est inchangé.

---

## 21 mars 2026 — Merge PR #2 : Fix mobile safe-area insets (Jules / Google Jules Bot)

**Référence** : PR #2 `fix-mobile-safe-area-insets` par ECFN15 (via Google Jules Bot)
**Objectif** : Fiabiliser le rendu sur les appareils à encoche (iPhone X+, Dynamic Island) en remplaçant les classes Tailwind arbitraires contenant `env()` par des inline styles CSS.

---

### Contexte — Pourquoi ce changement

Tailwind JIT ne parse pas toujours correctement `env(safe-area-inset-*)` dans les valeurs arbitraires (`pt-[max(4.5rem,env(safe-area-inset-top)+2rem)]`). Le CSS généré peut être invalide selon la version de PostCSS, ce qui fait que le padding safe-area est ignoré → le contenu passe sous l'encoche sur iPhone.

La solution : déplacer ces valeurs dans des `style={{}}` inline pour que le CSS arrive tel quel au navigateur, sans transformation PostCSS/Tailwind.

---

### Corrections appliquées par Jules (commits 1-3)

**1. App.jsx — Barre de navigation**
- `pt-[max(4.5rem,env(safe-area-inset-top)+2rem)]` → `style={{ paddingTop: 'max(4.5rem, calc(env(safe-area-inset-top, 0px) + 2rem))' }}`

**2. NewsletterModal.jsx — Modale newsletter**
- Ajout de `style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}` pour dégager la barre Home des iPhones

**3. CartSidebar.jsx — Panneau panier**
- Safe-area en inline style + restauration du pattern GPU performant (translate3d, willChange, backfaceVisibility)
- `md:p-8` → `md:px-8 md:pb-8` pour éviter le conflit de spécificité inline vs Tailwind

**4. ArchitecturalHeader.jsx — Header design architectural**
- `pt-[max(0rem,env(safe-area-inset-top))]` → `style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}`

**5. package.json — Dépendance react-is**
- Ajout de `react-is: ^18.3.1` (peer dependency de recharts, explicitement déclarée)

---

### Corrections appliquées lors du merge (review Claude)

**6. HomeView.jsx — Header page d'accueil**
- Jules avait utilisé `calc()` au lieu de `max()` : `calc(env(safe-area-inset-top, 0px) + 2rem)` donnait trop de padding sur iPhone (notch + 2rem au lieu de max des deux)
- Corrigé en : `max(2rem, env(safe-area-inset-top, 0px))` pour paddingTop, paddingRight, paddingLeft

**7. GlobalMenu.jsx — Conflit résolu**
- Jules avait remplacé le pattern GPU (translate3d, willChange, backfaceVisibility) par des classes Tailwind (transition-transform, translate-x-0/full) → régression performance
- Conflit résolu en gardant la version performante existante (inline translate3d + will-change)

---

### Erreurs de Jules corrigées pendant la review

| Erreur | Fichier | Correction |
|--------|---------|------------|
| `calc()` au lieu de `max()` — trop de padding sur notch | App.jsx, CartSidebar, HomeView | Remplacé par `max(valeur, calc(env(...) + offset))` |
| `md:p-8` conflicte avec inline `paddingTop` | CartSidebar | Éclaté en `md:px-8 md:pb-8` |
| `react-is: ^19.2.4` avec React 18 | package.json | Corrigé en `^18.3.1` |
| Pattern GPU supprimé (translate3d → Tailwind) | CartSidebar, GlobalMenu | Restauré le pattern inline performant |

---

### Impact utilisateur

- **iPhone à encoche / Dynamic Island** : le contenu ne passe plus sous l'encoche (nav, panier, newsletter, header accueil)
- **iPhone barre Home** : le bas de la modale newsletter n'est plus masqué
- **Android / Desktop** : aucun changement visible (`env()` retourne `0px`)
- **Performance** : aucune régression — les patterns GPU sont préservés

---

## Fichiers modifiés — Récapitulatif complet (19 mars 2026)

| Fichier | Type | Modifications |
|---------|------|---------------|
| `functions/src/commerce/stripeWebhook.js` | Backend | Handler `canceled` + guard `stockReserved` sur legacy |
| `functions/src/commerce/createOrder.js` | Backend | Transaction unique pour `stripe_elements` |
| `functions/src/auction/placeBid.js` | Backend | Rate limiting atomique |
| `functions/src/analytics/sessions.js` | Backend | Batch paginé + CORS restreint |
| `firestore.rules` | Sécurité | Protection newsletter_subscribers |
| `package.json` | Config | Suppression puppeteer |
| `src/components/ui/Toast.jsx` | Frontend | Nouveau composant notification |
| `src/app.jsx` | Frontend | ToastProvider + remplacement alert() |
| `src/pages/CheckoutView.jsx` | Frontend | Toast + accessibilité labels |
| `src/components/ui/TextType.jsx` | Frontend | Fix useMemo (bug animation) |
| `src/features/admin/AdminAnalytics.jsx` | Frontend | Sessions temps réel + uniques IP + mobile |

---

## 21 mars 2026 — Correction de l'authentification PWA sur Android

**Objectif** : Rétablir la connexion Google pour les utilisateurs ayant installé l'application sur Android.

---

### 15. Fix : Conflit de méthode d'authentification (Redirect vs Popup)

**Fichier** : `src/contexts/AuthContext.jsx`

**Problème** : L'application installée (PWA) sur Android ne parvenait pas à connecter l'utilisateur via Google. La méthode de redirection était forcée par erreur sur tous les appareils en mode standalone.

**Solution** : 
- Raffinement de la détection iOS Standalone.
- Limitation de `signInWithRedirect` aux seuls appareils iOS (où elle est indispensable).
- Restauration de `signInWithPopup` pour Android standalone, garantissant que la session reste dans l'application.

**Résultat** : Connexion fonctionnelle sur S24 Ultra et Xiaomi en mode application. Accès immédiat aux onglets Commande et Admin.

---

### 16. Optimisation Layout : Marge supérieure dynamique (Mobile)

**Fichiers** : `src/components/layout/GlobalMenu.jsx`, `src/components/cart/CartSidebar.jsx`

**Problème** : Grosse perte d'espace au sommet de l'écran (`~4.5rem` minimum de padding imposé) sur les appareils Android dans le menu et le panier, suite à l'introduction des fixes iOS safe-area.
 
**Solution** : 
- Remplacement du padding minimum arbitraire de Tailwind par : `pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)+0.5rem))]`
- Permet un padding serré (`1.5rem/24px`) quand il n'y a pas d'encoche/Dynamic Island (ex: majorité d'Android).
- Absorbe dynamiquement la taille du Dynamic Island (`~59px + 8px = 67px`) pour préserver un safe-area pertinent sur iPhone.

**Résultat** : Récupération optimale de la taille de l'écran UI mobile, tout en restant compatible iOS.

---

## 21 mars 2026 (Suite) — Optimisation extrême 144Hz+ Desktop Menu

**Fichier** : `src/components/layout/GlobalMenu.jsx`
**Objectif** : Atteindre une fluidité parfaite sur écrans PC à haut taux de rafraichissement (144Hz/160Hz+) SANS retirer les effets premium (flou, animation par lettres).

### Diagnostic et Blocages
Malgré la migration vers le compositor thread, l'effet de flou (`filter: blur(8px)`) appliqué sur 80+ lettres (chacune ayant un `will-change: transform` statique) combiné au `backdrop-blur-md` générait un *overdraw* (surcharge GPU). La carte graphique devait rasteriser trop de calques simultanément.

### Solution (Rendu GPU avancé)
1. **Préchauffage du Shader** : Remplacement de `blur(0px)` par `blur(0.01px)`. Évite le temps d'initialisation du pipeline shader au début de l'animation.
2. **Allocation VRAM Dynamique** : Suppression de `style={{ willChange: 'transform' }}` sur les lettres `motion.span` au repos. Framer Motion l'ajoute dynamiquement au `:hover`. Ainsi, au lieu d'avoir 80 calques GPU permanents alloués, le navigateur groupe les lettres en un seul calque jusqu'au survol (libération massive de VRAM).
3. **Accélération du Backdrop** : Ajout de `transform: 'translateZ(0)'` sur le fond noir flouté pour forcer son propre calque GPU minimaliste.
4. **CSS Containment** : Ajout de `contain: 'content'` sur le panneau coulissant pour isoler le layout et la peinture, empêchant le navigateur de recalculer le reste de la page pendant le slide.

**Résultat** : La fluidité à 144Hz/160Hz est parfaitement atteinte, avec **100% des animations visuelles conservées** (rien n'a été dégradé visuellement).

---

## 21 mars 2026 (Suite) — Alignement parfait Header Desktop (Menu & Panier)

**Fichiers** : `src/components/layout/GlobalMenu.jsx`, `src/components/cart/CartSidebar.jsx`
**Objectif** : Aligner verticalement le bouton de fermeture "X" des panneaux latéraux (`GlobalMenu` et `CartSidebar`) de manière parfaitement symétrique avec le bouton "MENU" du header principal sur la version Desktop.

### Problème
Sur desktop, le header principal (`ArchitecturalHeader`) a une hauteur de `96px` (`md:h-24`), plaçant l'axe central de ses boutons à **48px** du haut. Les panneaux latéraux avaient un padding supérieur de `md:pt-16` (64px) ou `md:pt-12` (48px). Avec un conteneur d'en-tête de panneau de `48px` (`h-12`), le bouton "X" se retrouvait respectivement centré à **88px** ou **72px** du haut de l'écran. 

### Solution
- Remplacement du padding desktop par `md:pt-6` (24px) sur les deux panneaux (`GlobalMenu` et `CartSidebar`).
- Le axe du conteneur d'en-tête (`24px` de padding + `24px` représentant la moitié du conteneur haut) est maintenant exactement à **48px** du haut de l'écran.
- Le réglage mobile complexe (`pt-[max(...)]`) a été scrupuleusement préservé intact pour ne pas briser les espacements liés à l'encoche iOS (Dynamic Island).

**Résultat** : Une symétrie absolue de l'interface sur Desktop lors de l'ouverture du Menu ou du Panier.

---

## 29 mars 2026 — Optimisation Responsive "Atelier" (S24 Ultra & Desktop)

**Fichiers** : `src/pages/ShopView.jsx`, `src/components/shop/WorkshopHero.jsx`

**Objectif** : Résoudre les problèmes de chevauchement et d'espacement excessif sur mobile (Galaxy S24 Ultra) tout en préservant le design asymétrique desktop.

**Solution : Flux Naturel vs Positionnement Absolu**
1. **Refonte du Flux (Mobile-First)** : Abandon du `absolute` sur mobile pour la grille d'images. Passage à un `flex-col` ordonné (`order-1` : Rituel, `order-2` : Images, `order-3` : Soin du Bois) pour un empilement logique sans collision.
2. **Fix "Galaxy S24 Ultra" (Tall Screen)** : Remplacement de `justify-between` par `justify-start` dans le conteneur `min-h-[100dvh]`. Évite l'étirement élastique qui créait d'énormes vides au-dessus/en-dessous de la grille sur les écrans très longs.
3. **Micro-ajustement Header** : Calage de la marge supérieure à `pt-3` (12px) sur mobile pour une respiration premium sous le header sans décrochage visuel.
4. **Typographie Hybride (Soin du Bois)** : 
   - Mobile : Texte sur une seule ligne (`Le Soin du Bois.`) pour un look éditorial épuré.
   - Desktop : Retour au design original sur deux lignes.
   - Technique : Utilisation de `<br className="hidden md:block" />` pour éviter les doublons de nœuds DOM que les animations GSAP (`hero-reveal`) affichaient par erreur en double.

**Résultat** : Un Hero "Atelier" robuste, stable sur tous les ratios d'écran, et une lisibilité accrue de la description (réduite en `text-sm` sur mobile).

---

## 30 mars 2026 — Architecture Firestore Multi-Environnement dynamique (`{appId}`)

**Fichier** : `firestore.rules`

**Objectif** : Remplacer le chemin de base de données écrit "en dur" (`tat-made-in-normandie`) par une variable dynamique (`{appId}`) pour supporter nativement le fonctionnement Multi-Environnement sans duplication de règles.

**Solution : Règle "Write Once, Deploy Anywhere"**
1. **Passage au Paramètre `{appId}`** : Le chemin d'accès `match /artifacts/tat-made-in-normandie/...` est devenu `match /artifacts/{appId}/...`. Firestore ne bloque plus sur le nom précis du projet parent.
2. **Isolation des Environnements** : La Sandbox (`https://tatmadeinnormandie.web.app/`) et la Production (`https://tousatable-madeinnormandie.fr/`) peuvent désormais utiliser des bases de données complètement cloisonnées tout en partageant 100% de la même couverture de sécurité fonctionnelle.
3. **Prévention des Bugs de Déploiement** : Fin du risque de déployer des règles qui verrouilleraient la base de prod parce que le nom de la sandbox y était écrit en dur. L'infrastructure est maintenant *"Future-Proof"*.

**Documentation Associée** : Un fichier complet a été créé (`architecture_firestore_rules.md`) pour archiver précisément le "Avant/Après" technique et les avantages du principe *Don't Repeat Yourself* (DRY) appliqué à Firestore.

---

## 31 mars 2026 — Tracking Analytics "Le Comptoir" dans le Parcours Utilisateur

**Fichiers** : `src/components/shop/ShopProductCard.jsx`, `src/components/shared/AnalyticsProvider.jsx`, `src/features/admin/AdminAnalytics.jsx`

**Objectif** : Intégrer les clics produits de la page "Le Comptoir" (ShopView) dans le parcours utilisateur des sessions analytics, avec une identité visuelle distincte de la galerie.

**Problème** : La visite de "Le Comptoir" apparaissait déjà en tant qu'étape générique `shop` dans le parcours (même couleur ambre que toutes les autres pages). Les clics sur les produits affiliés n'étaient enregistrés **que** dans la collection `affiliate_clicks`, jamais dans le parcours de session. Il était donc impossible de savoir si un visiteur avait consulté un produit spécifique sans croiser deux sources de données séparées.

**Architecture de la Solution : Custom DOM Event**

Choix technique : un `CustomEvent` DOM (`comptoir_product_click`) dispatché sur `window`. Cette approche évite tout prop drilling depuis `App.jsx` → `ShopView` → `ShopProductCard` et maintient le découplage entre la couche commerce (affiliate tracking) et la couche analytics (session journey).

**Flux d'exécution :**
1. L'utilisateur clique "Découvrir" sur un produit → `handleAffiliateClick` s'exécute
2. Le lien affilié s'ouvre en onglet (synchrone, anti-popup-blocker — inchangé)
3. Guard admin : si admin, retour immédiat (inchangé)
4. **Nouveau** : `window.dispatchEvent('comptoir_product_click', { productId, productName, productPrice })`
5. **Nouveau** : `AnalyticsProvider` capte l'événement et pousse `{ page: 'comptoir', itemId: 'id | Nom (prix€)', time, duration }` dans `journeyToSend`
6. L'écriture `affiliate_clicks` Firestore se poursuit normalement (inchangé)

**Modifications par fichier :**

1. **`ShopProductCard.jsx`** : Ajout du `window.dispatchEvent` après le guard admin, avant l'écriture Firestore. Aucune rupture du flux existant.

2. **`AnalyticsProvider.jsx`** : Nouveau `useEffect` avec `addEventListener('comptoir_product_click')` → construit le `displayId` au format `"productId | Nom (prix€)"` et pousse l'étape dans `journeyToSend.current`. Deps : `[isAdmin]`. Le `lastActionTimeRef` est mis à jour pour maintenir la cohérence des durées inter-étapes.

3. **`AdminAnalytics.jsx`** : Refonte du système de couleurs du parcours utilisateur pour 3 types d'étapes distincts :

| Type d'étape | Dot | Horodatage | Label | Badge produit |
|---|---|---|---|---|
| `home / gallery / detail / ...` | Bleu `#3B82F6` | `text-blue-500/60` | `Vue : AMBER` | Indigo `ID: ...` |
| `shop` (visite page Le Comptoir) | Violet `#8B5CF6` | `text-violet-400/60` | `Vue : SHOP` violet | Indigo |
| `comptoir` (clic produit) | Teal `#2DD4BF` avec glow | `text-teal-400/60` | `Clic : Comptoir` teal | Teal (sans préfixe "ID:") |

**Résultat** : Chaque clic "Découvrir" sur Le Comptoir génère une étape dans le parcours de session, visuellement distincte (teal) de la navigation galerie (ambre) et de la simple visite de la page shop (violet). L'admin voit instantanément si un visiteur a consulté un produit d'entretien précis, avec son nom et son prix, dans la chronologie de sa session.


# Audit Final Complet — Tous à Table Made in Normandie v35.8

**Date** : 19 mars 2026
**Agent** : Claude Opus 4.6
**Scope** : Backend, Frontend, Sécurité, UX, iOS, Config, Dépendances
**Branche** : `main` (commit `0d88436`)

---

## 1. VÉRIFICATION DES BUGS RAPPORTÉS (rapport.md + audits précédents)

### Bugs Commerce (rapport.md)

| Bug | Description | Statut | Vérification |
|-----|------------|--------|-------------|
| BUG 1 — Race condition survente | Stock non décrémenté pour `stripe_elements` | ✅ CORRIGÉ | `createOrder.js:186-216` — Transaction atomique réserve stock + crée commande. Flag `stockReserved: true`. Le webhook (`stripeWebhook.js:77`) vérifie ce flag et ne décrémente pas une 2ème fois. |
| BUG 2 — Commandes orphelines | Fermeture modal Stripe laissait commandes `pending_payment` | ✅ CORRIGÉ | `CheckoutView.jsx:193-217` — `handleClosePaymentModal()` appelle `cancelOrderClient` + reset state. |
| BUG 3 — `cancelOrder` stock=1 en dur | Stock restauré à 1 au lieu d'incrémenter | ✅ CORRIGÉ | `cancelOrder.js:62-69` — `currentStock + qtyToRestore` + `FieldValue.delete()` pour soldAt/buyerId. |
| BUG 4 — Stale closure formData | `setFormData({...formData})` au lieu de fonctionnel | ✅ CORRIGÉ | `CheckoutView.jsx:300,355` — Pattern `setFormData(prev => ({...prev}))` partout. |
| BUG 5 — CSP HTTP non sécurisé | `http://ip-api.com` dans connect-src | ⚠️ PARTIELLEMENT | `firebase.json:49` — `connect-src` utilise bien `https://ip-api.com`. MAIS le serveur `sessions.js:19` appelle encore `http://ip-api.com/json/` (HTTP). Voir section Problèmes. |
| BUG 6 — Double setCartItems | Doublon supprimé | ✅ CORRIGÉ | Confirmé dans `App.jsx`. |

### Bugs iOS (interoperabilité.md + auditIOS.md)

| Bug | Description | Statut |
|-----|------------|--------|
| Popup Google bloqué 5s (Android) | `updateUserSessions` en await | ✅ CORRIGÉ — Fire-and-forget (`AuthContext.jsx:135-136`) |
| Zoom auto inputs iOS | `font-size < 16px` | ✅ CORRIGÉ — `index.css:50-54` force `max(16px, 1em)` + `index.html:6` `maximum-scale=1.0` |
| Scroll body derrière modales iOS | `overflow:hidden` inefficace | ✅ CORRIGÉ — Classe `.modal-open` avec `position:fixed` (`index.css:33-41`) |
| Hauteur viewport Safari | `100vh` inclut barre d'outils | ✅ CORRIGÉ — Variable `--vh` calculée (`App.jsx:51-62`) + `85dvh` sur modales |
| Scroll interne saccadé | Pas d'inertie iOS | ✅ CORRIGÉ — `.ios-modal-scroll` avec `-webkit-overflow-scrolling: touch` |
| Backdrop tap-to-close | Pas de fermeture par tap | ✅ CORRIGÉ — `e.target === e.currentTarget` sur backdrop Stripe (`CheckoutView.jsx:801`) |
| Modale Stripe invisible iOS | Stacking context + transform | ✅ CORRIGÉ — `createPortal(…, document.body)` + `z-[99999]` (`CheckoutView.jsx:797-850`) |
| Faux positif "Victime de son succès" | onSnapshot voyait sold=true de sa propre réservation | ✅ CORRIGÉ — Logique conditionnelle (`CheckoutView.jsx:474`) ignore si `ready_to_pay` ou `isCleaningUp` |
| Auth Google iOS standalone PWA | signInWithPopup bloqué par WebKit | ✅ CORRIGÉ — Détection `isIOSStandalone()` → `signInWithRedirect` (`AuthContext.jsx:20-23,125-131`) |
| Race condition redirect vs anonyme | signInAnonymously pouvait écraser le redirect | ✅ CORRIGÉ — Flag `sessionStorage` REDIRECT_KEY (`AuthContext.jsx:26-29,81`) |

### Bugs Checkout (checkoutbug.md)

| Bug | Description | Statut |
|-----|------------|--------|
| Ajout panier sans connexion | UX mauvaise : panier vide affiché | ✅ CORRIGÉ — `pendingItem` pattern (`App.jsx:99`) |
| Autocomplétion adresse mobile | Suggestions cachées par overlay natif | ✅ CORRIGÉ — Portal + bottom sheet mobile + `onPointerDown` (`CheckoutView.jsx:853-900`) |

---

## 2. AUDIT BACKEND (Cloud Functions)

### Architecture Commerce

**Note : 8.5/10**

**Points forts :**
- Transaction Firestore atomique pour la réservation de stock (anti-survente) ✅
- Prix recalculé 100% côté serveur (jamais confiance au client) ✅
- Flag `stockReserved` pour rétrocompatibilité avec anciennes commandes ✅
- Rollback automatique si le PaymentIntent échoue (`createOrder.js:260-283`) ✅
- Signature webhook Stripe obligatoire, pas de fallback non-signé (`stripeWebhook.js:23-39`) ✅
- Idempotence du webhook (check `order.status === 'paid'` avant traitement) ✅
- Handler `payment_intent.payment_failed` restaure le stock ✅

**Points d'attention :**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ⚠️ WARNING | `checkout.session.completed` handler legacy | `stripeWebhook.js:128-201` — Ce handler pour l'ancien mode Stripe Checkout est toujours actif. Si ce mode n'est plus utilisé, c'est du code mort. S'il est encore accessible, il ne vérifie PAS `stockReserved` et peut décrémenter un stock déjà réservé. |
| ⚠️ WARNING | Pas de handler `payment_intent.canceled` | Les PaymentIntents expirés après 24h (non payés, non annulés) ne restaurent jamais le stock. Recommandé dans rapport.md mais pas implémenté. |
| ⚠️ WARNING | `createOrder` — double transaction séquentielle | Lignes 46-100 font une transaction de vérification, puis 187-216 refont une transaction de réservation. La 1ère est inutile car la 2ème revérifie tout. Overhead sans danger mais complexité superflue pour `stripe_elements`. |
| ℹ️ INFO | Batch > 500 docs dans `clearAllSessions` | `sessions.js:158-162` — Si > 500 sessions, le batch échouera. Firestore limite les batchs à 500 opérations. |
| ℹ️ INFO | `ip-api.com` en HTTP dans `sessions.js:19` | L'appel fetch utilise `http://` au lieu de `https://`. La version gratuite d'ip-api ne supporte pas HTTPS (faut un plan payant). Pas critique côté serveur (CF→API), mais inconsistant avec le CSP. |

### Architecture Auth & Admin

**Note : 8/10**

**Points forts :**
- Custom Claims Firebase pour les admins ✅
- Attribution automatique au premier login (`grantAdminOnAuth.js`) ✅
- Super Admin protégé contre la révocation (`adminManagement.js:62`) ✅
- Rate limiting sur enchères (5/min) et logs connexion (3/10min) ✅
- Idempotence sur les enchères via clé unique ✅

**Points d'attention :**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ⚠️ WARNING | Rate limiting non-atomique (enchères) | `placeBid.js:31-43` — Le check rate limit est hors transaction. Deux requêtes simultanées passent toutes les deux le check avant l'update. Risque faible mais réel sous charge. |
| ⚠️ WARNING | `syncSessionBeacon` CORS `*` | `sessions.js:101` — `Access-Control-Allow-Origin: '*'` sur un endpoint non-authentifié. N'importe quel site peut envoyer des sessions fake. Pas de risque de sécurité majeur (analytics only) mais pollution possible. |
| ℹ️ INFO | Email admin hardcodé | `security.js:8`, `AuthContext.jsx:97`, `firestore.rules:8` — Email en dur à 3 endroits. Cohérent mais couplé. Si l'email change, 3 fichiers + deploy nécessaires. |

### Architecture Email

**Note : 7/10**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ⚠️ WARNING | Gmail en production | `orderEmails.js` utilise `nodemailer` avec Gmail. Gmail impose un quota de 500 emails/jour et peut bloquer les envois "suspects". Pour un site en production, un service transactionnel (Resend, SendGrid, Postmark) serait plus fiable. |
| ℹ️ INFO | Pas de retry email | Si l'envoi échoue, le `catch` log l'erreur mais l'email est perdu. Pas de queue ni de retry. |

### Architecture Enchères

**Note : 9/10**

- Transaction atomique Firestore ✅
- Historique complet des enchères (sous-collection `bids`) ✅
- Rate limiting + idempotence ✅
- Anti-cold-start avec `wakeUp` ✅

---

## 3. AUDIT FRONTEND

### CheckoutView

**Note : 8.5/10**

**Points forts :**
- Flow single-page élégant (formulaire → choix paiement → modal Stripe)
- `createPortal` pour la modale Stripe (contourne les bugs iOS)
- Autocomplétion adresse via `api-adresse.data.gouv.fr` avec bottom sheet mobile
- Surveillance stock temps réel via `onSnapshot`
- Protection contre faux positif "Victime de son succès"
- Bouton premium avec mouse tracking (UX Apple-like)
- `onPointerDown` pour les suggestions (anti-blur iOS)

**Points d'attention :**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ⚠️ WARNING | Pas de validation email côté frontend | Le champ email n'a pas de pattern validation. Un utilisateur peut entrer un email invalide. Le serveur ne valide pas non plus le format (il utilise `context.auth.token.email` comme fallback, mais `formData.email` est stocké dans `shipping`). |
| ℹ️ INFO | `alert()` pour les erreurs | `CheckoutView.jsx:428` — Les erreurs utilisent `alert()` natif au lieu d'un toast/notification intégrée au design. Fonctionne mais UX rustique. |
| ℹ️ INFO | Pas de debounce sur fetchAddresses | Le `setTimeout(400ms)` dans `handleAddressRelatedChange` fait office de debounce mais n'est pas annulé au unmount. Risque de `setState` sur composant unmonté. |

### AuthContext

**Note : 9/10**

**Points forts :**
- Détection iOS standalone PWA → `signInWithRedirect` ✅
- Flag `sessionStorage` pour la race condition redirect/anonyme ✅
- `getRedirectResult` appelé en premier ✅
- Fire-and-forget sur `updateUserSessions` ✅
- Cleanup function avec `cancelled` flag ✅

**Point d'attention :**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ℹ️ INFO | Admin hardcodé côté client | `AuthContext.jsx:97` — `matthis.fradin2@gmail.com` en dur. Fonctionnel comme filet de sécurité mais exposé dans le bundle JS. Pas un risque car les Firestore rules vérifient aussi côté serveur. |

---

## 4. AUDIT SÉCURITÉ & CONFIG

### Firestore Rules

**Note : 9/10**

**Points forts :**
- Validation de schéma stricte sur les produits (`isValidProduct()`) ✅
- Commandes en lecture seule pour les clients (création uniquement via CF) ✅
- Collections système (`sys_ratelimit`, `sys_idempotency`) inaccessibles aux clients ✅
- Isolation du panier par utilisateur ✅
- Validation anti-flood sur le panier (`keys().size() < 10`) ✅

**Points d'attention :**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ⚠️ WARNING | `newsletter_subscribers` — `create: if true` | `firestore.rules:66` — N'importe qui (même sans auth) peut créer un document. Un bot pourrait flood la collection. Recommandé : `create: if request.auth != null` ou rate limit côté CF. |
| ℹ️ INFO | APP_ID hardcodé dans rules | `firestore.rules:47` — `tat-made-in-normandie` est en dur. Si l'APP_ID change, les rules deviennent inopérantes. |

### Storage Rules

**Note : 9/10**

- Lecture publique ✅ (nécessaire pour les images produits)
- Écriture admin-only ✅
- Limite 10Mo ✅
- Validation content-type images uniquement ✅

### CSP (Content-Security-Policy)

**Note : 8/10**

| Sévérité | Problème | Détail |
|----------|---------|--------|
| ⚠️ WARNING | `'unsafe-eval'` dans script-src | `firebase.json:49` — Présence de `'unsafe-eval'`. Si c'est pour Vite en dev, il faudrait le retirer en prod. Si c'est nécessaire pour une lib tierce, c'est un compromis acceptable mais à documenter. |
| ⚠️ WARNING | `'unsafe-inline'` dans script-src et style-src | Nécessaire pour Tailwind/inline styles et certains scripts Firebase, mais réduit l'efficacité du CSP contre les injections XSS. |
| ✅ OK | X-Frame-Options: SAMEORIGIN | Corrigé par rapport à DENY (fix auth Google iframe). |
| ✅ OK | frame-src inclut `'self'` + Firebase + Stripe + Google | Complet pour l'auth et le paiement. |
| ✅ OK | Cache immutable sur assets statiques | `max-age=31536000, immutable` sur images/css/js. |
| ✅ OK | No-cache sur HTML | `no-cache, no-store, must-revalidate` sur les pages. |

### Dépendances

| Package | Version | Statut |
|---------|---------|--------|
| firebase | ^11.1.0 | ✅ Récent |
| firebase-admin | ^13.6.0 | ✅ Récent |
| firebase-functions | ^7.0.5 | ✅ Récent |
| stripe (backend) | ^20.3.0 | ✅ Récent |
| @stripe/react-stripe-js | ^5.6.1 | ✅ Récent |
| react | ^18.3.1 | ✅ Stable |
| vite | ^5.4.11 | ✅ Récent |
| tailwindcss | ^4.1.18 | ✅ v4 récent |
| puppeteer | ^24.38.0 | ⚠️ Très lourd (300Mo+). Est-ce utilisé ? Si non, à retirer du bundle client. |

---

## 5. AUDIT UX & FEATURES

### Inventaire des Fonctionnalités

| Fonctionnalité | Implémentation | Qualité |
|----------------|---------------|---------|
| **Marketplace** — Galerie produits (meubles + planches) | ✅ | Excellente |
| **Fiche produit** — Images, description, enchères | ✅ | Excellente |
| **Enchères en direct** — Temps réel Firestore | ✅ | Excellente (rate limit + idempotence) |
| **Panier** — Sidebar animée, multi-articles | ✅ | Très bon |
| **Checkout** — Formulaire + choix paiement + Stripe inline | ✅ | Excellent (premium UX) |
| **Paiement Stripe** — PaymentElement + ExpressCheckout (Apple/Google Pay) | ✅ | Excellent |
| **Paiement différé** — Virement/Wero | ✅ | Bon |
| **Auth Google** — Popup + redirect iOS PWA | ✅ | Excellent |
| **Auth Email/Password** — Avec vérification | ✅ | Bon |
| **Auth anonyme** — Transparent pour la navigation | ✅ | Bon |
| **Mes commandes** — Historique client | ✅ | Bon |
| **Admin panel** — Gestion produits, commandes, users | ✅ | Complet |
| **Emails transactionnels** — Confirmation, expédition, livraison | ✅ | Bon |
| **Newsletter** — Modal d'inscription | ✅ | Bon |
| **Autocomplétion adresse** — api-adresse.data.gouv.fr | ✅ | Très bon (bottom sheet mobile) |
| **Analytics sessions** — Temps réel + geo-IP | ✅ | Avancé |
| **SEO** — Sitemap XML dynamique + Schema.org + OG meta | ✅ | Excellent |
| **Dark mode** — Toggle avec persistance | ✅ | Bon |
| **PWA** — Manifest + apple-mobile-web-app-capable | ✅ | Basique (pas de service worker offline) |
| **Anti-cold-start** — WakeUp function | ✅ | Bon |
| **Garbage collector** — Nettoyage Storage orphelin | ✅ | Bon |
| **Admin IP tracking** — Exclusion des analytics | ✅ | Avancé |

### Qualité UX

**Note : 8.5/10**

- Design premium cohérent (dark/light mode) ✅
- Animations Framer Motion fluides ✅
- Boutons avec mouse tracking (effet Apple/Linear) ✅
- Responsive mobile très bien travaillé ✅
- iOS : toutes les fixes vérifiées et implémentées ✅
- Autocomplétion avec bottom sheet mobile = excellent pattern ✅
- Les preconnect dans `index.html` accélèrent le chargement ✅
- Fonts chargées en non-bloquant (`media="print" + onload`) ✅

---

## 6. NOTES GLOBALES

| Domaine | Note /10 | Commentaire |
|---------|----------|-------------|
| **Sécurité backend** | 8.5 | Transactions atomiques, prix serveur, webhook signé, rate limiting. Quelques détails (rate limit non-atomique, CORS beacon). |
| **Fiabilité commerce** | 8.5 | Anti-survente solide, rollback automatique, idempotence webhook. Manque handler `payment_intent.canceled` et nettoyage du handler legacy `checkout.session.completed`. |
| **Sécurité frontend** | 8 | CSP en place, pas de secrets exposés. `unsafe-eval` et `unsafe-inline` réduisent l'efficacité mais sont nécessaires. |
| **Firestore Rules** | 9 | Excellentes. Validation schéma, isolation user, collections système protégées. |
| **UX & Design** | 8.5 | Premium, cohérent, bien pensé pour mobile. Les `alert()` natifs dénaturent un peu. |
| **Compatibilité iOS** | 9 | Tous les bugs identifiés dans les audits précédents sont corrigés. Excellent travail. |
| **Features** | 9 | Très complet pour une marketplace artisanale : enchères, multi-paiement, admin, analytics, SEO. |
| **Code quality** | 8 | Bien structuré (helpers centralisés, contextes React, séparation concerns). CheckoutView est un peu long (900 lignes) mais lisible. |
| **Performance** | 8 | Preconnect, fonts non-bloquantes, cache immutable. Puppeteer dans les deps client est suspect. |
| **Accessibilité** | 5 | Pas d'ARIA labels, pas de `<label>` HTML sur les inputs, pas de focus rings visibles. Dark mode et `prefers-reduced-motion` présents. |

### **NOTE GLOBALE : 8.5/10**

---

## 7. PISTES D'AMÉLIORATION (Priorisées)

### Priorité Haute (Impact business/fiabilité)

1. **Ajouter le handler `payment_intent.canceled`** dans `stripeWebhook.js`
   - Restaure le stock des commandes `stockReserved` dont le PaymentIntent expire après 24h
   - Sans ça, un utilisateur qui ouvre le checkout puis ferme son navigateur (sans fermer la modale) bloque le stock indéfiniment
   - Complexité : faible (copier le pattern de `payment_intent.payment_failed`)

2. **Nettoyer ou protéger le handler `checkout.session.completed`**
   - Si ce mode n'est plus utilisé : le supprimer (code mort = surface d'attaque inutile)
   - Si encore actif : ajouter le check `stockReserved` comme dans `payment_intent.succeeded`

3. **Remplacer Gmail par un service transactionnel** (Resend, SendGrid)
   - Gmail en prod = quotas 500/jour, blocages possibles, pas de retry
   - Impact : emails de confirmation perdus = frustration client

4. **Synchroniser les Firestore/Storage rules entre sandbox et prod**
   - Deux projets Firebase (`tatmadeinnormandie` sandbox, `tousatable-client` prod)
   - Les rules doivent être identiques sur les deux — vérifier après chaque deploy

### Priorité Moyenne (Qualité & robustesse)

4. **Protéger `newsletter_subscribers`** — Ajouter `request.auth != null` dans les Firestore rules ou implémenter via Cloud Function avec rate limiting.

5. **Retirer `puppeteer` du package.json client** — 300Mo+ de deps pour un usage incertain. Si c'est pour la génération PDF admin, le déplacer côté Cloud Functions.

6. **Remplacer les `alert()` par des toasts** dans CheckoutView — Pour maintenir la cohérence avec le design premium.

7. **Rendre le rate limiting atomique** pour les enchères — Mettre le check dans la même transaction que l'enchère, ou utiliser un compteur Firestore avec `FieldValue.increment`.

8. **Supprimer la première transaction de vérification dans `createOrder`** — La transaction de réservation (lignes 187-216) refait déjà toutes les vérifications. La première (lignes 46-96) est redondante pour `stripe_elements`.

### Priorité Basse (Nice-to-have)

9. **Ajouter un cron de nettoyage** — Commandes `pending_payment` de plus de 1h sans paiement = restaurer le stock. Filet de sécurité ultime en complément du handler webhook.

10. **Batch limité à 500** — Dans `clearAllSessions`, paginer les batchs Firestore.

11. **Restreindre CORS sur le beacon** — Remplacer `'*'` par le domaine du site.

12. **Documenter le CSP** — Lister pourquoi `unsafe-eval` et `unsafe-inline` sont nécessaires. Vérifier si Vite prod peut s'en passer.

13. **Service Worker offline** — La PWA est configurée (manifest, apple-mobile-web-app-capable) mais sans service worker. Un SW basique permettrait le cache offline de l'UI.

14. **Accessibilité (a11y)** — Ajouter des `<label>` sur tous les inputs (pas juste des placeholders), des `aria-label` sur les boutons icônes, des focus rings visibles pour la navigation clavier, et `aria-live="polite"` sur les mises à jour du panier. Le site respecte déjà `prefers-reduced-motion` et propose un dark mode, mais il manque les fondamentaux WCAG.

---

## 8. CONCLUSION

Le projet est dans un **excellent état de stabilité**. Les bugs critiques identifiés dans les audits précédents (race condition survente, commandes orphelines, modale Stripe invisible iOS, faux positif "Victime de son succès", auth Google bloquée) sont **tous correctement corrigés**.

L'architecture commerce est solide : transactions atomiques, prix serveur, webhook signé, rollback automatique. Le flow de paiement est complet (Stripe inline + virement) avec une UX premium.

Le principal risque résiduel est l'absence de handler pour les PaymentIntents expirés (`payment_intent.canceled`), qui peut bloquer le stock si un utilisateur ferme son navigateur après avoir ouvert le checkout sans passer par la fermeture de la modale. C'est le seul point qui mérite une attention rapide.

**Verdict : La v35.8 est solide et prête pour la production.** Les améliorations suggérées sont des optimisations, pas des blocages.

---

*Audit réalisé par Claude Opus 4.6 — 19 mars 2026*

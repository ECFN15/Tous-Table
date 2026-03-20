# CLAUDE.md — Journal de bord technique

> Ce fichier documente chaque intervention de Claude sur le projet **Tous à Table Made in Normandie**.
> Chaque entrée est datée, détaille le problème d'origine, la solution appliquée, et les fichiers modifiés.

---

## 19 mars 2026 — Implémentation des améliorations de l'audit v35.8

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

# 🛡️ Patchs de Sécurité — À Tester sur Sandbox

> **Date** : 18 Février 2026
> **Branche** : `security/audit`
> **Status** : ⏸️ EN PAUSE — Nécessite des tests sur Sandbox avant déploiement Prod.

---

## ⚠️ Pourquoi le rollback ?

Le header **Content-Security-Policy (CSP)** ajouté dans `firebase.json` bloquait des ressources essentielles en Production :
- **Google Fonts** (polices cassées)
- **Script reCAPTCHA v3** (App Check ne pouvait pas s'initialiser)
- **Connexions Firestore** (produits ne chargeaient plus → "Aucune pièce disponible")

**Le CSP est retiré.** Tous les autres patchs de la branche sont OK mais n'ont pas été testés isolément.

---

## 📋 Patchs prêts dans la branche `security/audit`

### ✅ Safe (pas d'impact UI) — Peuvent être redéployés après test Sandbox

| # | Patch | Fichier | Risque UI |
|---|-------|---------|-----------|
| 1 | **Suppression `initSuperAdmin`** (backdoor publique) | `functions/index.js` | ❌ Aucun |
| 2 | **Sanitize `dangerouslySetInnerHTML`** (Anti-XSS) | `HomeView.jsx`, `Footer.jsx` | ⚠️ Faible — Vérifier que les `<br>` fonctionnent toujours dans le Manifesto |
| 3 | **Sanitize `shareMeta` productId** (Anti-XSS réfléchi) | `functions/index.js` | ❌ Aucun |
| 4 | **Rate Limit `logUserConnection`** (Anti-spam Firestore) | `functions/index.js` | ❌ Aucun |
| 5 | **Nettoyage debug `sendTestEmail`** (Fuite info serveur) | `functions/index.js` | ❌ Aucun |
| 6 | **`email_verified` sur Orders** (Firestore Rules) | `firestore.rules` | ⚠️ À tester — Vérifier que les commandes restent lisibles pour les clients vérifiés |

### ⚠️ Nécessite des tests approfondis avant Prod

| # | Patch | Fichier | Problème rencontré |
|---|-------|---------|-------------------|
| 7 | **Content-Security-Policy (CSP)** | `firebase.json` | **Bloque les polices, scripts reCAPTCHA, et connexions Firebase.** Il faut mapper TOUS les domaines utilisés (Google Fonts, Firebase, reCAPTCHA, Stripe, Analytics, etc.) et tester sur Sandbox d'abord. |
| 8 | **Firebase App Check (reCAPTCHA v3)** | `src/firebase/config.js` | **Dépend du CSP pour fonctionner.** Le script reCAPTCHA doit pouvoir se charger. Tester sur Sandbox SANS CSP d'abord, puis ajouter le CSP progressivement. |

---

## 🔑 Clés reCAPTCHA v3 (déjà créées)

- **Clé du site** : `6Lc7OXAsAAAAAHz6Lwl5wWlhEP31TN_hOsWBhWde`
- **Clé secrète** : `6Lc7OXAsAAAAAMbyIgxAlm8OcgdLx1nlZ1AbE3ka`
- **Firebase App Check** : Enregistré sur `tousatable-client` ✅
- **Domaines autorisés** : `tousatable-madeinnormandie.fr`, `localhost`

---

## 🔄 Procédure de test recommandée

```bash
# 1. Passer sur la branche sécurité
git checkout security/audit

# 2. S'assurer d'être en Sandbox
firebase use default  # → tatmadeinnormandie

# 3. Lancer le dev server
npm run dev

# 4. Ouvrir http://localhost:5173 et vérifier :
#    ✅ Homepage charge normalement (polices, images, animations)
#    ✅ Galerie charge les produits
#    ✅ Page produit détail fonctionne
#    ✅ Enchères fonctionnent
#    ✅ Connexion/Inscription fonctionnent
#    ✅ Footer s'affiche correctement

# 5. Si tout est OK → Build et déployer sur Sandbox
npm run build
firebase deploy

# 6. Vérifier sur tatmadeinnormandie.web.app

# 7. Si Sandbox OK → Déployer en Prod via /production_workflow
```

---

## 🔒 Ce qui est DÉJÀ sécurisé (avant cette branche)

Ces protections étaient déjà en place et restent actives :
- ✅ Secret Manager (Stripe, Gmail)
- ✅ Rate Limiting Enchères (5/min)
- ✅ Idempotency Enchères (anti-doublon)
- ✅ Webhook Stripe signé
- ✅ Email vérifié pour commandes
- ✅ Storage blindé (admin only, 10Mo, images)
- ✅ Headers X-Frame-Options, X-Content-Type, Referrer-Policy
- ✅ Firestore sys_* verrouillé
- ✅ Super Admin protégé

---

## ⚠️ Note importante sur `initSuperAdmin`

La fonction `initSuperAdmin` a été **supprimée du code ET de Google Cloud** lors du premier déploiement. Même après le rollback du code vers `main`, **la fonction n'existe plus sur le serveur**. C'est le seul patch qui reste actif en prod — et c'est une bonne chose car c'était la faille la plus critique.

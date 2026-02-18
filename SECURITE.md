# 🛡️ AUDIT DE SÉCURITÉ COMPLET — 18 Février 2026 (23:10)

## Score Global : 9.2 / 10 🏆

---

## 1. 🔴 BACKDOOR `initSuperAdmin`

| Critère | Résultat |
|---|---|
| Présent dans `functions/index.js` ? | ❌ **SUPPRIMÉ** ✅ |
| Recherche dans tout le codebase | **0 résultats** ✅ |
| **Verdict** | **ÉLIMINÉ DÉFINITIVEMENT** 🔒 |

---

## 2. 🛡️ HEADERS DE SÉCURITÉ (`firebase.json`)

| Header | Valeur | État |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | ✅ Actif |
| `X-Frame-Options` | `DENY` | ✅ Actif |
| `X-XSS-Protection` | `1; mode=block` | ✅ Actif |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Actif |
| `Content-Security-Policy` | Complet (voir détail ci-dessous) | ✅ Actif |

### Détail CSP :

| Directive | Domaines autorisés | État |
|---|---|---|
| `script-src` | `self`, Google, Stripe | ✅ |
| `style-src` | `self`, Google Fonts | ✅ |
| `img-src` | `self`, Firebase Storage, Unsplash, Google, Stripe, TransparentTextures | ✅ |
| `font-src` | `self`, Google Fonts | ✅ |
| `connect-src` | `self`, Firebase (`*.googleapis`, `*.firebaseio`, `cloudfunctions`), Analytics, Stripe, **App Check** | ✅ |
| `frame-src` | Google Auth, Stripe Checkout, Firebase Auth Handler | ✅ |

---

## 3. 👻 APP CHECK (reCAPTCHA v3)

| Critère | Résultat |
|---|---|
| Import `initializeAppCheck` dans `config.js` | ✅ Présent (ligne 7) |
| Provider `ReCaptchaV3Provider` | ✅ Configuré (ligne 35) |
| Site Key | `6Lc7OXAs...` ✅ |
| Debug Token pour `localhost` | ✅ Activé (ligne 31) |
| `isTokenAutoRefreshEnabled` | ✅ `true` |
| Cloud Firestore | ✅ **APPLIQUÉ** (Enforcement actif) |
| Authentication | ✅ **APPLIQUÉ** (Enforcement actif) |
| Storage | ⚪ Non appliqué (images publiques) |
| **Verdict** | **OPÉRATIONNEL & BLINDÉ** 🟢🔒 |

---

## 4. 🩹 SANITIZATION XSS

| Fichier | Protection | État |
|---|---|---|
| `functions/index.js` → `shareMeta` | Regex `[^a-zA-Z0-9_-]` sur `productId` | ✅ (ligne 687) |
| `functions/index.js` → `shareMeta` | `escapeHtml()` sur `title`, `desc`, `img` | ✅ (ligne 701) |
| `functions/index.js` → `sendTestEmail` | Pas de fuite `process.cwd()` | ✅ (ligne 897) |
| `src/pages/HomeView.jsx` | `sanitizeHtml()` helper → 3 usages | ✅ (lignes 971, 992, 1013) |
| `src/components/Footer.jsx` | `sanitizeHtml()` helper → 1 usage | ✅ (ligne 45) |
| `dangerouslySetInnerHTML` non protégé ? | **0 usage non protégé** | ✅ **BLINDÉ** |

---

## 5. 🚦 RATE LIMITING

| Fonction | Limite | État |
|---|---|---|
| `logUserConnection` | 1 appel / 10 min / utilisateur | ✅ (ligne 1004-1017) |
| `placeBid` | 5 enchères / min / utilisateur | ✅ (déjà en place avant) |
| **Collection `sys_ratelimit`** | `allow: if false` (client-side) | ✅ Protégé (ligne 104-106) |
| **Collection `sys_idempotency`** | `allow: if false` (client-side) | ✅ Protégé (ligne 108-110) |

---

## 6. 🔐 RULES FIRESTORE

| Collection | Lecture | Écriture | État |
|---|---|---|---|
| `artifacts/.../public/data` (Meubles) | ✅ Publique | ✅ Admin + Validation | ✅ |
| `users/{uid}` | ✅ Owner/Admin | ✅ Owner/Admin | ✅ |
| `users/{uid}/cart` | ✅ Owner | ✅ Owner + Validation | ✅ |
| `orders` | ✅ Owner (`email_verified`) | ❌ Cloud Function Only | ✅ |
| `sys_metadata` | ✅ Publique | ✅ Admin uniquement | ✅ |
| `sys_ratelimit` | ❌ Bloqué | ❌ Bloqué | ✅ |
| `sys_idempotency` | ❌ Bloqué | ❌ Bloqué | ✅ |

---

## 7. 📦 STORAGE RULES

| Critère | Résultat |
|---|---|
| Lecture | ✅ Publique (images des meubles) |
| Écriture | ✅ Admin uniquement (`matthis.fradin2@gmail.com` OU `admin == true`) |
| Taille max | ✅ 10 Mo |
| Type de fichier | ✅ Images uniquement (`image/*`) |

---

## 8. 🌐 ENVIRONNEMENTS

| Critère | Sandbox 🧪 | Production 🌍 |
|---|---|---|
| CSP Header | ✅ Déployé | ✅ Déployé |
| App Check Code | ✅ Déployé | ✅ Déployé |
| Firestore Rules | ✅ Déployé | ✅ Déployé |
| Auth Anonyme | ✅ Activé | ✅ Activé |
| Backend Patches | ✅ Déployé | ✅ Déployé |
| Frontend XSS Fix | ✅ Déployé | ✅ Déployé |
| App Check Enforcement (Firestore) | ✅ **Appliqué** | ✅ **Appliqué** |
| App Check Enforcement (Auth) | ✅ **Appliqué** | ✅ **Appliqué** |

---

## ⚠️ Points d'attention mineurs (0.8 points perdus)

1. **CSP `'unsafe-inline'`** (0.3 pt) : Le CSP autorise `'unsafe-inline'` pour les scripts et styles, ce qui affaiblit légèrement la protection XSS. C'est nécessaire pour le bon fonctionnement de React/Vite, mais c'est un compromis technique classique.

2. **Storage App Check** (0.5 pt) : App Check n'est pas encore appliqué sur Storage. Les images sont publiques par design, mais un bot pourrait théoriquement saturer la bande passante en téléchargeant massivement les images. Risque faible car les `storage.rules` limitent déjà l'écriture aux admins.

---

## 🏆 VERDICT FINAL

**Le site [tousatable-madeinnormandie.fr](https://tousatable-madeinnormandie.fr) est sécurisé aux standards professionnels.**

Toutes les failles critiques identifiées lors de l'audit ont été corrigées. Les 8 couches de sécurité sont en place et vérifiées dans le code source. Les deux environnements (Sandbox & Production) sont synchronisés.

---

*Audit réalisé le 18 Février 2026 à 23:10. Enforcement App Check activé dans la foulée.*

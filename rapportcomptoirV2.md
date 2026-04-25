# 🛠️ Rapport de Refonte Architecture : Le Comptoir V2 (Tous à Table)

Ce document archive la transformation majeure opérée entre le **20 et le 25 avril 2026**, visant à professionnaliser la boutique ("Le Comptoir") et à sécuriser les revenus d'affiliation.

---

## 1. 🏗️ Architecture : Du Statique au Dynamique (Firestore)

### État Initial (Legacy)
- Les catégories et tutoriels étaient écrits "en dur" dans un tableau `FAMILIES` dans `ShopView.jsx`.
- Le lien entre une vidéo et un produit reposait sur une comparaison de texte (`productName.includes`).
- **Problème** : Toute modification nécessitait un nouveau déploiement de code. Si le nom d'un produit changeait de 1 caractère, le lien "Découvrir" disparaissait.

### Nouvelle Architecture (V2)
- **Collection Firestore** : `shop_tutorials` (dans `artifacts/{appId}/public/data/`).
- **Matching Robuste** : Utilisation du `productId` (UID Firestore unique) pour lier une vidéo à sa fiche produit.
- **Hybridation** : Le front-end utilise `onSnapshot` pour charger les données en temps réel. Un fallback automatique sur les données statiques (`FAMILIES`) est maintenu pour garantir la continuité de service en cas de latence réseau.

---

## 2. 📺 Nouveau Module : Admin Tutorials
Un module dédié a été ajouté au Backoffice (onglet "Boutique").

- **Fonctionnalités CRUD** : Ajouter, modifier, supprimer des tutoriels sans toucher au code.
- **Liaison Intelligente** : Un sélecteur permet de choisir un produit parmi la base `affiliate_products`.
- **KPIs Temps Réel** :
    - Nombre total de tutoriels.
    - Nombre de tutoriels orphelins (vidéos sans produit lié).
    - Taux de couverture des catégories.

---

## 🛡️ Sécurité & Protection des Commissions (Affiliation)

### Le "Bouclier" `tousatable-21`
Une faille humaine majeure a été identifiée : l'oubli du tag affilié dans les URLs Amazon lors de la création de fiches produits.

**Solutions implémentées :**
1. **Validation Temps Réel** : Le champ `affiliateUrl` dans `AdminShop` analyse désormais l'URL à chaque frappe.
2. **Alertes Visuelles** :
    - 🟢 Vert : Tag `tousatable-21` détecté.
    - 🔴 Rouge : Tag absent ou appartenant à un tiers.
3. **Popup de Sécurité** : Impossible d'enregistrer un produit Amazon sans valider une alerte de sécurité si le tag est manquant.

---

## 4. 📊 Audit de Contenu & Cohérence Produit

### Nettoyage effectué
- **Suppression des incohérences** : Les produits qui ne correspondaient pas techniquement ou esthétiquement à la vidéo ont été déliés ou supprimés.
- **Organisation par "Familles"** : Recréation d'une hiérarchie logique (Protection Profonde, Patine & Finition, Le Geste Quotidien, etc.).

### État de la Base (25 avril 2026)
- **13 tutoriels** actifs en production.
- **8/15 vidéos** parfaitement liées par `productId`.
- **Points d'attention** : La catégorie "Seconde Jeunesse" (V33 / Rénovateur) nécessite encore la création de fiches produits dédiées dans l'admin pour finaliser le matching 100% ID.

---

## 5. 📱 Optimisation UI/UX & Responsive

- **Layout Mobile** : Refonte de la grille des blocs éditoriaux. Sur mobile, les cartes produits liées passent en mode vertical (`flex-col`) pour préserver la lisibilité de la description courte et du bouton "Découvrir".
- **Tracking des Clics** : Intégration d'un compteur de clics silencieux en base de données pour analyser l'engagement sur chaque tutoriel.

---

## 6. 🔎 Audit Technique v49.6 — Points à Corriger

Audit réalisé sur le commit **`3311ac3` (`v49.6`)**, comparé à **`bc8aa0f` (`v49.5`)**. Le build de production passe avec `npm run build`.

### Constats principaux

1. **Tracking incomplet sur les tutoriels**
   - Le tracking des clics fonctionne sur les cartes produits via `ShopProductCard.jsx`.
   - En revanche, le bouton `Découvrir` du bloc tutoriel dans `ShopView.jsx` est un lien direct vers `linked.affiliateUrl`.
   - Conséquence : ces clics ne déclenchent pas `affiliate_clicks`, ne dispatchent pas `comptoir_product_click`, et ne filtrent pas les clics admin.

2. **Bloc tutoriel masqué si une catégorie a moins de 4 produits**
   - Dans `ShopView.jsx`, le bloc éditorial/tutoriel est rendu uniquement avec la condition `index === 3`.
   - Si une famille a 1, 2 ou 3 produits, ses tutoriels existent mais ne s'affichent jamais.

3. **Fallback Firestore/statique trop brutal**
   - Dès qu'au moins un tutoriel Firestore existe, `ShopView.jsx` vide tous les tutoriels statiques de `FAMILIES`.
   - Une migration partielle peut donc faire disparaître les tutoriels non encore recréés dans Firestore.
   - Le fallback devrait idéalement se faire par catégorie : Firestore prioritaire seulement pour les familles déjà migrées.

4. **Validation du tag Amazon trop permissive**
   - `AdminShop.jsx` valide l'URL avec `url.includes("tag=tousatable-21")`.
   - Des cas comme `tag=tousatable-21bis` ou `notag=tousatable-21` peuvent passer à tort.
   - Une validation via `URLSearchParams` ou regex stricte est recommandée.

5. **KPI "liés à un produit" surestime la réalité**
   - `AdminTutorials.jsx` compte les tutoriels ayant un `productId`.
   - Il ne vérifie pas si ce `productId` correspond encore à un produit existant dans `affiliate_products`.
   - Un produit supprimé serait donc encore compté comme une liaison valide.

6. **Données production non vérifiables dans Git**
   - Les chiffres "13 tutoriels actifs" et "8/15 vidéos liées par productId" relèvent de l'état Firestore.
   - Ils ne sont pas auditables uniquement à partir du commit `v49.6`.

### Points validés

- Le module `AdminTutorials.jsx` est bien ajouté et branché dans l'onglet Boutique.
- Les règles Firestore autorisent bien la lecture publique et l'écriture admin sur `shop_tutorials`.
- Le listener `onSnapshot` de `ShopView.jsx` est bien nettoyé au démontage avec `return () => unsub()`.
- `ProductDetail` reçoit bien `affiliateProducts`, ce qui alimente le module de produits recommandés.
- Le build production passe.

### Actions recommandées

1. Centraliser le clic affilié dans une fonction réutilisable et l'utiliser aussi dans le bloc tutoriel.
2. Afficher le bloc tutoriel après le 4e produit si possible, sinon après le dernier produit de la catégorie.
3. Remplacer le fallback global par un fallback par catégorie.
4. Renforcer la validation Amazon avec un parsing d'URL strict.
5. Calculer les KPIs de liaison avec existence réelle du produit lié.

---

## 🧭 Guide pour le prochain Audit (GPT-5.5)

Si vous auditez ce système, portez une attention particulière à :
1. **Intégrité de la jointure** : Vérifier que `ShopView.jsx` traite correctement les cas où `productId` est présent mais le produit a été supprimé de la collection `affiliate_products`.
2. **Performance `onSnapshot`** : S'assurer que le listener Firestore est bien "unsubscribed" au démontage du composant `ShopView`.
3. **Validation Regex** : La validation du tag `tousatable-21` pourrait être renforcée par une regex plus stricte pour éviter les contournements accidentels (ex: `tag=tousatable-21bis`).
4. **SEO** : Vérifier que les `label` de vidéos injectés dynamiquement sont bien indexables (balises `h3` ou `aria-label`).

---
*Rapport généré par Antigravity — 25/04/2026*

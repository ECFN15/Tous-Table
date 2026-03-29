# Intégration Dashboard & Tracking Affiliation (Boutique)

## 📌 Ce qui a été fait (Fondations data et sécurité)

Nous avons fiabilisé les métriques d'affiliation de la page boutique pour que l'Analytics soit propre et 100% organique.
1. **Exclusion des clics d'Admin (`ShopProductCard.jsx`) :**
   - Import et implémentation de `useAuth()`.
   - Si `isAdmin == true`, le lien d'affiliation s'ouvre normalement vers le site partenaire, mais **aucun appel Firebase n'est effectué**.
   - Seuls les véritables clients génèrent de la donnée de clic, préservant ainsi la pureté des statistiques (le *clickCount* global du produit + la création de l'historique dans `affiliate_clicks`).

2. **Bouton Reset Global (`AdminShop.jsx`) :**
   - Création d'un bouton de purge (rouge) au-dessus de la grille des produits.
   - Utilisation de **`writeBatch`** de Firebase pour remettre le champ `clickCount` de *tous les produits* à zéro en une seule requête optimisée. Très utile pour nettoyer la base après des tests de Quality Assurance (avec comptes non-admin).

---

## 🚀 Prochaine Étape pour Claude : Croisement des Données dans le Dashboard Admin (Data)

**Objectif cible :** Créer un tableau de bord analytique ultra-précis (soit sous forme de modal/sidebar dans `AdminShop`, soit réintégré dans `AdminAnalytics`) pour voir **qui** a cliqué sur **quoi** et **quand**, avec une vraie granularité de ciblage marketing.

**La clé technique : Le `sessionId`**
* Le `ShopProductCard` insère déjà chaque clic dans un document séparé de la collection `affiliate_clicks`.
* Ce document contient un champ magique : `sessionId` (récupéré depuis la variable locale, initiée par l'`AnalyticsProvider` au montage de l'application).
* L'infrastructure actuelle de Live Sessions (gérée par les Cloud Functions et l'IP tracker Backend) capture déjà :
  - L'heure / Durée.
  - La localisation (Ville/IP via le tracker Admin).
  - L'appareil (Desktop, Mobile, Tablette) et le Navigateur / OS.
  - L'identité (Email ou Anonyme).

**Action demandée au relayeur (Claude) :**
Travailler sur le composant Admin d'Analytics (ou un panneau "Insights Affiliation" pour `AdminShop`) qui effectuera les requêtes de rapprochement (`JOIN` logique côté client ou query Firebase).
Il faut créer des vues graphiques / KPIs ou un tableau des derniers Events permettant de visualiser l'historique de clics brut avec les champs combinés provenant du croisement entre `affiliate_clicks` et les `sessions` pour obtenir des taux et comportements utilisateurs profonds.

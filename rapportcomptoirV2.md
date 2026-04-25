# Rapport d'Audit & Refonte V2 : Tracking Affiliation (V49.7)

Ce rapport documente de manière exhaustive l'ensemble des refontes, correctifs, et évolutions apportés au système de tracking des clics d'affiliation depuis la V49.5 jusqu'à la V49.7. 
Ce document est destiné à servir de point de contrôle (audit "GPT 5.5") avant validation finale en production.

---

## 1. Contexte & Problématique Initiale
Le système de tracking d'origine présentait plusieurs défauts majeurs impactant la fiabilité de la data :
- **Perte de session :** Le `sessionId` remontait souvent en "anonyme" ou "indéfini" car il n'était pas persisté correctement au niveau du client lors des clics externes.
- **Manque de contexte (Cross-Selling) :** Un clic sur un produit depuis la grille du comptoir et un clic sur le même produit affiché sous un meuble (Galerie) étaient indifférenciables.
- **Tracking "Fantôme" des Tutos :** Le bouton "Découvrir" des tutoriels n'était pas tracké, faussant l'analyse de rentabilité de ces encarts.
- **Tableau de Bord Incomplet :** Les données existantes n'étaient pas exploitées pour afficher le "Parcours Client par Jour" spécifiquement orienté vers l'affiliation.

---

## 2. Refonte Structurelle (Data Logic)

### A. Centralisation : Création de `trackAffiliateClick`
- **Fichier :** `src/utils/tracking.js`
- **Action :** Création d'une fonction utilitaire unique pour tout le site. 
- **Objectif :** Imposer un schéma strict de données (`productId`, `source`, `sessionId`, `parentFurnitureId`, etc.) et supprimer la logique dupliquée. Cette fonction interroge désormais le `sessionStorage` pour récupérer de manière déterministe l'ID de session analytics.

### B. Persistance de la Session
- **Fichier :** `src/components/shared/AnalyticsProvider.jsx`
- **Action :** Implémentation du stockage persistant du `sessionId` dans le `sessionStorage` du navigateur (`analytics_session_id`).
- **Objectif :** Corrélation forte. Si l'utilisateur a navigué sur 3 pages avant de cliquer sur un produit Amazon, le clic affilié remonte bien à la session globale, permettant la traçabilité.

### C. Migration du DOM Event Listener
- **Fichier :** `AnalyticsProvider.jsx`
- **Action :** Renommage et refonte de l'event. `comptoir_product_click` est devenu `affiliate_product_click`, car le clic n'est plus restreint au Comptoir (il s'applique aussi à la Galerie).

---

## 3. Mise à Jour des Points de Contact (Frontend)

### A. Le Comptoir (Grille de Produits)
- **Fichier :** `src/components/shop/ShopProductCard.jsx`
- **Action :** Refonte totale de la fonction `handleAffiliateClick` pour exploiter le nouvel utilitaire. 
- **Enrichissement :** Le composant accepte maintenant les props `source`, `parentFurnitureId` et `parentFurnitureName`, lui permettant de s'adapter dynamiquement à son contexte d'affichage. Par défaut, la source est `shop_grid`.

### B. Le Comptoir (Tutoriels)
- **Fichier :** `src/pages/ShopView.jsx`
- **Action :** Le lien statique `<a href="...">` du bloc Tutoriel a été intercepté avec un `onClick`.
- **Enrichissement :** Appel de `trackAffiliateClick` avec la source fixée explicitement sur `shop_tutorial`. Le clic est désormais comptabilisé avec la même rigueur que les produits de la grille.

### C. La Galerie (Cross-Selling Produits d'Entretien)
- **Fichier :** `src/designs/architectural/ArchitecturalProductDetail.jsx`
- **Action :** Lors de l'injection des `ShopProductCard` sous les détails d'un meuble, le contexte parent a été forcé.
- **Enrichissement :** Ajout de `source: 'gallery_detail'`, `parentFurnitureId: id`, et `parentFurnitureName: nom_du_meuble`. Ceci permet enfin d'analyser quels meubles déclenchent le plus de ventes additionnelles en produits d'entretien.

---

## 4. Sécurité & Modélisation (Backend)

### A. Mise à jour des `firestore.rules`
- **Fichier :** `firestore.rules`
- **Action :** La collection `affiliate_clicks` restreignait l'écriture aux anciens champs. La règle `hasOnly` a été étendue pour autoriser l'écriture de `source`, `parentFurnitureId`, et `parentFurnitureName`.
- **Objectif :** Sans cette modification, les écritures enrichies depuis le Frontend auraient été violemment rejetées par Firebase (`Permission Denied`).

---

## 5. Exploitation Data (Dashboard Admin)

### A. Refonte de "Boutique Analytics"
- **Fichier :** `src/features/admin/AdminAnalytics.jsx`
- **Action :** Le tableau de bord a été massivement étendu pour ingérer les nouvelles métriques tout en conservant son design Premium.
- **Nouveaux Modules :**
  1. **Source d'Acquisition :** Graphique/Barre listant la proportion de clics venant de la Grille, des Tutos, et de la Galerie.
  2. **Meubles Générateurs :** Classement des meubles parent (cross-selling) ayant généré le plus de clics.
  3. **Flux des Clics Affiliation (Parcours Client par Jour) :**
     - Regroupement des clics par date (Aujourd'hui, Hier...).
     - Sous-regroupement par `Session ID`.
     - Affichage chronologique du "Parcours d'affiliation" de chaque session, précisant l'heure exacte, le nom du produit cliqué, la source, et le meuble associé.
     - **Objectif Ultime :** Visualiser concrètement le tunnel de conversion des affiliés de manière aussi fiable que l'analytics interne.

---

## Bilan
Le système de tracking d'affiliation est passé d'un système passif et aveugle à un **système chirurgical, contextuel et orienté Session**. La data entrante dans Firestore est désormais prête pour de l'analyse poussée, et le tableau de bord Admin reflète immédiatement cette montée en gamme. La compilation (Build Vite) a été vérifiée sans erreur.

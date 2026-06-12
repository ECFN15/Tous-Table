# Documentation — Correction des alertes de données structurées Google Search Console (12 juin 2026)

Ce document retrace l'audit, les corrections apportées et les choix métiers implémentés pour corriger les alertes Google Search Console (GSC) concernant les « Données structurées Fiches de marchand » et les « Extraits de produits » du site Tous à Table.

## 1. Contexte et Problème
Le site Tous à Table affichait visuellement les descriptions de produits ainsi que les estimations de livraison sur ses pages, mais ces informations n'étaient pas structurées sous forme lisible par les robots d'indexation (JSON-LD), provoquant des avertissements non critiques mais importants pour le référencement marchand dans la GSC :
- `shippingDetails` manquant (dans `offers`)
- `hasMerchantReturnPolicy` manquant (dans `offers`)
- Champ `description` manquant (sur les listes de produits `ItemList`)

---

## 2. Solutions Implémentées

### A. Politique de retour (`hasMerchantReturnPolicy`)
Définition d'une politique de retour standard conforme à la vente à distance en France, intégrée dans l'objet `offers` de chaque produit :
- **Délai :** 14 jours (`https://schema.org/MerchantReturnFiniteReturnWindow` avec `merchantReturnDays: 14`).
- **Méthode :** Par voie postale (`https://schema.org/ReturnByMail`).
- **Frais de retour :** À la charge exclusive du client (`https://schema.org/ReturnFeesCustomerResponsibility`).
- **Zone géographique :** France (`FR`).

### B. Détails de livraison (`shippingDetails`)
Définition de frais représentatifs et prudents pour satisfaire les exigences de Google sans induire le client final en erreur :
- **Planches à découper :** 
  - Mode : Mondial Relay.
  - Tarif structuré : `4.90` € (représentatif de la fourchette visible de 0,99 € à 5 €).
- **Mobilier / Meubles anciens :**
  - Tarif structuré : à partir de `20.00` € (tarif de départ pour un très petit meuble).
  - La page `/livraison-meubles-anciens-france` reste la source de vérité visuelle pour les tarifs variables.

### C. Secours de description (`description` fallback)
Génération d'un fallback descriptif propre si la description Firestore est vide :
- **Planches :** `${item.name} sélectionné par Tous à Table Made in Normandie.`
- **Meubles :** `${item.name} restauré par Tous à Table Made in Normandie.`
Ce même fallback est utilisé pour remplir le champ `description` obligatoire sur chaque produit listé dans les schémas `ItemList` des collections.

---

## 3. Parfaite Synchronisation Front / Cloud Functions
Pour éviter tout risque de pénalité de type "cloaking" (double jeu de contenu) et s'assurer que le premier octet HTML servi par le serveur CDN est identique à l'état React hydraté :
- Les données structurées générées côté client par React ([ArchitecturalProductDetail.jsx](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/src/designs/architectural/ArchitecturalProductDetail.jsx)) sont rigoureusement identiques à celles injectées au premier octet par la Cloud Function ([renderPage.js](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/functions/src/seo/renderPage.js)).

---

## 4. Fichiers modifiés
1. **Fiche Produit Client :** [ArchitecturalProductDetail.jsx](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/src/designs/architectural/ArchitecturalProductDetail.jsx)
2. **Premier octet / SSR Robots :** [renderPage.js](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/functions/src/seo/renderPage.js)
3. **Galerie Mobilier & Planches :** [GalleryView.jsx](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/src/pages/GalleryView.jsx)
4. **Le Comptoir :** [ShopView.jsx](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/src/pages/ShopView.jsx)
5. **Livre de bord SEO :** [SEOlivre.md](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/SEOlivre.md) (Chapitre 25)
6. **Point d'entrée IA :** [AGENTS.md](file:///c:/Users/matth/Travail/Tous%20%C3%A0%20Table/AGENTS.md) (Référencement du présent document)

---

## 5. Déploiement et Vérification
- Le preflight de production `npm run preflight:prod` a validé 100% des gates de conformité.
- Déploiement Hosting + Functions effectué le 12 juin 2026 sur le projet `tousatable-client`.

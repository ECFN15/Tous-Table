# 🔍 Rapport d'Audit — Le Comptoir (Marketplace)

**Date** : 25 avril 2026  
**Environnement** : Production (`tousatable-madeinnormandie.fr/#shop`)  
**Projet Firebase** : `tousatable-client`  
**Fichier source** : `src/pages/ShopView.jsx`  
**Données** : `artifacts/tat-made-in-normandie/public/data/affiliate_products` (44 documents)

---

## 📋 Résumé Exécutif

L'audit révèle **3 problèmes critiques** et **5 problèmes modérés** affectant la cohérence entre les vidéos tutoriels et les produits affiliés sur le marketplace.

| Sévérité | Nombre | Description |
|----------|--------|-------------|
| 🔴 Critique | 3 | Produits fantômes, doublons Firestore, matching cassé |
| 🟡 Modéré | 5 | Vidéos génériques, produits sans vidéo, catégorisation douteuse |
| 🟢 OK | 6 | Catégories correctement configurées (Protection Profonde) |

---

## 🔴 Problèmes Critiques

### 1. Produit Bessey en double dans Firestore (Données Corrompues)

Deux documents Firestore existent pour le même produit "Bessey Presse à Vis" :

| Champ | Document `yrnn7qxOuvEDHCMJjAhi` | Document `zDPjzzMFEj3VlXYXN1jE` |
|-------|------|------|
| **Nom** | Bessey GZ60K Presse à Vis Tout Acier (600mm) | Bessey Presse à Vis Tout Acier avec Poignée à Garrot, 600mm/120mm |
| **Catégorie** | ❌ **MANQUANTE** | `outils` |
| **Prix** | ❌ **MANQUANT** | 54,33 € |
| **Image** | ❌ **MANQUANTE** | ✅ Présente |
| **Status** | ❌ **MANQUANT** | `published` |
| **affiliateUrl** | ❌ **MANQUANT** | ✅ Présent |

> **⚠️ DANGER** : Le document `yrnn7qxOuvEDHCMJjAhi` est un **fantôme** — il n'a que 4 champs (name, description, experientialDetail, proTip). Il manque `category`, `price`, `imageUrl`, `status`, `affiliateUrl`, `brand`, `tier`. Ce document ne s'affiche probablement pas sur le site mais pollue la base de données.

**Action requise** : Supprimer le document `yrnn7qxOuvEDHCMJjAhi`.

---

### 2. Pinceau Spalter : Apparaît dans 2 catégories avec des vidéos non pertinentes

Le **Libéron Pinceau Plat 'Le Spalter' (40mm)** (ID: `FqgzmcqqVU1S13Irrn2W`) est enregistré dans Firestore avec `category: "accessoires"`.

Cependant, il est référencé dans **2 sections** du code `FAMILIES` :

| Section | Vidéo associée | Titre YouTube réel | Pertinence |
|---------|---------------|---------------------|------------|
| **Accessoires** (`sVXN8ASgzi4`) | "Choisir le bon pinceau pour vos finitions bois" | *"Woodworking Tips: Finishing - Choosing a Brush for Your Top Coat"* (WoodWorkers Guild Of America) | 🟡 Générique — pas une vidéo constructeur Libéron |
| **Outils** (`yAn3HTURb6U`) | "Sélectionner les bons outils de finition bois" | *"Woodwork Finishing - How To Select the Right Finishing Brush"* (WoodWorkWeb) | 🟡 Générique — pas une vidéo constructeur Libéron |

**Incohérence visible** : Un pinceau d'application (accessoire) se retrouve associé à la section "Outils & Matériel Pro" qui devrait contenir des outils de travail du bois (ciseaux, racloirs, presses). Le produit n'existe qu'en `category: "accessoires"` dans Firestore mais sa carte apparaît quand même dans la section Outils grâce à la recherche globale.

---

### 3. Logique de Matching Fragile (String Comparison)

Le matching produit/vidéo repose sur une comparaison des 20 premiers caractères (ligne 463-466 de ShopView.jsx) :

```javascript
const linked = affiliateProducts.find(p =>
    p.name?.toLowerCase().includes(currentTutorial.productName.toLowerCase().slice(0, 20)) ||
    currentTutorial.productName.toLowerCase().includes((p.name || '').toLowerCase().slice(0, 20))
);
```

**Cas de matching qui échouent ou sont ambigus** :

| Tutorial `productName` | Slice 20 chars | Produit Firestore trouvé ? | Problème |
|------------------------|----------------|---------------------------|----------|
| `"Rubio Monocoat Wood Cleaner"` | `"rubio monocoat wood"` | ❌ **Aucun** — pas de produit "Wood Cleaner" en base | Vidéo orpheline |
| `"V33 Décapant Bois Gel Express (1L)"` | `"v33 décapant bois ge"` | ❌ **Aucun** — pas de produit V33 en base | Vidéo orpheline |
| `"Libéron Rénovateur pour Meubles"` | `"libéron rénovateur p"` | ❌ **Aucun** — pas de produit "Rénovateur" en base | Vidéo orpheline |
| `"Libéron Black Bison Incolore 500ml"` | `"libéron black bison "` | ⚠️ Matche `"Libéron Cire Black Bison \"Antiquaire\""` | Fonctionne par chance |

---

## 🟡 Problèmes Modérés

### 4. Catégorie "Savons" — Vidéo Rubio sans produit correspondant

La vidéo `2PjMXVGfA_k` (*"How to clean your wooden furniture with the All Natural Wood Cleaner | Rubio Monocoat"*) référence le produit `"Rubio Monocoat Wood Cleaner"` qui **n'existe pas** dans la base Firestore. **→ La carte produit sous la vidéo est vide.**

Les produits réels de la catégorie `savons` sont : Blanchon Décapant, Osmo Wash & Care, Libéron Décireur, Starwax Nettoyant, Starwax Savon Marseille, Rampal Latour Savon Noir.

---

### 5. Catégorie "Rénovation" — 2 vidéos sur 2 sans produit correspondant

| Vidéo | Produit référencé dans FAMILIES | Existe en base ? |
|-------|-------------------------------|-----------------|
| `0lAtz_V4Xl4` — *"Utilisation d'un décapant spécial bois V33"* | `V33 Décapant Bois Gel Express (1L)` | ❌ **Non** |
| `GIB3HJeQgp8` — *"The EASIEST Way to Strip Wood!"* | `Libéron Rénovateur pour Meubles` | ❌ **Non** |

> **100% des vidéos de cette catégorie montrent des produits qui ne sont pas vendus sur le site.** L'utilisateur voit un tutoriel sur le décapant V33, mais la carte produit en dessous sera vide.

---

### 6. Vidéos "Génériques" vs "Constructeur"

| Catégorie | Vidéo | Source | Type |
|-----------|-------|--------|------|
| **Protection Profonde** | Rubio Monocoat Oil Plus 2C | Rubio Monocoat USA | ✅ Constructeur officiel |
| **Protection Profonde** | Osmo PolyX Oil | Tyler Brown Woodworking | 🟡 Influenceur spécialisé |
| **Protection Profonde** | John Boos Mystery Oil | Sur La Table | ✅ Revendeur officiel |
| **Patine & Finition** | Patine Libéron | Marine patine | 🟡 Influenceuse |
| **Patine & Finition** | Cire Black Bison | Mr.Bricolage | ✅ Revendeur officiel |
| **Patine & Finition** | Rust-Oleum Chalky | Minnie Moore | 🟡 Influenceuse |
| **Patine & Finition** | Table rivière époxy | Axminster Tools | 🟡 Revendeur |
| **Savons** | Rubio Wood Cleaner | Rubio Monocoat | ✅ Constructeur |
| **Savons** | Rubio Surface Care | Rubio Monocoat | ✅ Constructeur |
| **Accessoires** | Choisir un pinceau | WoodWorkers Guild | ❌ Générique US |
| **Rénovation** | Décapant V33 | Verobrico.fr | 🟡 Influenceur FR |
| **Rénovation** | Strip Wood | Grace In My Space | ❌ Générique US anglophone |
| **Outils** | Finishing Brush | WoodWorkWeb | ❌ Générique US |
| **Outils** | Affûtage racloir | Mathieu DAVID | ✅ Artisan FR |
| **Outils** | Les racloirs | Cray Birkenwald | ✅ Artisan FR |

La catégorie **"Protection Profonde"** est la seule à avoir 100% de vidéos constructeur/revendeur officiel **ET** 100% de matching produit fonctionnel. C'est le standard à atteindre.

---

### 7. Produits sans aucun tutoriel associé

**Huiles** (9 produits, 3 vidéos) — 6 sans vidéo :
- Osmo Polyx-Oil 3032 MAT (incolore) / Satinée
- Star Brite Teak Oil Premium
- John Boos Board Cream
- Blanchon Huile cire bois brut
- Howard Butcher Block Conditioner

**Cires** (7 produits, 4 vidéos) — 3 sans vidéo :
- Libéron Peinture caséine, Bitume de Judée, Libéron Métal Poudré

**Outils** (9 produits valides, 3 vidéos) — 6 sans vidéo :
- Bessey Presse, Kirschen Coffret 6 Ciseaux, Kirschen Col de Cygne, Hazet Grattoir, Racleur BAHCO, Bahco 625

---

### 8. Catégorisation Douteuse

| Produit | Catégorie actuelle | Suggestion |
|---------|-------------------|------------|
| Resin Pro Résine Époxy | `cires` | Discutable — c'est un produit d'assemblage/création |
| Libéron Décireur Professionnel | `savons` | Pourrait être dans `renovation` (c'est un décapant) |
| Blanchon Décapant Dégraissant | `savons` | Pourrait être dans `renovation` |

---

## ✅ Ce qui fonctionne bien

### Catégorie "Protection Profonde" — Standard d'excellence

| Vidéo | Produit référencé | Matching | Vidéo constructeur |
|-------|------------------|----------|-------------------|
| `ictKhF92-pY` | Rubio Monocoat Oil Plus 2C | ✅ | ✅ Rubio Monocoat USA |
| `EZ2w0DBLkTI` | Osmo Polyx-Oil 3032 MAT | ✅ | ✅ Tyler Brown (spécialisé) |
| `KfHoHFA7Av8` | John Boos Mystery Oil | ✅ | ✅ Sur La Table (officiel) |

---

## 🛠️ Plan d'Action Recommandé

### Priorité 1 — Nettoyage de données
1. **Supprimer** le document Bessey fantôme `yrnn7qxOuvEDHCMJjAhi`
2. **Ajouter** les produits manquants en base : `Rubio Monocoat Wood Cleaner`, `V33 Décapant Bois Gel Express`, `Libéron Rénovateur pour Meubles`

### Priorité 2 — Correction du mapping vidéo/produit
3. **Retirer le Spalter** de la section "Outils" dans FAMILIES
4. **Ajouter des vidéos constructeur** pour les catégories "Accessoires" et "Outils"
5. **Remplacer les vidéos anglophones génériques** par des vidéos FR ou constructeur

### Priorité 3 — Refactorisation technique
6. **Remplacer le matching par nom** (`.slice(0, 20)`) par un matching par **ID Firestore** :
```javascript
// AVANT (fragile)
{ productName: "Rubio Monocoat Oil Plus 2C (Pure/Incolore)" }
// APRÈS (robuste)  
{ productId: "Myj3UKhijTH4lMcOx5Uv" }
```
7. **Recatégoriser** le Décireur et le Décapant Blanchon de `savons` vers `renovation`

### Priorité 4 — Enrichissement
8. Trouver des vidéos constructeur pour les 14+ produits sans tutoriel
9. Créer des vidéos "maison" Tous à Table pour les produits phares

---

## 📊 Matrice Complète Vidéo ↔ Produit

| # | Catégorie | VideoId | Produit FAMILIES | Produit Firestore | Match |
|---|-----------|---------|-----------------|-------------------|-------|
| 1 | huiles | `ictKhF92-pY` | Rubio Monocoat Oil Plus 2C | ✅ `Myj3UKhijTH4lMcOx5Uv` | ✅ |
| 2 | huiles | `EZ2w0DBLkTI` | Osmo Polyx-Oil 3032 MAT | ✅ `NdCeO23HWsYTQ012F8St` | ✅ |
| 3 | huiles | `KfHoHFA7Av8` | John Boos Mystery Oil | ✅ `HxO6wzN5vJP1pbMuYkKc` | ✅ |
| 4 | cires | `zhV4UVEC_Gg` | Libéron Teinte Antiquaire | ✅ `q0sdpAOy5LBcrCadFHRv` | ✅ |
| 5 | cires | `sIXtHjSiIRY` | Libéron Black Bison | ⚠️ `O5uxnoMnD5kew6mkx2Ap` | ⚠️ |
| 6 | cires | `lRTlQNcmyig` | Rust-Oleum Chalky Finish | ✅ `CrTsSg5woDt7TFGBUmI0` | ✅ |
| 7 | cires | `wh7EQGOqnfI` | Resin Pro Résine Époxy | ✅ `6pKe1iPGrUJ1v7fDWC6q` | ✅ |
| 8 | savons | `2PjMXVGfA_k` | Rubio Wood Cleaner | ❌ ABSENT | ❌ |
| 9 | savons | `ulx9fAGC7BM` | Osmo Wash & Care | ⚠️ `HMKO41S5LH34YeF5SpeB` | ⚠️ |
| 10 | accessoires | `sVXN8ASgzi4` | Libéron Spalter | ✅ `FqgzmcqqVU1S13Irrn2W` | ✅ |
| 11 | renovation | `0lAtz_V4Xl4` | V33 Décapant Bois | ❌ ABSENT | ❌ |
| 12 | renovation | `GIB3HJeQgp8` | Libéron Rénovateur | ❌ ABSENT | ❌ |
| 13 | outils | `yAn3HTURb6U` | Libéron Spalter (40mm) | ⚠️ Doublon `FqgzmcqqVU1S13Irrn2W` | ⚠️ |
| 14 | outils | `IVAvfGG2lmU` | Bahco 474 / Kit Kirschen | ✅ `Vg71zBP2nPFFhWu6xTdg` | ✅ |
| 15 | outils | `ECMVRc5N3K0` | Kit Premium Kirschen | ✅ `KmtEL1eniy4RiLT06q8i` | ✅ |

**Score global : 8/15 vidéos (53%) correctement liées.** Objectif : 100%.

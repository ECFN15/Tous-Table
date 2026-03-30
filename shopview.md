# Audit Technique & Correction : Espacement Hero Mobile (ShopView)

## Problématique identifiée
Sur les appareils mobiles, une marge verticale excessive (espace vide) apparaissait entre la fin de la description du "Soin du Bois" et le début de la grille de produits. 

Cet espace était matérialisé par une zone morte qui forçait l'utilisateur à scroller inutilement avant d'atteindre les cartes de produits.

## Diagnostic Technique
La section `<section className="hero-section">` dans `ShopView.jsx` utilisait la classe Tailwind suivante :
- `min-h-[100dvh]` (Mobile First)

**Conséquence :** Cette règle imposait à la section Hero de prendre systématiquement **100% de la hauteur de l'écran visible** (Dynamic Viewport Height), même si le contenu textuel et le module d'images étaient courts. Cela "poussait" artificiellement tout le reste de la page vers le bas.

## Solution Implémentée
La modification a consisté à libérer la contrainte de hauteur fixe sur mobile tout en préservant le design sur les écrans plus larges (Laptop/Desktop).

### Modification du Code (`src/pages/ShopView.jsx`)

```diff
- <section className="relative min-h-[100dvh] sm:min-h-[85vh] ...">
+ <section className="relative min-h-fit sm:min-h-[85vh] ...">
```

### Détails des impacts :
1. **Sur Mobile (< 640px) :** 
   - L'utilisation de `min-h-fit` permet au conteneur de s'ajuster exactement à la somme des hauteurs de ses éléments internes (Rituel Bois + Images + Description).
   - L'espace vide indésirable est supprimé.
   - La grille de produits remonte naturellement juste après la description.

2. **Sur Laptop/Desktop (>= 640px) :**
   - La règle `sm:min-h-[85vh]` prend le relais.
   - La mise en page "Editorial" avec une grande respiration verticale et le positionnement du background reste **totalement inchangée**.
   - Aucun impact sur les éléments "Rituel Bois" ou les éléments positionnés de manière absolue.

3. **Intégrité du Design :**
   - Aucun changement n'a été fait sur les composants `WorkshopHero` ou `ShopProductCard`.
   - La structure du background et les dégradés sont préservés.

---
*Document généré le 30 mars 2026 suite à la demande de l'utilisateur.*

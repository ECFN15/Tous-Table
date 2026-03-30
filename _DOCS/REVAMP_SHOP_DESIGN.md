# MASTER PLAN : Revamp Design "L'Atelier" (Boutique Affiliation)

> **Cible** : Claude / Gemini (AI coding assistants)  
> **Objectif** : Transformer la boutique actuelle en une expérience d'achat "Editorial Premium" haute-fidélité.  
> **Exclusion** : La section Hero reste inchangée (validée par l'utilisateur).

---

## 1. VISION ARCHITECTURALE & PROFONDEUR

Le design actuel souffre d'une "platitude" logicielle. Nous devons passer à un système de **superposition de calques (Layering)** inspiré du design "Glassmorphism" et des galeries d'art modernes.

### 🎨 Design System & Tokens
*   **Neutral Palette** : Utiliser `stone-900` pour le dark et `stone-50` pour le light, mais ajouter des variations de transparence (`/80`, `/40`) pour le flou d'arrière-plan.
*   **Shadows (Depth)** : Remplacer les bordures dures par des ombres diffuses :
    - `shadow-premium`: `0 20px 50px -12px rgba(0,0,0,0.25)` en dark mode, plus léger en light.
*   **Glassmorphism** : Utiliser massivement `backdrop-blur-xl` sur tous les éléments flottants (badges, barres de filtres, boutons).

---

## 2. SYSTÈME DE FILTRAGE (RÉEL vs ANCRES)

**Le problème** : Actuellement, les liens "Aller à :" ne sont que des ancres. L'utilisateur doit scroller des kilomètres.  
**La solution** : Une barre de navigation "Sticky" avec un filtrage d'état (State Filtering).

### Spécifications Techniques :
1.  **Sticky Filter Bar** :
    - Position : `sticky top-[88px]` (juste après le header principal).
    - Style : `h-14`, `backdrop-blur-xl`, `border-b border-white/5`.
    - UI : Une ligne horizontale de "Pills" minimalistes.
2.  **Logique de Filtrage** :
    - Au clic sur une catégorie -> Mettre à jour `activeCategory` dans `ShopView.jsx`.
    - La grille doit filtrer les éléments avec une animation de sortie/entrée (`AnimatePresence` de Framer Motion).
    - **Layout Transitions** : Utiliser `layoutId` sur les `ShopProductCard` pour que les cartes se déplacent fluidement vers leurs nouvelles positions.

---

## 3. ARCHITECTURE DE GRILLE (CORRECTION DU "ZOOM")

**Le problème** : 1 colonne mobile = trop gros. 3-4 colonnes desktop = icônes massives.  
**La solution** : Une grille plus dense et mieux proportionnée.

### Breakpoints de la Grille :
*   **Mobile (< 640px)** : `grid-cols-2` (Obligatoire pour éviter l'effet zoomé).
*   **Tablet (640px - 1024px)** : `grid-cols-3`.
*   **Desktop (1024px - 1536px)** : `grid-cols-4`.
*   **Wide (> 1536px)** : `grid-cols-5`.
*   **Spacing** : Réduire le gap à `gap-3` sur mobile et `gap-8` sur desktop pour densifier l'information.

---

## 4. ANATOMIE DE LA "PRODUCT CARD V2"

La carte doit passer d'un bloc standard à un objet de curation premium.

### A. Bloc Visuel (Image)
*   **Ratio** : `aspect-[3/4]` constant pour un look éditorial (plus vertical que le carré actuel).
*   **Bordures** : `rounded-[28px]` (plus rond, plus organique).
*   **Overlay Glass** : 
    - Badge Gamme (Bas-Gauche) : `backdrop-blur-md bg-stone-900/40 text-white`.
    - Badge Programme (Haut-Droit) : `backdrop-blur-md bg-white/10 text-[8px]`.

### B. Hiérarchie Typographique (Highlight)
*   **Brand (La Marque)** : `text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/80`.
*   **Product Name (Le Nom)** : Augmenter à `text-lg` (desktop) / `text-base` (mobile). Police `Cormorant Garamond` avec un interlignage très serré (`leading-none`).
*   **Price** : `font-sans text-[12px] font-medium text-stone-400`.
*   **WhyWeRecommend** : Sortir du bloc texte standard. Utiliser une police `Plus Jakarta Sans` en `11px` avec une opacité de `0.6` pour créer un contraste de texture avec le titre.

---

## 5. EXPÉRIENCE MOBILE (L'ATELIER DANS LA POCHE)

**Le problème** : La sidebar éditoriale à gauche prend trop de place et se répète.  
**La solution** : "Collapsible Editorial Info".

*   **Header de Section** : Au lieu d'un bloc texte massif, utiliser un titre de section qui devient `sticky` au-dessus de la grille avec un fond flou.
*   **Navigation Tactile** : Permettre le "Swipe" latéral sur les catégories dans la barre de filtre.
*   **CTA Action** : Sur mobile, le bouton "Voir l'offre" peut être une icône circulaire flottante ou un bouton pleine largeur minimaliste en bas de carte.

---

## 6. TRANSITIONS & INTERACTIONS (WOW EFFECT)

1.  **Initial Reveal** : Les produits ne doivent pas apparaître d'un coup, mais "glisser" vers le haut avec un `stagger` de 0.05s par ligne.
2.  **Hover State** :
    - Image : `scale-105` (smooth transition 800ms).
    - Card : `shadow-2xl` avec une translation de `-4px`.
    - Apparition d'un bouton de détail rapide (optionnel).
3.  **Loading State** : Skeleton screens utilisant une couleur `stone-800/20` avec un effet de gradient "shimmer".

---

## 📝 CHECKLIST D'IMPLÉMENTATION POUR CLAUDE/GEMINI

- [ ] Modifier `ShopView.jsx` pour intégrer le filtrage d'état (`useState`).
- [ ] Refondre `ShopProductCard.jsx` avec le nouveau système de layering/glass.
- [ ] Implémenter la grille `grid-cols-2` sur mobile dans `ShopView.jsx`.
- [ ] Créer le composant `ShopFilterBar` sticky.
- [ ] Ajouter les animations `Framer Motion` (layout transitions).
- [ ] Vérifier l'accessibilité (contraste des badges glass).

---
*Document généré par Antigravity — Stratégie Revamp Design Maison "Tous à Table"*

# 📋 TODO - Session Prochaine : Fix iOS Jitter (Section 11)

L'objectif est de stabiliser la section **Stacked Cards** sur iOS Safari, en résolvant le conflit entre le moteur `position: sticky` natif et les animations GSAP.

## 🔍 Analyse du Bug (Audit Session 14/02)
- **Phénomène de "Rebond au Plafond"** : La carte tremble lorsqu'elle atteint sa position `top: 21px`. Conflit de précision entre le scroll natif iOS et le calcul de position WebKit.
- **Glitch de Recul (Scaling)** : Lors du passage à la carte suivante, la carte précédente qui réduit sa taille (`scale`) subit des micro-jumps. Safari peine à synchroniser le `sticky` avec une modification d'échelle.
- **Fluidité vs Netteté** : Les tentatives précédentes avec `normalizeScroll` ont montré qu'un fix global peut introduire du flou et une lourdeur sur le scroll général du site.

## 🛠️ Actions à tester (Branche `fix/stacked-cards-ios-v2`)

### 1. Stabilisation du "Plafond"
- [ ] **Passer à `top: 0`** : Remplacer le `top: [21px]` par `top: 0` pour une stabilité mathématique accrue dans WebKit. Compenser visuellement avec un `padding-top` sur le conteneur pour garder l'écart souhaité.
- [ ] **Détection d'ancrage** : Ajouter une classe CSS `.is-stuck` via `ScrollTrigger` pour figer certaines propriétés (comme le `will-change`) au moment précis du contact.

### 2. Optimisation du Rendu (Anti-Jitter)
- [ ] **Remplacer `filter: blur` par `opacity` (Confirmé)** : Le flou est trop coûteux en calcul pendant un scroll sticky sur mobile. L'opacité 0.4 offre un rendu "silk-smooth".
- [ ] **Animation de l'enfant uniquement** : S'assurer qu'aucune transformation (`scale`, `y`) n'est appliquée sur l'élément qui porte la classe `sticky`. Animer exclusivement `.card-visual`.
- [ ] **GSAP `pinType: "transform"`** : Tester de déléguer totalement le blocage des cartes à GSAP au lieu du `sticky` CSS natif pour les navigateurs mobiles.

### 3. Nettoyage et Sécurité
- [ ] **`ignoreMobileResize: true`** : Valider que cette config est active sans dégrader les triggers des autres sections (Manifesto, Process).
- [ ] **Throttle Thightening** : Ajuster le `ResizeObserver` spécifiquement pour iOS pour ignorer les micro-variations de la barre d'adresse Safari.

---
*Branche de travail : `fix/stacked-cards-ios-v2`*
*Dernière mise à jour : 14 Février 2026*

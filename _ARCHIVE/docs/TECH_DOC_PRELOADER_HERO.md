# Documentation Technique : Système d'Animation Preloader & Hero

Ce document détaille la conception, les timings et les optimisations du système d'entrée de la landing page (fichier `src/components/HomeView.jsx`). Il est conçu pour assurer une transition fluide et "Premium" (style Lust/Lumosine) et éviter les saccades au chargement.

---

## 1. Structure du Preloader (JSX)
Le preloader est composé de deux couches principales :
- **`.preloader-secondary-bg`** : Un voile translucide (`#9C8268/20`) qui sert de tampon visuel.
- **`.preloader-overlay`** : Le rideau principal sombre (`#1a1a1a`) contenant le logo et le nom de la marque.

Le texte "TOUS À TABLE" est découpé en caractères individuels (`.preloader-char`) pour permettre une animation lettre par lettre.

---

## 2. Chronologie de la Timeline GSAP (Timings)

L'animation est orchestrée via une timeline GSAP unique dans un `useEffect` lié au chargement des scripts.

### Phase d'Intro (Apparition du contenu)
- **`0.0s`** : Apparition du conteneur (`opacity: 1`).
- **`0.3s`** : L'icône (marteau) apparaît avec un effet de scale et de flou (`blur`) qui s'estompe.
- **`0.5s`** : Les caractères apparaissent un par un (stagger de `0.05s`) avec un glissement vers le haut et un passage du flou à la netteté.
- **`1.5s`** : Pulsation légère de l'ensemble du contenu pour donner un effet de "respiration" avant l'ouverture.

### Phase de Sortie (Le Rideau / Curtain)
- **`Label "exit"`** : Déclencheur du mouvement de sortie.
- **`exit + 0.0s`** : Le rideau secondaire (`secondary-bg`) monte en `1.2s`.
- **`exit + 0.05s`** : Le rideau principal (`overlay`) monte en `1.2s` avec un léger décalage (effet de profondeur).

### Phase de Révélation Hero (Synchro)
- **`exit + 0.8s`** : Révélation du titre "Le Geste & L'Âme" (`.reveal-inner`).
    - **Note Cruciale** : Elle commence **pendant que le rideau finit de s'ouvrir**, créant une continuité visuelle parfaite.
    - **Effet** : Montée verticale + remise à zéro d'une légère rotation (2°) pour un effet de souplesse.
- **`exit + 1.2s`** : Apparition des éléments du footer (Explorer, Localisation).

---

## 3. Optimisations de Performance (Anti-Saccades)

Le projet utilise plusieurs techniques pour garantir une fluidité totale même sur des machines moins puissantes :

### Verrouillage du Scroll
Pendant tout le chargement, `document.body.style.overflow` est fixé à `'hidden'`. Il n'est libéré qu'à la fin de la timeline.

### Priorité GPU (Accélération Matérielle)
Les éléments du Hero utilisent :
- `force3D: true` dans GSAP.
- `will-change: transform` en CSS.
Cela force le navigateur à traiter le texte comme une image texturée gérée par le GPU, évitant les saccades de rendu de texte standard.

### Le "Safe Refresh" de ScrollTrigger (Délai de 500ms)
C'est le point le plus important pour la fluidité :
- `ScrollTrigger.refresh(true)` est appelé **500ms APRÈS** la fin des animations.
- **Pourquoi ?** Si on rafraîchit pendant que le titre monte, le CPU est surchargé par le calcul des positions de toute la page, ce qui crée des micro-coupures ("jank"). En décalant le refresh, le titre monte dans un environnement CPU calme.

---

## 4. Maintenance / Modification
Si vous devez ajuster les timings :
- Modifiez les valeurs de `stagger` dans `tl.to('.hero-section .reveal-inner', ...)` pour ralentir l'apparition du titre.
- Ajustez le label `"exit+=0.8"` pour faire apparaître le titre plus tôt ou plus tard par rapport au rideau.
- Ne jamais supprimer le `setTimeout` de 500ms sur le `ScrollTrigger.refresh()`.

---
*Document généré par Antigravity pour la continuité du projet Tous à Table.*

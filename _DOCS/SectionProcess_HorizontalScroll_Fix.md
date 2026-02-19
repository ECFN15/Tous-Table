# Documentation Technique : Scroll Horizontal & "Rollback" Fix (Section Process)

**Date :** 19 Février 2026
**Composant concerné :** `ProcessSection.jsx` (Vue Desktop > 1920px)
**Technologies :** React, GSAP (ScrollTrigger)

---

## 1. Le Phénomène "Rollback" (Problème)

### Symptôme
Lorsqu'un utilisateur scrollait rapidement vers le bas à travers la section horizontale "Le Processus" :
1.  Le défilement horizontal des cartes se faisait.
2.  Arrivé à la dernière carte (V. L'Éclat), au moment précis où le scroll vertical reprenait le dessus pour sortir de la section...
3.  **Le contenu faisait un saut brutal ("Jerk") en arrière vers la gauche**, comme s'il n'avait pas fini sa course, ou revenait à une position précédente.

### Cause Technique
Ce phénomène est dû à la **désynchronisation entre l'inertie du scroll (Scrub) et le moment du "Unpin" (Relâchement)** par ScrollTrigger.

*   Si l'utilisateur scrolle vite, l'animation GSAP (`x: -scrollDistance`) essaie de rattraper le retard avec le `scrub: 1` (inertie).
*   Cependant, le ScrollTrigger avait une fin définie (`end: +=totalDistance`).
*   Si le scroll vertical dépassait cette fin *avant* que l'inertie de l'animation horizontale n'ait atteint 100% de sa valeur cible (`-scrollDistance`), ScrollTrigger "relâchait" (unpin) le conteneur.
*   Résultat : GSAP stoppait l'animation en cours de route ou tentait de forcer la position finale, créant ce conflit visuel.

---

## 2. La Solution : Le "Landing Runway" (Buffer)

Pour corriger cela, nous avons introduit un **tampon de sécurité (Buffer)** à la fin de la timeline de scroll.

### Concept
L'idée est de dire à ScrollTrigger :
> *"Continue de bloquer (Pin) l'écran pendant X pixels supplémentaires APRÈS la fin théorique de l'animation, juste au cas où il y aurait de l'inertie à purger."*

### Implémentation (`ProcessSection.jsx`)

```javascript
// 1. Calcul de la distance réelle
const scrollDistance = content.scrollWidth - window.innerWidth;
const scrollSpeed = 3.5;
const totalDistance = scrollDistance * scrollSpeed;

// 2. LE FIX CRITIQUE : EndBuffer
// Ancienne valeur : 0 ou 400 (TROP COURT pour un scroll rapide)
// Nouvelle valeur : 800 (POINT D'ÉQUILIBRE)
const endBuffer = 800; 

ScrollTrigger.create({
    trigger: wrapper,
    start: "top top",
    // On ajoute le buffer à la fin de la durée de vie du Pin
    end: () => "+=" + (totalDistance + endBuffer), 
    pin: true,
    // ...
    // Ceinture de sécurité ultime :
    // Si on quitte vraiment trop vite, on force la position finale
    onLeave: () => {
        gsap.set(content, { x: -scrollDistance });
    }
});
```

### Pourquoi 800px ?
*   **< 400px** : Le saut persistait lors des scrolls violents.
*   **> 1000px** : L'utilisateur avait l'impression que le site était "bloqué" à la fin, avec une pause inutile avant de pouvoir descendre.
*   **800px** : C'est le "Sweet Spot". L'inertie se termine fluidement, l'image se fige proprement, et le scroll vertical reprend naturellement.

---

## 3. Maintenance Future

Si le problème réapparaît (par exemple si on change la vitesse du scrub) :
1.  **Augmenter `endBuffer`** par pas de 200px.
2.  Vérifier que `onLeave` contient bien le `gsap.set` pour forcer la propreté.
3.  Ne **jamais** supprimer le buffer si `scrub` est > 0.

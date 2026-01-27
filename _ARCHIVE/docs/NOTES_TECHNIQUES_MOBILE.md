# Note Technique : Optimisation Mobile Plein Écran (Full Screen)

Ce fichier documente les techniques utilisées pour obtenir un rendu "Application Native" immersif sur les navigateurs mobiles (iOS et Android), en supprimant les marges blanches et les zones de sécurité par défaut.

## 1. Le Problème
Par défaut, les navigateurs mobiles affichent les sites web dans une "Safe Area" (zone de sécurité).
Cela crée des bandes (souvent blanches ou noires) en haut et en bas de l'écran pour éviter que le contenu ne soit caché par :
*   L'encoche de la caméra (Notch) sur les iPhone et certains Android.
*   La barre de navigation système (boutons retour/accueil virtuels) en bas de l'écran.
*   Les coins arrondis de l'écran.

## 2. La Solution : `viewport-fit=cover`

Pour contourner ce comportement et utiliser 100% de la surface de l'écran, nous avons modifié la balise `meta viewport` dans le fichier `index.html`.

**Code ajouté :**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**Explication :**
L'attribut `viewport-fit=cover` indique au navigateur d'étendre le contenu de la page ("canvas") pour couvrir l'intégralité de l'écran, même les zones qui se trouvent derrière les barres système ou l'encoche.

## 3. La Touche Finale : `theme-color`

Pour que l'illusion soit parfaite, nous avons aussi forcé la couleur de la barre d'adresse du navigateur (la barre tout en haut avec l'URL).

**Code ajouté :**
```html
<meta name="theme-color" content="#1a120b" />
```

**Explication :**
Cela teint la barre d'interface du navigateur (Chrome, Safari) de la même couleur que le fond de notre application (`#1a120b` est notre noir profond). Ainsi, la limite entre l'application et le navigateur devient invisible.

---

## Résumé pour le futur
Si jamais des bandes blanches réapparaissent sur un nouveau projet mobile :
1.  Vérifier que `viewport-fit=cover` est bien présent dans le `<head>`.
2.  Vérifier que le `theme-color` correspond bien à la couleur de fond principale du site.

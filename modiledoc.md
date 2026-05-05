# Mobile Hero Viewport Fit

## Contexte

Sur mobile, la page Galerie affichait une bande noire en bas du premier ecran, juste apres le hero. Ce n'etait pas un probleme de cadrage horizontal de l'image, mais un probleme de hauteur du hero : la section suivante commencait trop tot dans le viewport.

## Fix applique

Fichier concerne :

```txt
src/designs/architectural/MarketplaceLayout.jsx
```

Le hero mobile utilise maintenant :

```css
min-height: calc(100svh - 4rem);
```

Le meme calcul est applique au conteneur interne du hero, pour que l'image de fond et le contenu editorial partagent la meme hauteur.

## Explication technique

`100svh` represente la hauteur du petit viewport mobile. C'est plus fiable que `100vh` sur mobile, car les navigateurs peuvent afficher ou masquer leurs barres d'interface pendant le scroll.

`4rem` correspond a la hauteur du header mobile :

```txt
h-16 = 4rem
```

Donc le calcul revient a dire :

```txt
hauteur du hero = hauteur visible de l'ecran - hauteur du header
```

Resultat :

```txt
header + hero = premier ecran complet
```

La section noire suivante ne doit donc plus apparaitre au premier affichage mobile.

## Pourquoi ne pas deplacer ou zoomer l'image

Un premier essai avait utilise un deplacement visuel de l'image avec `translate-y` et un leger `scale`. Cette solution n'etait pas ideale, car le `scale` agrandissait aussi l'image en largeur.

La bonne correction etait de redonner au hero la bonne hauteur, plutot que de forcer l'image a masquer le probleme.

## Portee responsive

Le changement cible uniquement les petits ecrans. Les hauteurs tablette et desktop restent pilotees par les breakpoints existants :

```txt
md:min-h-[560px]
lg:min-h-[620px]
```

Le fix est donc adapte aux mobiles sans modifier le rendu desktop.

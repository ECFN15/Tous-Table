# Livraison - audit UI mobile

Date : 2026-05-08

Perimetre : page publique `/livraison-meubles-anciens-france`, composant `src/pages/DeliveryView.jsx`.

## Structure auditee

- Header global : `ArchitecturalHeader`, `sticky`, hauteur mobile `h-16`. Il prend deja de la place dans le flux.
- Hero livraison : section principale en flow normal, puis bloc `border-b`.
- Carte particulaire : composant `DeliveryParticleMap`, section en flow normal avec grille mobile mono-colonne.
- Zones : grille de cartes en flow normal.
- Methode : grille + liste separee par `divide-y`.
- FAQ : bloc final en flow normal.

## Systeme d'ancrage

Tous les modules de contenu de la page livraison sont dans le flux normal. Les trous mobiles venaient donc du cumul des paddings verticaux successifs :

- hero `pt-24` puis `pb-12` ;
- carte `py-14` ;
- sections suivantes `py-10` a `py-12` ;
- gaps internes `gap-10`, `mb-8`, `py-7`.

Comme l'objectif est de rapprocher les modules entre eux, la correction se fait sur les `padding`, `margin` et `gap` mobiles des wrappers de section. Les valeurs desktop restent preservees avec `md:`.

## Corrections appliquees

- Hero : reduction du haut mobile de `pt-24` a `pt-4 sm:pt-6`, car le header sticky occupe deja 64px dans le flux.
- Hero : reduction du rythme interne mobile (`py-10` vers `py-7`, `gap-10` vers `gap-7`, badge `mb-6` vers `mb-4`).
- Hero desktop : suppression de la bordure haute (`border-y` vers `border-b`) et reduction du haut desktop de `md:pt-28` a `md:pt-12 lg:pt-14`, avec `md:py-14` ramene a `md:py-10`.
- Carte particulaire : section mobile passee de `py-14` a `py-6`, grille de `gap-8` a `gap-6`.
- Texte et metriques carte : reduction des `mb/mt` mobiles, conservation des espacements desktop.
- Cartes zones : section mobile passee de `py-10` a `py-6`, padding interne `p-6` a `p-5`, espacements internes reduits.
- Methode : section mobile passee de `py-12` a `py-6`, gap et lignes reduits sur mobile.
- FAQ : section mobile passee de `py-12` a `pt-6 pb-8`, titre `mb-10` a `mb-7`, lignes `py-6` a `py-5`.

## Validation

A lancer apres modification :

```bash
npm run build
```

Reste a faire : smoke visuel mobile sur navigateur reel pour confirmer le calibrage exact des marges.

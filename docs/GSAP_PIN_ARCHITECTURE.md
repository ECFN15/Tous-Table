# 🏗️ Architecture GSAP — Pin, ScrollTrigger & Migration CDN → npm

> **Date** : 12 Février 2026  
> **Contexte** : Migration des scripts GSAP/Lenis du CDN vers npm, résolution du conflit `pin: true` × StackedCards au breakpoint 1536px.

---

## 📖 Résumé

Le site utilise **GSAP ScrollTrigger** pour orchestrer plus de 15 animations liées au scroll dans la HomeView. L'animation la plus complexe est le **scroll horizontal** de la section Process, qui utilise `pin: true` à partir de **1536px** (breakpoint Tailwind `2xl`).

Lors de la migration du chargement GSAP depuis le CDN vers npm, un conflit critique est apparu entre le `pin: true` du Process et les animations `scrub` des StackedCards. Ce document explique le problème, pourquoi il était si difficile à diagnostiquer, et la solution appliquée.

---

## 🧩 L'Architecture "Deux Instances" (Avant la Migration)

Avant la migration, le site utilisait **deux instances GSAP séparées** :

```
┌──────────────────────────────────┐     ┌──────────────────────────────┐
│       HomeView.jsx (CDN)         │     │   StackedCards.jsx (npm)     │
│                                  │     │                              │
│  window.gsap (CDN v3.12.5)       │     │  import gsap from 'gsap'    │
│  window.ScrollTrigger (CDN)      │     │  import { ScrollTrigger }   │
│  window.Lenis (CDN v1.0.42)      │     │                              │
│                                  │     │                              │
│  ScrollTrigger Registry A:       │     │  ScrollTrigger Registry B:   │
│  • Theme Colors (×6)             │     │  • Card Blur/Scale (×3)      │
│  • Parallax Manifesto            │     │  • Last Card Exit            │
│  • Process Pin (>=1536px)        │     │                              │
│  • Process Card Anims            │     │                              │
│  • Data Counters                 │     │                              │
│  • Team Reveal                   │     │                              │
│  • 3D Background Fade            │     │                              │
└──────────────────────────────────┘     └──────────────────────────────┘
         INSTANCE A (CDN)                       INSTANCE B (npm)
         Aucune communication                   Aucune communication
```

**Pourquoi ça marchait :** Les deux registres ScrollTrigger étaient **totalement isolés**. Le `pin: true` du Process section existait dans le Registre A, et les StackedCards dans le Registre B. Ils ne savaient rien l'un de l'autre. Chacun calculait ses positions indépendamment par rapport au DOM natif.

---

## 🔀 L'Architecture Unifiée (Après la Migration)

Après la migration CDN → npm, tout partage la même instance :

```
┌─────────────────────────────────────────────────────────┐
│              Instance GSAP Unique (npm)                  │
│                                                         │
│  import gsap from 'gsap'                                │
│  import { ScrollTrigger } from 'gsap/ScrollTrigger'    │
│  import Lenis from '@studio-freight/lenis'              │
│                                                         │
│  ScrollTrigger Registry UNIFIÉ:                         │
│  ┌─── HomeView ───────────────────────────────────┐    │
│  │ • Theme Colors (×6)                             │    │
│  │ • Parallax Manifesto                            │    │
│  │ • Process Pin (>=1536px) ← refreshPriority: 1   │    │
│  │ • Process Card Anims                            │    │
│  │ • Data Counters                                 │    │
│  │ • Team Reveal                                   │    │
│  │ • 3D Background Fade                            │    │
│  └────────────────────────────────────────────────┘    │
│  ┌─── StackedCards ───────────────────────────────┐    │
│  │ • Card Blur/Scale (×3) ← refreshPriority: -1   │    │
│  │ • Last Card Exit      ← refreshPriority: -1    │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 💥 Le Problème : `pin: true` au Breakpoint 1536px

### Qu'est-ce que `pin: true` ?

Quand GSAP `pin` une section, il :

1. **Fixe** l'élément en position `fixed` pendant le scroll
2. **Injecte un spacer div** dans le DOM pour compenser l'espace occupé
3. **Décale** tous les éléments après le pin dans le flux du document

```
SANS PIN (< 1536px) :          AVEC PIN (>= 1536px) :
                               
┌──────────┐                   ┌──────────┐
│  Hero    │                   │  Hero    │
├──────────┤                   ├──────────┤
│ Manifesto│                   │ Manifesto│
├──────────┤                   ├──────────┤
│ Process  │ ← flex-row        │ Process  │ ← position: fixed
│ (normal) │   (court)         │ (pinned) │   pendant scroll
├──────────┤                   ├──────────┤
│          │                   │ SPACER   │ ← div injecté par GSAP
│ Stacked  │                   │ (~3.5×   │   (crée du scroll "vide")
│ Cards    │                   │ largeur) │
│          │                   ├──────────┤
├──────────┤                   │ Stacked  │ ← position décalée !
│  Data    │                   │ Cards    │
│  Team    │                   ├──────────┤
│  FAQ     │                   │  Data    │
└──────────┘                   │  Team    │
                               │  FAQ     │
                               └──────────┘
```

### Pourquoi ça cassait les StackedCards

Avec **deux instances séparées** (avant migration) :
- Le Registre B (StackedCards) ne savait pas que le pin existait
- Il calculait les positions par rapport au **DOM brut** (y compris le spacer)
- Les positions étaient **naturellement correctes** car le spacer fait partie du DOM

Avec **une seule instance** (après migration) :
- ScrollTrigger SAIT qu'il y a un pin dans le registre
- Il essaie d'**ajuster automatiquement** les positions des triggers suivants
- MAIS l'ordre de recalcul comptait : si les StackedCards se recalculaient **avant** le pin, elles ne prenaient pas en compte le bon décalage
- Résultat : positions **décalées** → animations `scrub` à la mauvaise progression → cartes floues/petites

---

## ✅ La Solution : `refreshPriority`

GSAP ScrollTrigger supporte un système de **priorité de rafraîchissement** :

```
refreshPriority:  1  →  Se recalcule EN PREMIER  (pins)
refreshPriority:  0  →  Défaut
refreshPriority: -1  →  Se recalcule EN DERNIER  (triggers dépendants)
```

### Implémentation

**Dans `HomeView.jsx`** — Section Process (pin) :
```jsx
scrollTrigger: {
    trigger: ".process-wrapper",
    pin: true,
    scrub: 1,
    refreshPriority: 1,  // ← "Je réserve mon espace EN PREMIER"
    // ...
}
```

**Dans `StackedCards.jsx`** — Animations des cartes :
```jsx
scrollTrigger: {
    trigger: card,
    scrub: 0.5,
    refreshPriority: -1,  // ← "Je me calcule APRÈS les pins"
    // ...
}
```

### Séquence de `ScrollTrigger.refresh()` :

```
1. GSAP collecte tous les ScrollTriggers du registre
2. Trie par refreshPriority (du + élevé au - élevé)
3. Process Pin (priority: 1)  → Se calcule → Injecte le spacer → Note le décalage
4. Theme Colors (priority: 0) → Se calculent → OK
5. StackedCards (priority: -1) → Se calculent → Intègrent le décalage du pin → ✅ Positions correctes
```

---

## ⚠️ Autres Configs CDN Retirées

Deux configs globales qui étaient safe sur le CDN (instance isolée) mais **dangereuses** sur l'instance partagée ont été retirées :

| Config | Effet | Pourquoi c'était dangereux |
|---|---|---|
| `ScrollTrigger.config({ ignoreMobileResize: true })` | Désactive le refresh auto sur petits changements de viewport | Empêchait le refresh quand l'utilisateur redimensionnait la fenêtre — les StackedCards gardaient des positions périmées |
| `gsap.ticker.lagSmoothing(0)` | Désactive la compensation de lag | Affectait les animations `scrub` des StackedCards qui dépendent du timing précis du ticker |

---

## 📁 Fichiers Modifiés

| Fichier | Changement |
|---|---|
| `vite.config.js` | `manualChunks` — Regroupe GSAP, Three.js, Firebase, Lucide-react en chunks dédiés |
| `HomeView.jsx` | Import npm de GSAP/ScrollTrigger/Lenis au lieu du CDN. `refreshPriority: 1` sur le pin |
| `StackedCards.jsx` | `refreshPriority: -1` sur tous les ScrollTriggers. Ajout d'un resize handler pour re-init |

---

## 🧪 Comment Tester

1. **Ouvrir localhost:5173** en plein écran desktop (>= 1536px)
2. **Scroller** jusqu'à la section Process → le scroll horizontal doit fonctionner
3. **Continuer** jusqu'aux StackedCards → les cartes doivent s'empiler sans flou prématuré
4. **Redimensionner** la fenêtre à < 1536px → la section Process passe en vertical, les cartes doivent rester propres
5. **Re-agrandir** à >= 1536px → tout doit se recalibrer automatiquement

---

## 📐 Architecture de Scroll de la Homepage

```
Section                    | ScrollTrigger(s)         | Breakpoint        | Priority
---------------------------|--------------------------|-------------------|----------
Hero (ThreeBackground)     | Opacity fade (scrub)     | Tous              | 0
                           | Pause trigger (event)    | Tous              | 0
Manifesto                  | Theme color              | Tous              | 0
                           | Image parallax           | Desktop (>=1024)  | 0
                           | Text reveal              | Mobile (<1024)    | 0
Process                    | Theme color              | Tous              | 0
                           | Horizontal scroll (PIN)  | Desktop (>=1536)  | 1 ★
                           | Card animations          | Tous              | 0
                           | Vertical reveal          | Tablet (<1536)    | 0
Featured (StackedCards)    | Theme color              | Tous              | 0
                           | Card blur/scale (×N)     | Tous              | -1 ★
                           | Last card exit           | Tous              | -1 ★
Data                       | Theme color              | Tous              | 0
                           | Counter animation        | Tous              | 0
Team                       | Theme color              | Tous              | 0
                           | Editorial reveal         | Tous              | 0
FAQ                        | Theme color              | Tous              | 0
```

★ = `refreshPriority` explicitement défini pour garantir l'ordre de calcul.

---

## 🔑 Leçons Retenues

1. **Deux instances GSAP séparées = isolation accidentelle.** Quand CDN et npm coexistent, ils créent des registres ScrollTrigger indépendants. Ça "marche" mais c'est fragile et non-documenté.

2. **`pin: true` est le trigger le plus invasif de GSAP.** Il modifie le DOM, crée des spacers, et affecte les positions de TOUT ce qui vient après. Avec des instances séparées, cet impact était invisible aux autres composants.

3. **`refreshPriority` est la solution officielle GSAP** pour gérer l'ordre de recalcul entre sections pinnées et sections dépendantes. C'est documenté mais rarement nécessaire quand on n'a qu'une seule section pinnée.

4. **Toujours tester les breakpoints critiques** après une refonte d'architecture. Le bug n'était visible qu'à >= 1536px parce que c'est là que le `pin: true` s'active via `gsap.matchMedia()`.

---
name: Premium Dashboard UI/UX Architect
description: Expert frontend capable de reproduire des dashboards SaaS Dark Mode ultra-premium (style Celoci Inc.). Documentation stricte des tokens Tailwind, de la grille Bento, et des composants graphiques (SVG, Scrubbing, Glassmorphism).
---

# 🎨 Apprentissage & Design System : Premium Dark Dashboard

Ce skill documente les règles strictes d'UI/UX pour concevoir ou reproduire l'esthétique du dashboard "Celoci Inc." visible en référence. En tant qu'agent IA, tu DEUX utiliser ces guidelines à la lettre pour chaque nouveau module ou widget créé sur un environnement similaire. La règle d'or est le contraste absolu, la suppression des conteneurs redondants et l'utilisation quasi exclusive du vide pour border les éléments.

## 1. Design Tokens Principaux (Tailwind CSS)

### Palette de Couleurs (Dark Mode Natif & Exclusif)
- **App Background (Canvas)** : `bg-[#0a0a0a]` (ou noir pur `#000000`).
- **Surface (Widgets/Cards)** : `bg-[#161616]` à `bg-[#1a1a1a]`. Pas de dégradé sur le fond des cartes, couleur unie mate.
- **Accents (Primary)** : **Neon Blue** (`#3B82F6` ou plus saturé `#2563EB`). Utilisé pour la data hero, les barres actives, les glow effects et le bouton d'appel principal (ex: "Share").
- **Accents (Positive/Success)** : **Toxic Green** (`#22C55E`). Strictement réservé aux métriques de croissance (ex: `+$32,482`).
- **Bordures (Subtiles)** : `border border-white/5` ou `border-[#262626]`. Surtout pas de bordures visibles d'un trait épais, elles doivent juste délimiter la carte en douceur. 
- **Texte Primaire (Hero Data)** : `text-white` pur.
- **Texte Secondaire (Labels/Subtitles)** : `text-white/50`, `text-[#a1a1aa]`.

### Typographie & Lisibilité
La hiérarchie repose sur l'écart dramatique entre les tailles de police :
- **KPI principal (ex: $553,000)** : `text-4xl md:text-5xl font-semibold tracking-tight text-white`
- **Titre de Widget (ex: Product overview)** : `text-xs md:text-sm font-medium text-white/50 mb-4`
- **Lien d'action (ex: See more details →)** : `text-xs font-semibold text-blue-500/80 hover:text-blue-400 mt-auto`

## 2. Architecture Layout (Grille Bento)

Le layout global est un "Bento Grid" asymétrique.
- **Widgets Standard** : Toujours encadrés de padding généreux `p-6` ou `p-8`. Coins très arrondis `rounded-2xl` ou `rounded-3xl`.
- **Alignement (Flexbox)** : Les KPIs sont en haut (titre puis immense chiffre). En dessous, un mini-graphique (Sparkline/Doughnut) posé sur la droite ou centré horizontalement au choix du design.
- **Pas d'Ombres (Drop Shadows)** : Sur un fond noir pur, l'élévation via `shadow-xl` est inutile. L'élévation est créée uniquement par la différence de gris entre le Canvas (`#0a0a0a`) et la Surface (`#161616`).

## 3. Implémentation Front-end des Composants (Micro-UI)

### A. Graphique Principal (Area/Line Chart "Analytics")
Ce graphique dicte l'aspect visuel du tableau de bord.
1. **Zebra Striped Area (Rayures diagonales)** : L'aire colorée sous la courbe ne doit PAS être un aplat semi-transparent basique. Un `<pattern>` SVG composé de lignes obliques sombres (`stroke="rgba(255,255,255,0.03)"`) doit remplir l'aire de progression.
2. **Le Mode "Scrubbing" (Survol interactif)** : L'élément actif n'est pas un simple "Dot" (Point). C'est une **Pilule bleue verticale** (Pill-shaped `<rect>`) qui recouvre toute la zone de donnée active, avec son chiffre affiché en haut de la pilule. L'utilisateur glisse le doigt/souris horizontalement pour changer la pilule de place. Un filtre Glow (`feGaussianBlur`) colore légèrement les alentours de la pilule.
3. **Axes Inexistants** : La ligne Y n'existe pas. Les valeurs en ordonnées (`$5k, $4k...`) sont positionnées librement à gauche, presque invisibles (`text-[9px] text-white/30`). La ligne de séparation horizontale n'est qu'un léger tiret ou invisible (`strokeDasharray="2 4"`).

### B. Contrôles et Filtres (Pills & Dropdowns)
- **Top Actions (Filters, + Add Widget)** : Boutons "Ghost" très sombres. `bg-[#1e1e1e] hover:bg-[#262626] border border-white/5 text-xs px-3 py-1.5 rounded-full flex gap-2 items-center transition-colors`.
- **Sélecteur de Période (This month v)** : Petit dropdown compact imbriqué dans l'en-tête de la carte (à l'opposé du titre).
- **Tabs (Onglets ex: AI Services | Marketing)** :
  - **Container** : `bg-[#111] p-1 rounded-lg border border-white/5`. Comporte un arrière-plan rayé verticalement (`repeating-linear-gradient`).
  - **Active Tab** : Un encart bleu "Vibrant" avec background opacité très faible (`bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-md`).
  - **Inactive Tab** : Se fond dans le container (Text muted gris clair).

### C. Graphiques Alternatifs (Micro-Widgets)
- **Sparklines (Active sales - Barres hachurées)** : De simples barres épaisses (`rx="999"`) au format SVG posées à la droite du KPI principal. Pas d'axe, uniquement pour montrer une tendance visuelle.
- **Arc/Gauge Chart (Sales performance)** : Double ou triple anneaux (cercles incomplets) se superposant. Un trait bleu saturé pour le pourcentage cible. L'espace au centre affiche fièrement la valeur gigantesque (`16.3%`).
- **Heatmap Vectorielle (Total visits by hourly)** : Au lieu d'un Line Chart standard, utilisation d'une matrice (comme l'activité GitHub). La couleur varie en opacité (`bg-blue-500/20` à `bg-blue-500/100`).

### D. Tableaux Clean (Top Products)
- **Design Borderless** : Zéro trait séparateur horizontal ou vertical. La clarté vient de l'espace blanc (ou noir ici).
- L'en-tête des colonnes est en microscopique `text-[10px] uppercase text-white/40 tracking-wider`.
- Le contenu textuel est minimaliste. Les alignements sont justifiés à gauche de façon rigoureuse. L'espace inter-lignes est massif (`py-4`).

## 4. Règles de Conduite IA pour la Prochaine Édition
Lorsque l'utilisateur demande "Crée un nouveau widget Dashboard" :
1. N'essaie pas d'utiliser Recharts ou Chart.js qui viendront polluer le DOM avec des rectangles ou des tooltips par défaut impossibles à tuner finement.
2. Écris toujours des **Composants SVG Customisés (from scratch)** de type `TrafficChart` que nous avons construit, car c'est la seule façon d'intégrer des grilles fantômes, des "Pilules" de focus (Scrubbing pills au lieu de Tooltips classiques) et des Patterns "Striped" dans l'area.
3. Toujours chercher le contraste pur (texte blanc pur sur fond `#161616` profond) plutôt que l'ajout d'icônes inutiles ou d'encarts colorés pleins.

**Signature du Design :** Noir Abyssal (#0A0A0A) / Gris Mat (#161616) / Néon Bleu (#3B82F6) / Ghost White-Borders (white/5). Aucun compromis.

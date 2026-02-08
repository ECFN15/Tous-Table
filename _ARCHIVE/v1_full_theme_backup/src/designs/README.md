# Designs Architecture

Ce dossier contient les différents "Design Systems" de l'application.

Chaque sous-dossier (ex: `standard/`) est un module autonome qui doit contenir :
- `components/` : Les composants visuels spécifiques (ProductCard, Grid, etc.)
- `manifest.json` : La configuration du design (Nom, Description, Features supportées).

## Design actuel : `standard`
Le design "Atelier Normand" original, utilisant des cartes avec bordure arrondie, typographie Serif/Mono et effets de flou (Glassmorphism).

Pour ajouter un nouveau design, dupliquez le dossier `standard/` et modifiez les composants JSX sans toucher à la logique métier (Hooks, Contexts).

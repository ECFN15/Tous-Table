# Audit & Architecture V2 : Le "Shard" System

## 1. La Vision : "Un Site dans le Site"

L'objectif est de passer d'un système de **Thèmes** (changement cosmétique) à un système de **Designs/Shards** (changement structurel et fonctionnel).

Chaque Design (`standard`, `architectural`, `futuristic`, etc.) doit être une instance autonome qui décide de ses propres fonctionnalités, scripts et logique métier, sans polluer les autres.

## 2. Problème Actuel : Le "Fat Controller"

Actuellement, `GalleryView.jsx` agit comme un parent unique qui charge tout pour tout le monde :
- Il charge le Hook des `Likes` (Connexion Firestore en temps réel).
- Il charge la logique de `Commentaires`.
- Il transmet tout cela aux enfants.

**Conséquence** : Si le design "Architectural" se veut minimaliste et sans système social (pas de like, pas de comm), il subit quand même le poids du code et des écoutes réseau du design "Standard". Ce n'est pas optimisé.

## 3. Solution : Architecture "Design-First"

Nous allons inverser la responsabilité. `GalleryView.jsx` ne sera plus qu'un **Aiguilleur**.

### Nouvelle Structure
1.  **GalleryView.jsx** :
    - Récupère l'ID du design actif (`standard` ou `architectural`).
    - Charge le module correspondant via `React.lazy` (Code Splitting).
    - Passe *uniquement* les données brutes (Liste des meubles, User User).

2.  **Standard Layout (`src/designs/standard/MarketplaceLayout.jsx`)** :
    - Importe lui-même `useRealtimeUserLikes`.
    - Importe lui-même `Three.js`.
    - Gère sa propre logique d'interaction complexe.

3.  **Architectural Layout (`src/designs/architectural/MarketplaceLayout.jsx`)** :
    - N'importe PAS les likes (ou implémente un système de "Favoris" local cookie).
    - N'importe PAS Three.js (performance ++).
    - Implémente une fonctionnalité unique (ex: "Quick View" modal).

## 4. Plan de Refactoring (Immédiat)

1.  **Nettoyer `GalleryView.jsx`** : Retirer le Hook `useRealtimeUserLikes`. Le rendre "agnostique".
2.  **Mettre à jour `Standard Layout`** : Réintégrer la logique des Likes à l'intérieur de ce fichier.
3.  **Mettre à jour `Architectural Layout`** : Créer une fonctionnalité spécifique "Wishlist" (Local Storage) purement front, pour prouver l'isolation des fonctionnalités.

Cette approche garantit que l'ajout d'une fonctionnalité lourde sur un design n'impactera jamais la performance des autres.

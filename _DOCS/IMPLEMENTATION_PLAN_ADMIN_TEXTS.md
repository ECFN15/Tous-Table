# Mise à jour Admin Homepage - Textes & Statistiques

## Objectif
Ajouter la gestion modifiable des textes du bandeau déroulant (Ticker) et des statistiques (Section 12) via le panneau d'administration Homepage.

## Modifications effectuées

### 1. `AdminHomepage.jsx`
- Ajout d'une nouvelle section "Textes & Chiffres Clés" dans `HOMEPAGE_CONFIG`.
- Ajout de 5 nouveaux items :
    - `ticker` : Pour le texte déroulant (gauche et droite).
    - `stat_1` à `stat_4` : Pour les 4 indicateurs clés (Valeur, Suffixe, Label).
- Ces items sont marqués avec `isTextOnly: true`.

### 2. `AdminImageCard.jsx`
- Mise à jour pour gérer le mode `isTextOnly`.
- Si actif, l'aperçu image est remplacé par une icône "Texte".
- Les boutons d'upload image sont masqués.
- Un bouton principal "MODIFIER LE CONTENU" est affiché.

### 3. `HomeView.jsx`
- Remplacement du tableau `stats` hardcodé par une version dynamique utilisant `homepageImages['stat_X_text']`.
- Remplacement des textes hardcodés du Ticker ("Patrimoine Durable", "L'Excellence du geste") par les valeurs dynamiques `homepageImages['ticker_text']`.
- Utilisation de valeurs par défaut (fallback) pour éviter tout bug d'affichage si les données ne sont pas encore saisies.

## Instructions pour l'utilisateur
1. Se rendre dans **Admin > Homepage**.
2. Descendre à la nouvelle section **"Textes & Chiffres Clés"**.
3. Cliquer sur **"Modifier le contenu"** pour chaque élément (Ticker ou Stats).
4. Remplir les champs et sauvegarder.
5. Rafraîchir la page d'accueil pour voir les modifications.

# Rapport d'implémentation - Bug Checkout & UX

## 1. Amélioration de l'UX "Ajout au Panier" (Terminé & Validé)
- **Fichier modifié** : `src/App.jsx`
- **Changement** : Modification de la fonction `addToCart` pour retourner un booléen de succès.
- **Fonctionnalité "Pending Add"** : Si un utilisateur n'est pas connecté, l'article est mémorisé. Dès que l'utilisateur se connecte, l'article est automatiquement ajouté et le panier s'ouvre.
- **Résultat** : Suppression de l'affichage du panier vide avant la connexion.

## 2. Fix Autocomplétion Adresse Mobile (En cours de résolution)
Le problème persiste sur Android/iOS : la liste de suggestions ne s'affiche pas ou est masquée.

### Tentative 1 : Optimisation des attributs natifs
- **Fichier** : `src/pages/CheckoutView.jsx`
- **Actions** :
    - Ajout de `inputMode="numeric"` sur le Code Postal.
    - Activation de `autoComplete="postal-code"` et `address-level2`.
    - Ajout de `e.target.select()` au focus pour faciliter la correction.

### Tentative 2 : Correction du contexte d'empilement (Stacking Context)
- **Actions** :
    - **Z-Index** : Passage de `z-50` à `z-[100]` pour la liste de suggestions.
    - **Structure DOM** : Déplacement du bloc de suggestions après la grille (Code Postal / Ville) pour garantir qu'il soit le dernier élément rendu (priorité visuelle).
    - **Events** : Ajout de `onInput` en plus de `onChange` pour capturer les frappes sur les claviers virtuels (Gboard/Samsung).
    - **Force UI** : Utilisation de `autoComplete="new-password"` pour tenter d'écraser l'UI native de Chrome qui peut masquer notre liste.

## 3. Analyse technique du blocage actuel
Sur certains navigateurs mobiles (Chrome Android notamment) :
1. **L'Overlay Natif** : Le navigateur affiche son propre gestionnaire d'adresses qui se superpose exactement là où notre liste devrait apparaître.
2. **Focus & Clavier** : L'ouverture du clavier décale le viewport et peut parfois "clipper" les éléments positionnés en `absolute` s'ils sortent du conteneur parent.
3. **API Gouv** : Vérifier si la requête `fetch` vers `api-adresse.data.gouv.fr` n'est pas bloquée par une politique de sécurité ou un mode "Économie de données" sur le téléphone.

## 4. Étapes suivantes suggérées
- Tester en désactivant temporairement `transform-gpu` sur les inputs parents.
- Utiliser un portail (React Portal) pour rendre la liste à la racine du body, évitant tout problème de `relative/absolute` dans les formulaires.
- Vérifier les logs console via un débogueur distant (Chrome Remote Debugging) pour voir si le `fetch` renvoie bien des résultats sur mobile.

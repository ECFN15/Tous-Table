# Rapport de Migration : Inter-Projet Firebase

## Statut Actuel
Tentative de migration automatisée des produits "Affiliation" depuis le projet Production vers le projet Sandbox.

### Architecture détectée
- **Source (PROD)** : Projet Firebase `tousatable-client`
  - Collection : `artifacts/tat-made-in-normandie/public/data/affiliate_products`
  - Accès : Public (lecture seule autorisée par les rules)
- **Destination (SANDBOX)** : Projet Firebase `tatmadeinnormandie` (utilisant `appId="tat-sandbox"`)
  - Collection : `artifacts/tat-sandbox/public/data/affiliate_products`

## Implémentation réalisée par Antigravity
J'ai modifié le fichier `src/features/admin/AdminShop.jsx` pour ajouter une fonction `handleMigrateFromProd`.

### Méthode utilisée
1. **Initialisation Multi-App** : Création d'une instance Firebase secondaire nommée `PROD_APP` à l'aide des clés API de production trouvées dans `.env.prod`.
2. **Batch Firestore** : Lecture de tous les documents de la prod et écriture groupée (`writeBatch`) dans la base locale (Sandbox).
3. **Bouton UI** : Ajout d'un bouton "Sync depuis Prod" (couleur Indigo) en haut de l'interface Boutique Admin.

### Fichiers modifiés
- `firestore.rules` : Mise à jour pour supporter les `appId` dynamiques (déjà déployé sur le serveur).
- `src/features/admin/AdminShop.jsx` : Ajout de la logique de synchronisation.

## Problème rencontré
L'utilisateur indique que cela "ne fonctionne pas". Symptômes possibles :
- Le bouton n'apparaît pas dans l'interface (problème de rafraîchissement HMR ou condition `appId` mal évaluée).
- Erreur lors du clic (problème d'initialisation de la deuxième application Firebase ou droits de lecture).

### Détails Techniques pour Claude
```javascript
// Extrait de handleMigrateFromProd ajouté dans AdminShop.jsx
const prodConfig = {
    apiKey: "AIzaSyCFVCRtmGfpf2wE-zv7mAd0rv1eoRasF3g",
    authDomain: "tousatable-client.firebaseapp.com",
    projectId: "tousatable-client",
    storageBucket: "tousatable-client.firebasestorage.app",
    messagingSenderId: "1047064824334",
    appId: "1:1047064824334:web:6d0d281e31845ad0814a5f",
    measurementId: "G-EK03HLLLWL"
};
```

**Note importante** : L'utilisateur a deux projets Firebase séparés. Ma solution tente de faire le pont entre les deux directement depuis le navigateur de l'Admin.

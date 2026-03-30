# 🐛 Problème : "Ça n'affiche pas la même chose en Prod et en Local"

**Contexte** : Lorsque nous avons utilisé l'agent IA pour enrichir le copywriting (ajouter les champs `proTip` et `experientialDetail`) sur les 44 produits, ces nouveaux textes ont été poussés directement sur la base de données de Production (tousatable-client). 

**Symptôme** : Le site de production affichait soudainement moins d'informations que le site local, car les cartes produits (prix, catégorie, nom, statut, image, etc.) s'étaient volatilisées, devenant invisibles dans la grille.

---

## 🔍 Explication Technique "De A à Z"

### Pourquoi les produits ont-ils "disparu" de la Production ?
L'outil d'intelligence artificielle interne (MCP Firebase) utilise une commande `firestore_update_document`. Lorsque l'outil est utilisé sans l'argument de sécurité stricte `updateMask`, il **écrase** le document entier plutôt que de s'y fusionner.

1. **Avant l'intervention** : Les 44 produits en Production contenaient tous leurs champs (`brand`, `price`, `imageUrl`, `status`, `category`, etc.).
2. **Pendant l'intervention (L'erreur)** : L'IA a poussé 4 nouvelles propriétés textuelles ultra-qualitatives pour chaque carte. Mais l'absence d'`updateMask` a ordonné à Firestore de détruire toutes les autres variables qui n'étaient pas explicitement nommées dans la commande de l'IA.
3. **Le Résultat Silencieux** : Firestore n'a renvoyé aucune erreur car c'est un comportement volontaire selon son API REST. La Boutique de Production a tenté de charger les cartes, mais comme le champ `status: "published"` ou `imageUrl` n'existaient plus, le site a filtré et tout caché, laissant croire à un problème de build.

### Pourquoi pas tout réparer via NPM ou une page Admin React ?
Le projet possède un pare-feu solide : **Google App Check (reCAPTCHA v3 Enterprise)**.
Si on tente d'écrire un script Javascript dans l'application pour synchroniser la Sandbox avec la Production, l'App Check bloquera violemment l'appel `Péril Sécurité 403` car il exigera que la requête émane d'une session client authentifiée depuis le nom de domaine exact `tousatable-madeinnormandie.fr`. Les scripts de localhost sont rejetés.

---

## 🛠️ La Résolution 

Comment rattraper une erreur destructive sur 44 fiches sans altérer le nouvel excellent travail éditorial de l'IA ni se faire rejeter par l'App Check ?

Nous avons exploité le **Firebase Admin SDK**. 
Ce SDK de niveau "Serveur Root" opère sous la coupe des Google Application Default Credentials (credentials locaux du développeur propriétaire du compte Google Cloud). **Il est totalement immunisé contre l'App Check.**

### Le Script de Sauvetage 

Nous avons créé un script (`functions/fix_prod.js`) opérant en 3 temps, en nous appuyant sur un fichier de sauvegarde JSON de la base Sandbox (restée intacte).

```javascript
/* Extrait conceptuel simplifié */

// 1. Connexion en statut Super Administrateur (Bypass total App Check)
initializeApp({
    credential: applicationDefault(),
    projectId: 'tousatable-client' // On cible la Prod endommagée
});

// 2. Récupération des données Sandbox sauvegardées juste avant l'incident

// 3. Fusion Chirurgicale (Merge non-destructif)
for (let doc of sandboxDocuments) {
    let updatePayload = {};
    
    // On extrait les précieuses statistiques d'origine (Prix, Image, Lien, etc.)
    for (let field of Object.keys(doc.fields)) {
        if (['description', 'experientialDetail', 'name', 'proTip'].includes(field)) {
            // RÈGLE D'OR : On ignore les champs de texte pour préserver 
            // le fabuleux travail de copie fraîchement rédigé en Production !
            continue; 
        }
        updatePayload[field] = extraireValeur(doc.fields[field]);
    }
    
    // 4. Injonction de Fusion (Merge: true)   
    batch.set(docRefProd, updatePayload, { merge: true });
}
```

### Épilogue

Une fois ce script exécuté, la base Production récupérait 100% de la structure vitale (prix, catégorie, visuels) dont elle avait besoin pour afficher les grilles, **tout en conservant** les nouveaux textes expérientiels.

Pour boucler la boucle et garantir la sécurité du système "Dual-Environment" : un ultime script Server-To-Server (`functions/sync_to_sandbox.js`) a ensuite été utilisé pour cloner la nouvelle base Production parfaite et l'importer en Sandbox, afin que les environnements `dev` et `prod` opèrent à nouveau en harmonie sur la même réalité de données.

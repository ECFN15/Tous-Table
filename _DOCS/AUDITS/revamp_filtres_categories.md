# Revamp - Filtres Galerie & Categorisation Mobilier

> **Statut** : plan valide apres amendements Codex - 27 avril 2026.  
> **Perimetre** : page Galerie publique (`MarketplaceLayout.jsx`) + formulaire admin mobilier (`AdminForm.jsx`) + schema Firestore `furniture`.  
> **Promesse** : zero casse de la base existante. Les meubles deja publies restent visibles, le client peut continuer a vendre pendant la transition.

---

## 1. Contexte & demande client

La zone de filtres de la galerie publique est trop confuse. Plusieurs controles sont visibles mais inutiles ou peu adaptes au site :

- `Categorie` fait doublon avec les pills du haut.
- `Couleur` n'existe pas dans la base de donnees.
- `Disponibilite` toggle actuellement entre vente directe et encheres, mais les encheres ne sont pas un parcours client utilise.
- `Accessoires` ne correspond pas a l'offre actuelle.
- L'admin ne peut pas choisir une vraie categorie meuble au moment de publier.

Arbitrages retenus :

- Commode + Chevet deviennent une seule categorie publique : **Commodes & chevets**.
- La barre de filtres publique garde uniquement **Matiere**, **Prix** et **Tri**.
- La pill **Accessoires** est supprimee.
- La pill **Buffets & meubles** devient **Buffets**.
- Le module encheres reste dans le code/admin, mais il n'est plus expose comme filtre public tant qu'il n'est pas vraiment utilise.

---

## 2. Audit du code existant

### 2.1. Barre de filtres galerie - `src/designs/architectural/MarketplaceLayout.jsx`

Etat actuel :

```js
const FILTER_DROPDOWNS = [
    { id: 'category', label: 'Categorie' },
    { id: 'material', label: 'Matiere' },
    { id: 'color', label: 'Couleur' },
    { id: 'price', label: 'Prix' },
    { id: 'availability', label: 'Disponibilite' },
];
```

Comportement actuel :

| Filtre | Comportement | Decision |
| --- | --- | --- |
| Categorie | reset vers `activeCategory = 'all'`, doublon des pills | Supprimer |
| Matiere | bouton visible mais inerte | Rendre fonctionnel |
| Couleur | bouton visible mais inerte, champ absent en BDD | Supprimer |
| Prix | bouton visible mais inerte | Rendre fonctionnel |
| Disponibilite | toggle `auction` / `fixed`, libelle confus | Supprimer de l'UX publique |
| Tri | deja fonctionnel | Conserver |

Conclusion : 3 a 4 controles sur 5 creent du bruit. Le revamp doit passer a une interface courte, claire, et vraiment active.

### 2.2. Pills categories - `MarketplaceLayout.jsx`

Etat actuel :

```js
const CATEGORIES = [
    { id: 'all', label: 'Tous les produits', match: () => true },
    { id: 'buffets', label: 'Buffets & meubles', match: (item) => /buffet|bahut|meuble|commode|armoire/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'tables', label: 'Tables', match: (item) => /table|bureau|comptoir/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'chairs', label: 'Chaises', match: (item) => /chaise|fauteuil|banc|tabouret/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'storage', label: 'Rangements', match: (item) => /rangement|vestiaire|porte[\s-]?manteaux|coffre|armoire/i.test(`${item.name} ${item.category || ''}`) },
    { id: 'accessories', label: 'Accessoires', match: (item) => /miroir|vase|accessoire|d[eé]coration|d[eé]co/i.test(`${item.name} ${item.category || ''}`) },
];
```

Problemes :

- `Accessoires` ne correspond pas a l'activite.
- Le matching repose sur le nom du meuble, car aucun champ `category` n'est saisi dans l'admin mobilier.
- Un meme meuble peut matcher plusieurs categories.
- `armoire` est actuellement classee a la fois dans `buffets` et `storage`.

Correction retenue : remplacer les regex par un helper unique `getFurnitureCategory(item)` qui renvoie une seule categorie. Priorite au champ Firestore `category`, fallback regex uniquement pour les anciens meubles.

### 2.3. Formulaire admin - `src/features/admin/AdminForm.jsx`

Champs actuellement geres :

```txt
name, description, startingPrice, currentPrice,
material, dimensions, width, depth, height,
stock, sold, soldAt, priceOnRequest,
auctionActive, auctionEnd, durationMinutes, bidCount,
images[], thumbnails[], imageUrl, status, createdAt
```

Il n'y a pas de champ `category` pour les meubles.

Point critique : `AdminForm` sert aussi aux planches (`collectionName === 'cutting_boards'`). Le select categorie doit donc etre affiche et valide uniquement pour `collectionName === 'furniture'`.

### 2.4. Firestore

La validation produit (`isValidProduct`) n'interdit pas les champs supplementaires. Ajouter `category` comme champ optionnel sur les documents `furniture` ne casse donc pas les regles existantes.

Aucune Cloud Function ne depend de `category`. Pas de migration obligatoire.

---

## 3. Decisions produit

### 3.1. Taxonomie mobilier

| Slug Firestore | Label public |
| --- | --- |
| `buffet` | Buffets |
| `table` | Tables |
| `chaise` | Chaises & bancs |
| `armoire` | Armoires |
| `commode` | Commodes & chevets |
| `ensemble` | Ensembles |

Plus la pill par defaut : **Tous les produits**.

Pas de categorie `accessoires`.

### 3.2. Encheres

Le module encheres reste present cote admin, schema et detail produit, mais il n'est plus mis en avant dans les filtres publics.

Effet attendu :

- La galerie publique continue d'afficher par defaut les ventes directes (`filter = 'fixed'` dans `GalleryView.jsx`).
- Les meubles marques `auctionActive: true` ne sont pas exposes dans la galerie publique tant que le parcours encheres n'est pas active commercialement.
- Si le client veut relancer les encheres plus tard, il faudra creer un vrai acces dedie : bouton **Encheres en cours** ou section separee, pas un filtre `Disponibilite`.

### 3.3. Barre de filtres post-revamp

| Controle | Action |
| --- | --- |
| Pills categories | Navigation principale par type de meuble |
| Matiere | Select fonctionnel, options dynamiques depuis les meubles visibles |
| Prix | Select fonctionnel, tranches fixes |
| Tri | Conserver : plus recents, prix croissant, prix decroissant |
| Categorie dropdown | Supprimer |
| Couleur | Supprimer |
| Disponibilite | Supprimer |

Objectif : passer de 5 dropdowns confus a 2 filtres utiles + 1 tri.

---

## 4. Plan d'implementation

### Phase 1 - `AdminForm.jsx` : categorie mobilier

Fichier : `src/features/admin/AdminForm.jsx`

1. Ajouter une constante :

```js
const FURNITURE_CATEGORIES = [
  { slug: 'buffet', label: 'Buffets' },
  { slug: 'table', label: 'Tables' },
  { slug: 'chaise', label: 'Chaises & bancs' },
  { slug: 'armoire', label: 'Armoires' },
  { slug: 'commode', label: 'Commodes & chevets' },
  { slug: 'ensemble', label: 'Ensembles' },
];
```

2. Ajouter `category: ''` dans `formData` et `resetForm`.

3. Dans `useEffect([editData])`, charger :

```js
category: editData.category || ''
```

4. Ajouter un select sous **Nom de l'ouvrage**, uniquement si :

```js
collectionName === 'furniture'
```

5. Validation :

- Creation mobilier : `category` obligatoire.
- Edition mobilier legacy : sauvegarde autorisee meme si `category` est vide, pour ne pas bloquer une modification urgente.
- Planches : aucune categorie mobilier affichee, aucune validation categorie.

6. Payload Firestore :

- Pour `furniture`, ecrire `category` seulement si elle est renseignee.
- Pour `cutting_boards`, ne pas ecrire `category`.

Implementation conseillee :

```js
const isFurniture = collectionName === 'furniture';

const data = {
  ...formData,
  // champs existants...
};

if (!isFurniture) {
  delete data.category;
} else if (!data.category) {
  delete data.category; // evite d'ajouter category: '' sur les anciens meubles
}
```

### Phase 2 - `MarketplaceLayout.jsx` : categories propres + filtres fonctionnels

Fichier : `src/designs/architectural/MarketplaceLayout.jsx`

#### 2.1. Constantes

Remplacer `CATEGORIES` par :

```js
const FURNITURE_CATEGORIES = [
  { id: 'all', label: 'Tous les produits' },
  { id: 'buffet', label: 'Buffets' },
  { id: 'table', label: 'Tables' },
  { id: 'chaise', label: 'Chaises & bancs' },
  { id: 'armoire', label: 'Armoires' },
  { id: 'commode', label: 'Commodes & chevets' },
  { id: 'ensemble', label: 'Ensembles' },
];
```

Remplacer `FILTER_DROPDOWNS` par des controles reels :

```js
const PRICE_RANGES = [
  { id: 'lt500', label: 'Moins de 500 €', min: 0, max: 500 },
  { id: '500-1000', label: '500 - 1 000 €', min: 500, max: 1000 },
  { id: '1000-2000', label: '1 000 - 2 000 €', min: 1000, max: 2000 },
  { id: 'gt2000', label: '2 000 € et +', min: 2000, max: Infinity },
];
```

#### 2.2. Helper de categorie unique

Ajouter un helper stable :

```js
const normalizeText = (value = '') =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const getFurnitureCategory = (item) => {
  if (item?.category) return item.category;

  const haystack = normalizeText(`${item?.name || ''} ${item?.description || ''}`);

  if (/buffet|bahut/.test(haystack)) return 'buffet';
  if (/table|bureau|comptoir/.test(haystack)) return 'table';
  if (/chaise|fauteuil|banc|tabouret/.test(haystack)) return 'chaise';
  if (/armoire|vestiaire|penderie/.test(haystack)) return 'armoire';
  if (/commode|chevet|secretaire|semainier/.test(haystack)) return 'commode';
  if (/ensemble|lot|paire/.test(haystack)) return 'ensemble';

  return 'buffet'; // fallback doux pour ne jamais masquer un ancien meuble
};
```

Pourquoi ce helper :

- Une seule categorie par meuble.
- Le champ Firestore a toujours priorite.
- Les anciens meubles restent visibles sans migration.

#### 2.3. Etat local

Ajouter :

```js
const [activeMaterial, setActiveMaterial] = useState('');
const [activePriceRange, setActivePriceRange] = useState('');
```

Calculer les matieres disponibles depuis les items de la galerie :

```js
const materialOptions = useMemo(() => {
  return [...new Set(items.map((item) => item.material).filter(Boolean))].sort();
}, [items]);
```

#### 2.4. Filtrage

Etendre `sortedItems` :

1. Categorie :

```js
activeCategory === 'all' || getFurnitureCategory(item) === activeCategory
```

2. Matiere :

```js
!activeMaterial || item.material === activeMaterial
```

3. Prix :

- Si `item.priceOnRequest === true`, exclure l'item quand une tranche de prix est active.
- Sinon utiliser `currentPrice || startingPrice || price`.

```js
const matchesPriceRange = (item, range) => {
  if (!range) return true;
  if (item.priceOnRequest) return false;
  const price = getPrice(item);
  return price >= range.min && price < range.max;
};
```

4. Tri existant conserve.

#### 2.5. UI filtres

Remplacer les boutons fantomes par deux `<select>` styles :

- Matiere : option `Toutes les matieres`, puis options dynamiques.
- Prix : option `Tous les prix`, puis `PRICE_RANGES`.
- Si `materialOptions.length === 0`, masquer le select Matiere.
- Visuel actif : border/text en doré quand une valeur est choisie.
- Au clic sur **Tous les produits**, reset :

```js
setActiveCategory('all');
setActiveMaterial('');
setActivePriceRange('');
setVisibleCount(24);
```

Ajouter un reset global discret si au moins un filtre est actif :

```txt
Reinitialiser
```

### Phase 3 - Masonry / performance

Le composant reset actuellement le masonry quand `activeCategory` ou `sortMode` change.

Mettre a jour la cle :

```js
const key = `${activeCategory}-${activeMaterial}-${activePriceRange}-${sortMode}`;
```

Et les dependances du `useEffect` associe.

Objectif : eviter des positions de cartes incoherentes apres filtre matiere/prix.

### Phase 4 - Non-regression Firestore

Garanties :

- Aucun champ existant n'est renomme.
- Aucun champ existant n'est supprime.
- `category` est optionnel.
- Pas de migration automatique.
- Les anciens meubles restent visibles via `getFurnitureCategory`.
- Les planches ne recoivent pas de categorie mobilier.
- Aucune Cloud Function a modifier.
- Aucune regle Firestore a modifier.

### Phase 5 - Tests manuels

1. Publier un meuble neuf en categorie `buffet` : il apparait dans **Buffets**.
2. Publier une table : elle apparait uniquement dans **Tables**.
3. Publier une chaise ou un banc : il apparait dans **Chaises & bancs**.
4. Publier une armoire : elle apparait uniquement dans **Armoires**.
5. Publier une commode ou un chevet : il apparait dans **Commodes & chevets**.
6. Publier un ensemble : il apparait dans **Ensembles**.
7. Publier une planche : aucun select categorie mobilier n'est affiche en admin.
8. Recharger la galerie avec d'anciens meubles sans `category` : ils restent visibles.
9. Filtrer par matiere : seules les matieres presentes apparaissent dans le select.
10. Filtrer par prix : les tranches filtrent correctement.
11. Activer un prix sur demande puis filtrer par prix : le meuble prix sur demande ne sort pas dans une tranche arbitraire.
12. Combiner categorie + matiere + prix : le resultat reste coherent.
13. Cliquer **Tous les produits** : tous les filtres sont remis a zero.
14. Verifier mobile : les selects tiennent dans la barre sans chevauchement.
15. Verifier qu'un meuble `auctionActive: true` n'est pas expose dans la galerie publique par defaut, comportement assume.

---

## 5. Fichiers touches

| Fichier | Intervention |
| --- | --- |
| `src/features/admin/AdminForm.jsx` | Ajout categorie mobilier conditionnelle, validation creation, payload Firestore propre |
| `src/designs/architectural/MarketplaceLayout.jsx` | Taxonomie, helper legacy, filtres Matiere/Prix fonctionnels, reset masonry |

Aucun changement prevu dans :

- `functions/`
- `firestore.rules`
- `ShopView.jsx`
- `CartSidebar.jsx`
- `App.jsx`, sauf si un test revele un etat persistant galerie a nettoyer

---

## 6. Points volontairement exclus

- Pas de migration automatique des anciens meubles.
- Pas de champ `color`.
- Pas de refonte du parcours encheres.
- Pas de modification du Comptoir / produits affilies.
- Pas de changement sur les commandes, Stripe, panier ou stock.

---

## 7. Risques & mitigations

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Ancien meuble classe imparfaitement par fallback regex | Faible | Le client peut corriger en editant la categorie dans l'admin |
| Planches bloquees par une categorie obligatoire | Moyen | Select + validation uniquement pour `collectionName === 'furniture'` |
| Prix sur demande classe en `< 500 €` | Moyen | Exclure les `priceOnRequest` quand un filtre prix est actif |
| Masonry mal repositionne apres filtre | Moyen | Inclure matiere/prix dans la cle de reset masonry |
| Encheres invisibles publiquement | Assume | Decision produit : module conserve mais non expose tant qu'il n'est pas utilise |

---

## 8. Estimation

- AdminForm : 30 a 45 min.
- MarketplaceLayout : 1 h a 1 h 30.
- Tests manuels responsive/admin : 30 a 45 min.

Total estime : 2 h a 3 h, sans migration et avec risque faible sur la base de donnees.

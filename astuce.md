# 💡 Bibliothèque d'Astuces & Hacks CSS/UI

Bienvenue dans le recueil des astuces et solutions aux problèmes complexes d'intégration front-end du projet **Tous à Table**. Ce document rassemble les "hacks" élégants pour contourner les comportements imposés par les navigateurs tout en gardant un design parfait.

---

## 🔧 1. Le Hack Parfait pour l'Autofill Chrome (Dark Mode & Arrondis)

### 🐛 Le Problème
Lorsqu'un utilisateur utilise l'auto-complétion (autofill) de son navigateur (comme Google Chrome pour les adresses ou cartes bancaires), le navigateur injecte de force ses propres styles CSS via le pseudo-sélecteur `:-webkit-autofill`.
**Conséquences désastreuses sur un design Premium :**
- Le fond du champ devient brusquement blanc ou jaune pâle (ruinant l'interface Dark Mode).
- Le texte devient noir.
- Cela écrase purement et simplement les classes Tailwind d'origine (`bg-stone-900`, `text-white`).

### ❌ Pourquoi la solution classique ("Box-Shadow Inset") est imparfaite ?
La méthode trouvée traditionnellement sur internet consiste à injecter une énorme ombre interne (`box-shadow: inset 0 0 0 1000px #1c1917`) pour repeindre le fond par-dessus la couleur de Chrome. 
**Le souci avec Tailwind CSS** : Les bordures (`ring-1`) utilisent *aussi* la propriété `box-shadow`. En forçant notre propre ombre de fond, **nous écrasons la fine bordure Tailwind**.
Résultat : Les coins arrondis (`rounded-xl`) perdent leur délimitation, se fondent dans le décor et font apparaître des artefacts visuels (pixels "baveux" en escalier dans les angles). De plus, le correcteur orthographique de Chrome force parfois une partie du texte autofillé en noir au moment du focus.

### ✨ La Solution Ultime : Le "Transition-Delay Hack"
L'astuce ultime et sans effet de bord consiste à utiliser une propriété de transition absurdement longue pour empêcher le navigateur d'appliquer ses nouvelles couleurs. On dit littéralement au navigateur : *"D'accord pour changer la couleur en blanc et le texte en noir, mais mets 5000 secondes pour le faire."*

Ainsi, le champ **conserve sa couleur de fond d'origine** (définie par Tailwind) et surtout **ses bordures (rings) restent totalement intactes** car on ne touche pas au `box-shadow` ! On applique également ce délai à la propriété `color` pour contrer les bugs vicieux du correcteur orthographique qui noircissait le texte pré-rempli.

### 💻 Implémentation (CSS Global)

Voici le code ajouté dans le fichier `src/index.css` (la feuille de style globale) :

```css
/* --- FIX CHROME AUTOFILL (CHECKOUT & FORMS) --- */
/* The Transition-Delay Hack overrides Chrome's forced background and text colors while keeping the input's actual rounded box-shadows untouched. */

/* Pour les champs en Dark Mode */
.autofill-dark:-webkit-autofill,
.autofill-dark:-webkit-autofill:hover, 
.autofill-dark:-webkit-autofill:focus, 
.autofill-dark:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s !important;
    -webkit-text-fill-color: white !important;
    color: white !important;
    caret-color: white !important;
}

/* Pour les champs en Light Mode */
.autofill-light:-webkit-autofill,
.autofill-light:-webkit-autofill:hover, 
.autofill-light:-webkit-autofill:focus, 
.autofill-light:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s !important;
    -webkit-text-fill-color: #1c1917 !important; /* ex: text-stone-900 */
    color: #1c1917 !important;
    caret-color: #1c1917 !important;
}
```

### 🛠️ Comment l'utiliser avec Tailwind
Il suffit d'ajouter la classe utilitaire personnalisée `.autofill-dark` ou `.autofill-light` à vos balises inputs, idéalement de façon dynamique selon l'état du thème :

```jsx
const inputClasses = `w-full p-4 rounded-xl ring-1 outline-none transition-all ${
    darkMode 
        ? 'bg-stone-900 ring-stone-800 text-white autofill-dark' 
        : 'bg-stone-50 ring-stone-200 text-stone-900 autofill-light'
}`;

<input className={inputClasses} placeholder="Votre adresse" />
```

**Résultat :** L'auto-complétion est 100% fonctionnelle, s'intègre parfaitement au thème (clair ou sombre), garde des bords arrondis impeccables sans aucun pixel mort, et le texte est lisible en toute circonstance !
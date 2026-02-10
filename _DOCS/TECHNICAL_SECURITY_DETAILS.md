# 🔧 Détails Techniques : Sécurisation du Build (Vite/Esbuild)

Ce document explique les mécanismes techniques mis en place le 5 Février 2026 pour "nettoyer" le code client envoyé aux navigateurs.

## 1. Comment ça marche ? (La mécanique)

Nous n'utilisons pas de regex ou de recherche manuelle. Nous utilisons les capacités du compilateur **Esbuild** (intégré à Vite) qui construit le site.
Lors de la phase de "Build" (Construction), le compilateur lit ton code JavaScript et le réécrit pour qu'il soit compréhensible par le navigateur. C'est à ce moment précis que nous lui donnons l'ordre d'ignorer certaines instructions.

### La Configuration (`vite.config.js`)
Voici les lignes exactes ajoutées :

```javascript
export default defineConfig({
  // ...
  build: {
    sourcemap: false, // <--- Désactive la carte aux trésors (Source Maps)
  },
  esbuild: {
    drop: ['console', 'debugger'], // <--- L'ordre de suppression
  }
})
```

---

## 2. Exemple Concret : Avant vs Après

Imaginons que tu aies ce code un peu imprudent dans `AuthContext.jsx` :

### 🔴 Code Source (Ce que tu écris)
```javascript
// AuthContext.jsx
function verifierMotDePasse(user, password input) {
    // Oups, un log de debug oublié !
    console.log("DEBUG: Vérification du mdp pour", user.email, "->", input);
    
    if (input === "secret123") {
        return true;
    }
    return false;
}
```

### 🟠 Résultat AVANT le patch (Ce que le hacker voyait)
Sans le nettoyage, le navigateur recevait ceci :
```javascript
// Le log est toujours là, minifié mais lisible et exécutable !
function v(e,t){console.log("DEBUG: Vérification du mdp pour",e.email,"->",t);return"secret123"===t}
```
*Le hacker ouvre sa console (F12) et voit passer : `DEBUG: Vérification du mdp pour admin@site.com -> 123456`*

### 🟢 Résultat APRÈS le patch (Ce qui est en ligne maintenant)
Avec `drop: ['console']`, le compilateur **supprime chirurgicalement** l'instruction de log avant de créer le fichier final :
```javascript
// POUF ! Disparu. 
function v(e,t){return"secret123"===t}
```
*Le hacker ouvre sa console : RIEN. Il lit le code : RIEN. Le code de log n'a jamais quitté ton ordinateur.*

---

## 3. Les "Source Maps" (Cartes)

### C'est quoi ?
Une "Source Map" est un fichier `.map` qui dit au navigateur : *"La variable `a` dans le fichier minifié correspond à la variable `userEmail` à la ligne 42 du fichier original `AuthContext.jsx`"*.

### La Différence
*   **AVANT (`sourcemap: true`)** : Dans l'onglet "Sources" de Chrome, on voyait toute ton arborescence : `src/features/admin/AdminDashboard.jsx`. On pouvait mettre des points d'arrêt et lire ton code comme si on était sur ton VS Code.
*   **MAINTENANT (`sourcemap: false`)** : L'onglet "Sources" ne montre qu'un seul fichier `index-XH5js.js` qui contient une seule ligne de 500,000 caractères incompréhensibles.

Exemple de code minifié illisible (Réalité) :
```javascript
const r=e=>e.split("").reverse().join("");var l=Object.freeze({__proto__:null,format:r});function i(){const[e,t]=t.useState(0);return n.createElement("div",null,n.createElement("p",null,`Count: ${e}`))}
```
*Bonne chance pour deviner que c'est un compteur React sans la Source Map.*

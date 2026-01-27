# 📱 Tutoriel : Tester son site sur Mobile en Temps Réel (Localhost)

Ce guide t'explique comment visualiser ton site de développement (`npm run dev`) directement sur ton **vrai téléphone**, sans avoir besoin de déployer en ligne.
C'est la méthode idéale pour ajuster le responsive design et le tactile avec une fidélité parfaite (barre d'adresse, clavier virtuel, notch...).

---

## ✅ Étape 0 : Pré-requis indispensable
1.  Ton PC et ton Téléphone **DOIVENT** être connectés au **MÊME RÉSÉAU WIFI**.
    *   *Si ton PC est en câble Ethernet et ton tel en Wifi, ça marche généralement si c'est la même Box.*
    *   *Si ton tel est en 4G/5G, ça ne marchera pas.*

---

## 🚀 Étape 1 : Lancer la commande magique

Au lieu de faire ton habituel `npm run dev`, tu vas utiliser cette commande :

```bash
npm run dev -- --host
```

*(Les tirets `--` disent à npm : "Passe l'argument `--host` à Vite", ce qui autorise les connexions extérieures).*

---

## 👀 Étape 2 : Récupérer ton adresse IP locale

Une fois la commande lancée, regarde ton terminal (la console noire).
Au lieu de voir juste `Local: http://localhost:5173/`, tu devrais voir une nouvelle ligne "Network" :

```text
  VITE v5.4.x  ready in 345 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.15:5173/  <-- C'EST CETTE ADRESSE QUI COMPTE
```

*Note : L'adresse `192.168.x.x` est un exemple. La tienne sera différente (ex: `192.168.0.24`, `10.0.0.5`, etc.).*

---

## 📲 Étape 3 : Ouvrir sur ton téléphone

1.  Déverrouille ton téléphone.
2.  Ouvre Chrome (Android) ou Safari (iPhone).
3.  Dans la barre d'adresse, tape **exactement** l'adresse "Network" que tu as vue sur ton PC.
    *   Exemple : `192.168.1.15:5173` (N'oublie pas le `:5173` à la fin !).
4.  Valide.

🎉 **Bingo ! ton site s'affiche.**

---

## 🔄 Étape 4 : Le Miracle du Temps Réel

Fais le test :
1.  Garde ton téléphone allumé avec le site ouvert.
2.  Sur ton PC, va dans ton code et change une couleur (ex: change le fond en rouge).
3.  Regarde ton téléphone : **Il change de couleur instantanément !**

Tu peux maintenant coder sur ton grand écran en ayant le résultat "vrai" sous les yeux en direct.

---

## 🆘 Dépannage : "Ça ne marche pas / Le site charge indéfiniment"

Si ton téléphone n'arrive pas à se connecter (message "Délai d'attente dépassé" ou "Impossible d'ouvrir la page"), c'est **toujours** à cause de l'une de ces 2 raisons :

### 1. Le Pare-feu de Windows (Firewall) 🔥
Windows bloque souvent les connexions entrantes par sécurité.
*   **Solution :**
    *   Quand tu lances la commande pour la première fois, une fenêtre Windows apparaît peut-être demandant "Autoriser l'accès ?". Clique sur **"Autoriser"** (coche bien "Réseaux privés").
    *   Si tu as raté cette fenêtre : Désactive temporairement ton pare-feu pour tester, ou ajoute une règle pour "Node.js".

### 2. Le réseau Wifi 📶
*   Vérifie bien que ton téléphone n'est pas passé en 4G.
*   Certains réseaux Wifi publics (Université, Hôtel, Entreprise) bloquent la communication entre appareils (Isolation AP). Ça ne marchera que sur ta Box Internet à la maison.

---

*Fichier généré le 27/01/2026 pour faciliter le debug mobile.*

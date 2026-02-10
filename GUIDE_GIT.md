# 🐙 Guide de Survie GIT (Gestion des Versions)

Ce guide explique comment travailler proprement avec des "Branches" pour ne jamais casser le code principal (`main`).

---

## 🌟 Le Concept (Photocopie)
Imaginez que `main` est le dossier "SACRÉ" du site qui marche.
Quand vous voulez tester un truc, **vous faites une photocopie temporaire** (une *branche*).
*   Si c'est moche -> Poubelle 🗑️.
*   Si c'est beau -> On colle dans le dossier Sacré (`merge`) ✨.

---

## 🛠️ La Routine Pro (3 Scénarios)

### 1. Démarrer une nouvelle Tâche
*Exemple : Vous voulez créer une page "Contact".*

```bash
# Crée une branche 'contact' et saute dessus immédiatement
git checkout -b feature/contact
```
👀 *Vous êtes maintenant dans la photocopie. Vous pouvez tout casser, `main` est en sécurité.*
💡 *Faites vos commits (sauvegardes) normalement via les boutons bleus à gauche.*

---

### 2. Scénario A : Ça ne marche pas (Abandon) 🗑️
*Vous avez essayé, c'est nul, tout est cassé. Vous voulez revenir en arrière.*

1.  **Revenez en lieu sûr (`main`)** :
    ```bash
    git checkout main
    ```
    *(Votre code redevient propre instantanément !)*

2.  **Jetez la branche cassée à la poubelle** :
    ```bash
    git branch -D feature/contact
    ```
    *(Le `-D` majuscule force la suppression même si ce n'est pas fini)*

---

### 3. Scénario B : C'est Validé (Succès) ✨
*C'est génial, ça marche, vous voulez l'intégrer au site officiel.*

1.  **Revenez sur le code officiel (`main`)** :
    ```bash
    git checkout main
    ```

2.  **Fusionnez votre travail dedans** :
    ```bash
    git merge feature/contact
    ```
    *(Git prend tout ce que vous avez fait et l'ajoute proprement à `main`)*

3.  **(Optionnel) Supprimez la branche devenue inutile** :
    ```bash
    git branch -d feature/contact
    ```
    *(Le `-d` minuscule suffit ici car c'est propre)*

---

## 🖱️ Méthode Visuelle (Sans Terminal)

Si vous préférez cliquer plutôt que taper :

### 1. Créer une Branche
1.  Regardez tout en bas à gauche de VS Code (dans la barre bleue ou violette).
2.  Vous verrez écrit `main` (ou le nom de la branche actuelle). **Cliquez dessus**.
3.  Un menu s'ouvre en haut. Cliquez sur **+ Create new branch...**.
4.  Tapez le nom (ex: `test-couleur`) et Entrée.
5.  ✨ Vous êtes dessus !

### 2. Changer de Branche
1.  Cliquez sur le nom de la branche en bas à gauche (ex: `test-couleur`).
2.  La liste de vos branches apparaît.
3.  Cliquez sur celle où vous voulez aller (ex: `main`).

### 3. Fusionner (Valider le travail)
*Une fois votre travail fini sur `test-couleur`, pour l'envoyer dans `main`:*

1.  Revenez d'abord sur **`main`** (via le clic en bas à gauche).
2.  Dans le menu "Contrôle de source" (icône 🐙 à gauche), cliquez sur les **3 petits points (`...`)** en haut à droite.
3.  Allez sur **Branche (Branch)** > **Fusionner la branche (Merge Branch...)**.
4.  Sélectionnez votre branche `test-couleur`.
5.  C'est fait ! ✅

### 4. Supprimer une Branche (L'abandon ou le clean)
*Si c'est nul, ou si c'est fini et fusionné :*

1.  Assurez-vous d'être sur une AUTRE branche (ex: `main`).
2.  Appuyez sur `F1` (ou `Ctrl+Shift+P`).
3.  Tapez **"Git: Delete Branch..."** et cliquez dessus.
4.  Sélectionnez la branche à supprimer.
5.  Confirmez (Oui/Yes).



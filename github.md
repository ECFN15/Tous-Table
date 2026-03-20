# 🚀 Guide de Sauvegarde sur deux GitHub : MFcv1 + ECFN15 (Backup)

Ce guide t'explique comment envoyer ton travail quotidiennement sur ton compte principal et faire une sauvegarde complète sur ton second compte.

---

## 🏗️ 1. Rappel des destinations (Remotes)

Ton projet est connecté à deux comptes GitHub différents :
*   **origin** : Ton compte principal (**MFcv1**). C'est celui que tu utilises tous les jours.
*   **backup** : Ton compte de secours (**ECFN15**). C'est là que tu gardes une copie de sécurité.

---

## 🛠️ 2. Travail Quotidien (sur MFcv1)

Rien ne change ! Tu travailles normalement.
Utilise l'interface de VS Code pour créer tes **Commits** et clique sur le bouton **Synchroniser**.

Si tu préfères le terminal, la commande est :
```bash
git push origin main
```
*Identité à utiliser : Ton compte habituel (**MFcv1**).*

---

## 💾 3. Faire une Sauvegarde sur le compte de Secours (ECFN15)

Quand tu as terminé une version stable (comme aujourd'hui pour la `v36.33`) et que tu veux envoyer une copie sur ton autre compte GitHub :

1.  Ouvre un terminal dans VS Code (**Ctrl + J**).
2.  Tape exactement cette commande :
    ```bash
    git push backup main
    ```

> [!TIP]
> **Important :** Si une fenêtre GitHub s'ouvre pour te demander de te connecter, utilise tes identifiants du compte **ECFN15**. Une fois connecté, ton ordinateur s'en souviendra pour la suite !

---

## 🤖 4. Travailler avec Jules AI (Google)

Jules est un agent intelligent qui travaille directement sur **GitHub (le Cloud)**. Même s'il n'est pas "connecté" physiquement à ton disque dur, il a accès à la copie en ligne de ton projet.

### Pourquoi le tester en local ?
Pour être 100% sûr avant d'approuver ses changements définitifs sur ta branche `main`.

### Comment récupérer son travail sur ton PC ?

1.  **`git fetch origin`** :
    Ton PC demande à GitHub : *"Hé, est-ce qu'il y a du nouveau en ligne ?"* GitHub lui répond : *"Oui ! Jules a créé une version 'Ajustements-Admin' !"*. Ton PC télécharge alors les instructions de cette version (la branche).

2.  **`git checkout nom-de-la-branche`** :
    Ton PC met à jour physiquement les fichiers dans ton dossier Desktop pour qu'ils correspondent exactement à ce que Jules a fait. Tes fichiers changent sous tes yeux !

3.  **`npm run dev`** :
    Maintenant que les fichiers sur ton ordi ont "reçu" les modifs de Jules, tu peux les lancer localement. Tu testes en direct sur ton navigateur local comme tu le fais d'habitude.

> [!NOTE]
> Si les changements de Jules ne te plaisent pas, tu peux simplement lui demander des corrections via son interface chat. Une fois satisfait, tu approuves la **Pull Request** sur GitHub et tu reviens sur ta branche principale avec `git checkout main`.



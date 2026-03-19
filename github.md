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



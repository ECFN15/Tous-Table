# Mode d'emploi GitHub : Travail Principal + Backup

Ce fichier explique comment travailler quotidiennement sur un projet vers le compte git principal (origin) et comment faire des sauvegardes périodiques vers un second compte (backup).

---

## 🏗️ 1. Configuration Initiale (À faire une seule fois)

Cette étape permet de lier votre projet aux deux comptes.

**Ouvrez un terminal dans VS Code (Ctrl + J) et lancez :**

```bash
# 1. On lie le projet au compte principal (MFcv1) - celui qu'on utilise tous les jours
git remote add origin https://github.com/MFcv1/<NOM_DU_PROJET>.git

# 2. On ajoute une adresse de sauvegarde vers le nouveau compte (ECFN15)
git remote add backup https://github.com/ECFN15/<NOM_DU_PROJET>.git
```
*(N'oubliez pas de remplacer `<NOM_DU_PROJET>` par le nom du dépôt).*

---

## 🛠️ 2. Travail Quotidien (sur MFcv1)

C'est simple, rien ne change ! Vous travaillez exactement comme d'habitude.
Utilisez l'interface de VS Code pour créer vos commits et cliquez sur le bouton **Synchroniser**. 

Dans le terminal, cela correspond à :
```bash
git add .
git commit -m "Mon message de commit"
git push origin main
```
*Si on vous demande de vous connecter : choisissez l'identité MFcv1 (votre compte classique).*

---

## 💾 3. Faire une Sauvegarde sur le Nouveau Compte (ECFN15)

Quand vous avez bien avancé (en fin de journée ou de semaine) et que vous voulez envoyer une copie sur l'autre compte GitHub :

1. Ouvrez le terminal.
2. Tapez exactement cette commande :
```bash
git push backup main
```

*Attention : Lors de ce push "backup", une fenêtre Github Windows va probablement s'ouvrir. À ce moment-là seulement, il faudra peut-être te connecter avec le compte de sauvegarde `ECFN15`.*

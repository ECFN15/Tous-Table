# Configuration Git Double-Compte (Dual-Remote)

Ce fichier sert de guide pour configurer un projet local afin qu'il soit synchronisé automatiquement sur deux comptes GitHub différents (`ECFN15` et `MFcv1`) en une seule action de push.

## 🚀 Étape de Configuration Initiale

Si le projet n'est pas encore sur Git :

```bash
git init
git add .
git commit -m "Initial commit"
```

## 🔗 Liaison aux deux comptes GitHub

### 1. Ajouter le compte principal (ECFN15)
On force l'utilisateur dans l'URL pour éviter les conflits d'authentification :
```bash
# Remplacez <NOM_DU_PROJET> par le nom du dépôt sur GitHub
git remote add origin https://ECFN15@github.com/ECFN15/<NOM_DU_PROJET>.git
```

### 2. Ajouter le compte de sauvegarde (MFcv1)
On ajoute une deuxième adresse de "push" à la destination `origin` existante :
```bash
# Remplacez <NOM_DU_PROJET> par le nom du dépôt sur GitHub
git remote set-url --add --push origin https://MFcv1@github.com/MFcv1/<NOM_DU_PROJET>.git
```

### 3. Garantir l'envoi sur les deux adresses
Pour être sûr que Git envoie bien aux deux endroits (car `set-url --add` peut parfois écraser la première adresse de push si elle n'était pas explicitement définie) :
```bash
git remote set-url --add --push origin https://ECFN15@github.com/ECFN15/<NOM_DU_PROJET>.git
```

## ✅ Mode d'emploi quotidien

Une fois configuré, utilisez simplement :
```bash
git push
```
Ou le bouton **"Synchroniser les modifications"** de VS Code. Git s'occupera d'envoyer le code successivement aux deux dépôts.

## 🔍 Vérification de la configuration
Pour vérifier que les deux adresses de push sont bien actives :
```bash
git remote -v
```
Vous devriez voir **deux lignes (push)** différentes pour l'origine `origin`.

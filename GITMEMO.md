# GITMEMO.md — Workflow Git sur 2 PC

## Regle principale

Ne pas travailler longtemps directement sur `main`.

- `main` = version stable / prod
- `design/...` = changements visuels
- `fix/...` = corrections de bugs
- `prod/...` = preparation deploiement
- `admin/...` = changements admin

## Avant de coder sur un PC

Toujours repartir de la derniere version distante :

```bash
git checkout main
git pull --rebase origin main
```

## Creer une branche pour une tache

```bash
git checkout -b design/footer-mobile
```

Puis coder, tester, commit :

```bash
git status
git add .
git commit -m "Improve mobile footer design"
git push -u origin design/footer-mobile
```

## Reprendre la meme branche sur l'autre PC

```bash
git fetch origin
git checkout design/footer-mobile
git pull --rebase
```

## Avant de changer de PC

Toujours sauvegarder ce qui est en cours :

```bash
git status
git add .
git commit -m "WIP design footer"
git push
```

Un commit `WIP` est acceptable si le travail n'est pas fini. C'est mieux que garder des changements non sauvegardes sur un seul PC.

## Quand la branche est terminee

Revenir sur `main`, le mettre a jour, puis merger :

```bash
git checkout main
git pull --rebase origin main
git merge design/footer-mobile
git push origin main
```

## Si tu as deja code sur 2 PC

Sur le PC courant :

```bash
git status
git add .
git commit -m "WIP local changes"
git fetch origin
git pull --rebase origin main
```

Si Git signale des conflits :

```bash
# corriger les fichiers en conflit
git add .
git rebase --continue
```

## A eviter

Ne pas faire des `push` directs sur `main` depuis deux PC sans avoir fait `pull` avant.

Mauvais reflexe :

```bash
git push origin main
```

Bon reflexe :

```bash
git pull --rebase origin main
git push origin main
```

## Routine simple a retenir

Avant de coder :

```bash
git pull --rebase
```

Avant de changer de PC :

```bash
git add .
git commit -m "WIP ..."
git push
```


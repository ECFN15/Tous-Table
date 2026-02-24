---
description: Vérifier et forcer la connexion au compte Administrateur Firebase
---

# 🔐 Workflow : Vérification de l'Identité (Authentification Firebase)

Ce workflow vous permet de valider automatiquement que vous êtes connecté avec le bon compte Google professionnel **(matthis.fradin2@gmail.com)** avant de procéder à des déploiements critiques ou d'interagir avec la CLI. 

S'il détecte un autre compte (ou que vous êtes déconnecté), il va purger la session immédiatement et vous rouvrir la fenêtre de connexion sécurisée.

```powershell
$status = firebase login 2>&1
if ($status -match "Already logged in as matthis.fradin2@gmail.com") {
    Write-Host "✅ Sécurité Validée : Vous êtes déjà connecté avec matthis.fradin2@gmail.com" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alerte : Compte incorrect, expiré ou inexistant détecté. Purge en cours..." -ForegroundColor Yellow
    firebase logout
    Write-Host "🔄 Action Requise : Une nouvelle fenêtre va s'ouvrir. Veuillez vous connecter avec matthis.fradin2@gmail.com !" -ForegroundColor Cyan
    firebase login
}
```

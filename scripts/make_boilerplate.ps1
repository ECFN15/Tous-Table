# make_boilerplate.ps1
# Script pour cloner le projet actuel vers un nouveau dossier "Boilerplate" propre.
# Usage: ./make_boilerplate.ps1 "CHEMAIN_VERS_LE_NOUVEAU_DOSSIER"

param (
    [Parameter(Mandatory=$true)]
    [string]$DestinationPath
)

$SourcePath = Get-Location
$ExcludeDirs = @("node_modules", ".git", ".firebase", "dist", "_ARCHIVE", ".agent", ".github", ".vscode")
$ExcludeFiles = @(".firebaserc", ".env", ".env.prod", "package-lock.json", "yarn.lock")

Write-Host "🚀 Démarrage du clonage vers : $DestinationPath" -ForegroundColor Cyan

# Création du dossier destination s'il n'existe pas
if (-not (Test-Path $DestinationPath)) {
    New-Item -ItemType Directory -Force -Path $DestinationPath | Out-Null
}

# Copie intelligente avec Robocopy (Windows Native)
# /E : Copie les sous-répertoires (y compris vides)
# /XD : Exclure les dossiers
# /XF : Exclure les fichiers
# /NFL /NDL : Pas de logs verbeux
# /NJH /NJS : Pas d'en-tête/pied de page de résumé
Write-Host "📦 Copie des fichiers source..." -ForegroundColor Yellow
$RobocopyArgs = @(
    $SourcePath,
    $DestinationPath,
    "/E",
    "/XD", $ExcludeDirs,
    "/XF", $ExcludeFiles,
    "/NFL", "/NDL", "/NJH", "/NJS"
)
& robocopy @RobocopyArgs

# Vérification du code de retour Robocopy ( < 8 est un succès)
if ($LASTEXITCODE -ge 8) {
    Write-Error "❌ Erreur critique lors de la copie."
    exit 1
}

Write-Host "✅ Copie terminée." -ForegroundColor Green

# Post-Traitement : Nettoyage et Initialisation

# 1. Création d'un .env vierge
$EnvTemplate = @"
# CLE API FIREBASE (A REMPLACER)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# STRIPE (PUBLIC KEY)
VITE_STRIPE_PUBLIC_KEY=
"@
Set-Content -Path "$DestinationPath\.env" -Value $EnvTemplate
Write-Host "📝 Fichier .env vierge créé." -ForegroundColor Gray

# 2. Reset du package.json (Nom du projet)
$PackageJsonPath = "$DestinationPath\package.json"
if (Test-Path $PackageJsonPath) {
    $Pkg = Get-Content $PackageJsonPath | ConvertFrom-Json
    $Pkg.name = "nouveau-projet-boilerplate"
    $Pkg.version = "0.0.1"
    $Pkg.description = "Projet généré depuis le boilerplate Tous à Table"
    $Pkg | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
    Write-Host "🏷️  package.json réinitialisé." -ForegroundColor Gray
}

# 3. Création d'un README de démarrage
$ReadmeContent = @"
# Nouveau Projet (Boilerplate)

Généré automatiquement depuis l'architecture 'Tous à Table'.

## 🚀 Démarrage Rapide

1.  **Installer les dépendances** :
    ```bash
    npm install
    cd functions
    npm install
    cd ..
    ```

2.  **Configurer l'environnement** :
    *   Remplir le fichier `.env` avec les clés de votre nouveau projet Firebase.
    *   Configurer `functions/.env` pour le backend.

3.  **Lancer le serveur** :
    ```bash
    npm run dev
    ```

## 🧹 Nettoyage à faire
*   Changer le logo dans `public/`
*   Adapter `tailwind.config.js` (couleurs)
*   Modifier le titre dans `index.html`
"@
Set-Content -Path "$DestinationPath\README_BOILERPLATE.md" -Value $ReadmeContent

Write-Host "✨ TERMINÉ ! Votre nouveau projet est prêt dans : $DestinationPath" -ForegroundColor Green
Write-Host "👉 Prochaine étape : cd `"$DestinationPath`" puis 'npm install'" -ForegroundColor Cyan

$expectedProject = "tatmadeinnormandie"
$envFile = ".env"

Write-Host "--- AUDIT DE SÉCURITÉ SANDBOX ---" -ForegroundColor Cyan

# 1. Vérification Firebase CLI
$currentProjectLine = firebase use | Out-String
if ($currentProjectLine -match "\($expectedProject\)") {
    Write-Host "✅ Firebase CLI : OK ($expectedProject)" -ForegroundColor Green
}
else {
    Write-Host "❌ ERREUR : Firebase pointe sur le mauvais projet !" -ForegroundColor Red
    exit 1
}

# 2. Vérification Fichier .env
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "VITE_FIREBASE_PROJECT_ID=$expectedProject") {
        Write-Host "✅ Variables d'environnement : OK ($envFile raccordé à $expectedProject)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ ERREUR : Le fichier $envFile ne correspond pas à la Sandbox !" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ ERREUR : Fichier $envFile introuvable !" -ForegroundColor Red
    exit 1
}

Write-Host "🛡️ Audit terminé : Environnement sécurisé pour le développement." -ForegroundColor Cyan
exit 0

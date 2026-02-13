$expectedProject = "tousatable-client"
$envFile = ".env.prod"

Write-Host "--- 🚨 AUDIT DE SÉCURITÉ PRODUCTION 🚨 ---" -ForegroundColor Yellow

# 1. Vérification Firebase CLI
$currentProjectLine = firebase use | Out-String
if ($currentProjectLine -match "\($expectedProject\)") {
    Write-Host "✅ Firebase CLI : OK ($expectedProject)" -ForegroundColor Green
}
else {
    Write-Host "❌ ERREUR CRITIQUE : Firebase pointe sur un projet de TEST !" -ForegroundColor Red
    exit 1
}

# 2. Vérification Fichier .env.prod
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "VITE_FIREBASE_PROJECT_ID=$expectedProject") {
        Write-Host "✅ Variables d'environnement : OK ($envFile raccordé à la PROD)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ ERREUR CRITIQUE : Le fichier $envFile contient des clés de TEST !" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ ERREUR : Fichier de configuration de production ($envFile) introuvable !" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Audit terminé : Accès PRODUCTION validé." -ForegroundColor Yellow
exit 0

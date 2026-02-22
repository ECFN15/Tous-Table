# make_boilerplate.ps1
# Script ultra-puissant pour cloner l'architecture "Tous à Table" vers un nouveau projet
# tout en générant un Manifeste (Audit) complet pour piloter l'IA sur le nouveau design.
# Usage: ./make_boilerplate.ps1 "CHEMIN_VERS_LE_NOUVEAU_DOSSIER"

param (
    [Parameter(Mandatory=$true)]
    [string]$DestinationPath
)

$SourcePath = Get-Location
# On exclut tout l'historique, les caches, et les dossiers IA du projet source
$ExcludeDirs = @("node_modules", ".git", ".firebase", "dist", "_ARCHIVE", ".github", ".vscode", "competence")
$ExcludeFiles = @(".firebaserc", ".env", ".env.prod", "package-lock.json", "yarn.lock")

Write-Host "🚀 Démarrage du clonage vers : $DestinationPath" -ForegroundColor Cyan

if (-not (Test-Path $DestinationPath)) {
    New-Item -ItemType Directory -Force -Path $DestinationPath | Out-Null
}

Write-Host "📦 Copie intelligente des fichiers source (Robocopy)..." -ForegroundColor Yellow
robocopy "$SourcePath" "$DestinationPath" /E /XD $ExcludeDirs /XF $ExcludeFiles /NFL /NDL /NJH /NJS

if ($LASTEXITCODE -ge 8) {
    Write-Error "❌ Erreur critique lors de la copie."
    exit 1
}

Write-Host "✅ Copie terminée." -ForegroundColor Green

# 1. Création d'un .env vierge
$EnvTemplate = @'
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_RECAPTCHA_SITE_KEY=
VITE_APP_LOGICAL_NAME=nouveau-projet
VITE_STRIPE_PUBLIC_KEY=
'@

Set-Content -Path (Join-Path -Path $DestinationPath -ChildPath ".env") -Value $EnvTemplate

# 2. Reset du package.json
$PackageJsonPath = Join-Path -Path $DestinationPath -ChildPath "package.json"
if (Test-Path $PackageJsonPath) {
    $Pkg = Get-Content $PackageJsonPath | ConvertFrom-Json
    $Pkg.name = "nouveau-projet-boilerplate"
    $Pkg.version = "0.0.1"
    $Pkg.description = "Projet généré depuis l'architecture Premium Tous à Table"
    $Pkg | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
}

# 3. GÉNÉRATION DU MANIFESTE ARCHITECTURAL & SÉCURITÉ POUR L'AGENT IA
Write-Host "🧠 Génération du Manifeste d'Architecture pour l'Agent IA..." -ForegroundColor Magenta

$AgentManifestContent = @'
# 🧠 MANIFESTE ARCHITECTURAL & AUDIT DE DÉMARRAGE
**A l'attention de l'Agent IA en charge de ce nouveau projet.**
Ce repository a été cloné depuis l'architecture premium d'un projet précédent. Voici l'audit exact des systèmes en place et comment faire évoluer ce boilerplate.

## 🛡️ 1. Audit Sécurité & Backend (Firebase Cloud Functions)
Ce projet possède un backend Node.js extrêmement robuste dans le dossier `/functions`. Ne le détruis pas.
*   **Idempotence Stripe** : La fonction `placeBid` (ou achats directs) utilise une clé `sys_idempotency` pour garantir qu'un double clique réseau ne facture pas deux fois l'utilisateur.
*   **Rate Limiting** : Une logique anti-spam Firestore est en place via une collection `sys_ratelimit`. (Max 5 requêtes par minute).
*   **Security Headers** : Le fichier `firebase.json` contient déjà les Headers parfaits (CSP stricts, X-Frame-Options DENY, nosniff). **N'y touche pas sauf si des ressources externes bloquent.**
*   **Hooks de Nettoyage (Garbage Collector)** : Le trigger `onArtifactDeleted` purge automatiquement le Storage et les sous-collections associés lorsqu'un document est supprimé.

## ⚙️ 2. Le Pack Admin (Back-Office)
Le dossier `src/features/admin/` contient un CMS complet ultra-optimisé :
*   **Authentification par Rôle** : Vérifie l'auth (`AuthContext.jsx`) qui lit la base `users/{uid}` pour le `role: "admin"`.
*   **Optimisation Images** : Le système compresse en client-side (WebP) et sauvegarde **deux versions** (HD et THUMB) dans Firebase Storage.
*   **Export Data** : Implémentation de `xlsx` (SheetJS) pour exporter les commandes. Garde ce composant isolé.

## 🎨 3. Nouveau Design & Le 'Taste-Skill'
Tu ne DOIS PAS reproduire le design exact du projet précédent. Tu dois l'élever au niveau supérieur selon ces 3 variables que le client te demandera d'ajuster :
*   `DESIGN_VARIANCE` (1-10) : Pour contrôler les symétries vs asymétries.
*   `MOTION_INTENSITY` (1-10) : Pour jongler entre staticité et physiques fluides (GSAP Framer).
*   `VISUAL_DENSITY` (1-10) : Pour choisir entre style 'Musée' ou 'Dashboard Dashboard'.
*Règle d'or : Utilise la police 'Geist' ou 'Satoshi' pour les Dashboards Admin, et limite les typographies Serif au domaine artistique.*

## 🏗️ 4. Mission Immédiate: Fragmentation de la Page d'Accueil
**ACTION REQUISE :** Le fichier hérité `src/pages/HomeView.jsx` dépasse les 1200 lignes. 
Ta toute première mission (après avoir npm install) sera de fragmenter ce monolithe :
1.  Extrais `<RotatingSymbol>` et `<RotatingButton>` dans `src/components/shared/AnimatedIcons.jsx`.
2.  Extrais la logique GSAP de la section **Manifesto** dans son propre composant `src/components/home/Manifesto.jsx`.
3.  Extrais la section FAQ (`AccordionItem`) dans `src/components/home/FaqSection.jsx`.
4.  Garde `HomeView.jsx` uniquement en tant qu'assembleur de composants (Wrapper).

## 🚀 5. Commandes de Démarrage
1. `npm install` (Racine)
2. `cd functions && npm install` (Backend)
3. Connecte le nouveau projet Firebase avec `firebase use --add`
4. Lance l'environnement avec `npm run dev`

Bon codage !
'@

Set-Content -Path (Join-Path -Path $DestinationPath -ChildPath "AGENT_INSTRUCTIONS.md") -Value $AgentManifestContent -Encoding UTF8

Write-Host "✨ TERMINÉ ! Le Boilerplate est prêt dans : $DestinationPath" -ForegroundColor Green
Write-Host "👉 Le fichier AGENT_INSTRUCTIONS.md a été généré avec succès pour guider ton IA." -ForegroundColor Cyan


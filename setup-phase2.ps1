# ================================================
# Photo-Match SN — Script de mise à jour Phase 2
# Lance depuis la racine de ton projet :
#   .\setup-phase2.ps1
# ================================================

Write-Host "🚀 Photo-Match SN — Installation Phase 2 (Cloudinary)" -ForegroundColor Cyan

# Créer les dossiers manquants
$dirs = @(
  "app\dashboard\new-event",
  "app\dashboard\event\[eventId]",
  "app\api\upload",
  "app\api\watermark",
  "app\api\index-descriptor",
  "app\api\payment\initiate",
  "app\api\payment\webhook",
  "components\photographer",
  "components\guest",
  "components\ui",
  "lib",
  "public\models"
)

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "✅ Dossiers créés" -ForegroundColor Green

# Installer les dépendances Cloudinary
Write-Host "📦 Installation de Cloudinary..." -ForegroundColor Yellow
npm install cloudinary react-dropzone react-qrcode-logo

Write-Host ""
Write-Host "✅ Installation terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Copie les fichiers fournis dans les bons dossiers"
Write-Host "  2. Remplis ton .env.local avec tes clés Firebase + Cloudinary"
Write-Host "  3. Lance : npm run dev"

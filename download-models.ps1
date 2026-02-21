$baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/dist/models'
$modelDir = 'C:\Users\Mettech\Downloads\photo-match-sn-v2\public\models'
$files = @(
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.weights.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.weights.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.weights.bin'
)

Write-Host "Téléchargement des modèles face-api.js..." -ForegroundColor Cyan
Write-Host "Destination: $modelDir`n" -ForegroundColor Gray

foreach ($file in $files) {
  $url = "$baseUrl/$file"
  $outputPath = Join-Path $modelDir $file
  
  Write-Host "Téléchargement: $file..." -ForegroundColor Yellow
  
  try {
    Invoke-WebRequest -Uri $url -OutFile $outputPath -ErrorAction Stop
    $size = (Get-Item $outputPath).Length / 1MB
    Write-Host "✅ $file - $([Math]::Round($size, 2)) MB" -ForegroundColor Green
  } catch {
    Write-Host "❌ Erreur pour $file : $_" -ForegroundColor Red
  }
}

Write-Host "`nVérification des fichiers téléchargés:" -ForegroundColor Cyan
Get-ChildItem $modelDir -File | ForEach-Object {
  $size = $_.Length / 1MB
  Write-Host "  - $($_.Name) - $([Math]::Round($size, 2)) MB"
}

Write-Host "`n✅ Téléchargement terminé!" -ForegroundColor Green

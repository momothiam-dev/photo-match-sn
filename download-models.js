#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/dist/models';
const modelDir = path.join(__dirname, 'public', 'models');
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model.weights.bin',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model.weights.bin',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model.weights.bin'
];

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('\n🚀 Téléchargement des modèles face-api.js...');
  console.log(`📁 Destination: ${modelDir}\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const url = `${baseUrl}/${file}`;
    const outputPath = path.join(modelDir, file);

    process.stdout.write(`⏳ Téléchargement: ${file}... `);

    try {
      await downloadFile(url, outputPath);
      const stats = fs.statSync(outputPath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`✅ (${sizeInMB} MB)`);
      success++;
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ Succès: ${success}/${files.length}`);
  if (failed > 0) {
    console.log(`   ❌ Erreurs: ${failed}/${files.length}`);
  }

  // Lister les fichiers
  console.log(`\n📋 Fichiers présents:`);
  const modelFiles = fs.readdirSync(modelDir).filter(f => f !== '.gitkeep');
  modelFiles.forEach(file => {
    const filePath = path.join(modelDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   - ${file} (${sizeInMB} MB)`);
  });

  if (success === files.length) {
    console.log('\n✅ Tous les modèles téléchargés avec succès!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Certains modèles ne sont pas disponibles.');
    console.log('📌 Les modèles peuvent être téléchargés manuellement plus tard.\n');
    process.exit(failed > 3 ? 1 : 0);
  }
}

downloadModels().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});

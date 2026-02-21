# Photo-Match SN - Documentation

Plateforme de partage de photos pour événements au Sénégal.

## Architecture

### Structure du projet

```
app/
  ├── api/
  │   ├── upload/          → Upload photos vers Cloudinary
  │   └── index-descriptor/→ Index face descriptors
  ├── dashboard/
  │   ├── page.tsx         → Dashboard principal
  │   ├── new-event/       → Créer un événement
  │   └── event/[eventId]/ → Détails d'un événement
  ├── layout.tsx           → Layout racine
  ├── page.tsx             → Page d'accueil (redirect)
  └── globals.css          → Styles Tailwind
components/
  └── photographer/
      ├── UploadZone.tsx   → Zone d'upload photos
      └── QRCodeGenerator.tsx → Générateur QR Code
lib/
  ├── firebase.ts          → Config Firebase/Firestore
  ├── cloudinary.ts        → Config Cloudinary
  ├── firestore.ts         → Fonctions Firestore
  ├── faceapi.ts           → Extraction descripteurs faciaux
  └── types.ts             → Types TypeScript partagés
```

### Stack technologique

- **Framework**: Next.js 14 + React 18
- **Styling**: Tailwind CSS
- **Base de données**: Firebase Firestore
- **Stockage d'images**: Cloudinary
- **Reconnaissance faciale**: face-api.js
- **QR Codes**: react-qrcode-logo

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` (voir `.env.example`):

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Modèles face-api.js

Téléchargez les modèles depuis https://github.com/vladmandic/face-api :

```
public/models/
  ├── tiny_face_detector_model-weights_manifest.json
  ├── tiny_face_detector_model.weights.bin
  ├── face_landmark_68_model-weights_manifest.json
  ├── face_landmark_68_model.weights.bin
  ├── face_recognition_model-weights_manifest.json
  └── face_recognition_model.weights.bin
```

## Développement

### Installation

```bash
npm install
```

### Dev server

```bash
npm run dev
# Ouvre http://localhost:3000
```

### Build production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Flux de données

### 1. Création d'événement

1. Photographe remplit le formulaire `/dashboard/new-event`
2. Données sauvegardées dans Firestore (collection `events`)
3. Redirection vers `/dashboard/event/[eventId]`

### 2. Upload photos

1. Photographe drop photos dans UploadZone
2. Client upload vers `/api/upload` → Cloudinary
3. Métadonnées + photo ID retournées au client
4. Client charge l'image du CDN Cloudinary
5. Client extrait le descripteur facial via face-api.js
6. Client POST le descripteur vers `/api/index-descriptor`
7. Firestore met à jour la photo avec `hasDescriptor: true`

### 3. Partage avec QRCode

1. Photographe génère QR Code depuis `/dashboard/event/[eventId]?tab=qr`
2. QR pointe vers `/event/[eventId]` (page galerie invité)
3. Invité scanne → accès à la galerie avec recherche faciale

## Sécurité

- ✅ Watermark côté CDN (impossible à contourner du client)
- ✅ Descripteurs faciaux en Firestore, photos originales en Cloudinary
- ✅ API Routes sécurisées (validation taille, type, format)
- ✅ URLs Cloudinary signées pour HD après paiement

## Limitations Phase 1

- Pas de paiement (Wave/Orange Money)
- Pas de galerie invité
- Pas de recherche faciale
- Pas d'authentification photographe

## Roadmap

### Phase 2

- [ ] Galerie invité sans watermark
- [ ] Recherche faciale (input photo → matching automatique)
- [ ] Intégration paiement Wave/Orange Money
- [ ] Authent photographe (email/code accès)

### Phase 3

- [ ] Album groupé (plusieurs photographes)
- [ ] Partage famille/amis
- [ ] Analytics téléchargements

## Support

Pour problèmes ou questions, consultez la documentation Firestore/Cloudinary.
# photo-match-sn

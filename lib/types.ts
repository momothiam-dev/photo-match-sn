// ================================================
// TYPES PARTAGÉS — Photo-Match SN
// ================================================

export interface Event {
  id: string
  name: string
  date: string
  location: string
  photographerName: string
  pricePerPhoto: number        // en FCFA (0 = gratuit)
  packPrice?: number
  packSize?: number
  totalPhotos: number
  status: 'active' | 'archived'
  createdAt: string
}

export interface Photo {
  id: string
  eventId: string
  cloudinaryPublicId: string   // ID Cloudinary (ex: "originals/event123/photo456")
  thumbnailUrl: string         // URL CDN watermarkée (générée à la volée)
  descriptor: number[]         // Vecteur facial Float32Array sérialisé (128 valeurs)
  hasDescriptor: boolean
  filename: string
  uploadedAt: string
}

export interface Purchase {
  id: string
  eventId: string
  photoIds: string[]
  totalAmount: number          // en FCFA
  paymentMethod: 'wave' | 'orange_money' | 'paytech' | 'free'
  status: 'pending' | 'confirmed' | 'failed'
  originalUrls?: string[]      // URLs Cloudinary HD débloquées après paiement
  transactionId?: string
  createdAt: string
}

export interface SearchResult {
  photo: Photo
  distance: number
  confidence: number           // 0-100
}

// Seuils de reconnaissance faciale
export const FACE_MATCH_THRESHOLD = 0.5
export const MIN_CONFIDENCE = 60

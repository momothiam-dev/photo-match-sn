// ================================================
// CLOUDINARY — Configuration et helpers
// ================================================
// Cloudinary gère :
//   - Le stockage des photos originales (dossier "originals/")
//   - La génération des thumbnails watermarkées via transformations CDN
//   - La compression automatique en WebP

// ─── CONFIG CÔTÉ SERVEUR (API Routes) ────────────
// Utilisé uniquement dans les fichiers sans "use client"

export function getCloudinaryConfig() {
  return {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  }
}

// ─── HELPERS URL ──────────────────────────────────

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

/**
 * Génère l'URL de la miniature watermarkée via les transformations Cloudinary CDN.
 * Le watermark est appliqué côté CDN — impossible à contourner depuis le client.
 *
 * Transformations appliquées :
 *  - Redimensionnement : 800px de large max
 *  - Format : WebP automatique (plus léger que JPEG)
 *  - Qualité : auto (optimisée par Cloudinary)
 *  - Watermark : texte centré, répété, semi-transparent
 */
export function getThumbnailUrl(publicId: string, photographerName: string = 'Photo-Match SN'): string {
  const watermarkText = encodeURIComponent(photographerName)

  return [
    `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`,
    `w_800,f_auto,q_auto`,                                         // Resize + format
    `l_text:Arial_28_bold:${watermarkText},o_40,a_-30,c_fit,w_700`, // Watermark texte
    `fl_tiled,g_center`,                                            // Répéter en tuile
    publicId,
  ].join('/')
}

/**
 * Génère l'URL de prévisualisation basse résolution (galerie mobile).
 * Très légère : ~30-50 Ko par image.
 */
export function getPreviewUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,f_auto,q_60/${publicId}`
}

/**
 * Génère l'URL de l'original HD (après paiement confirmé).
 * Retourne l'URL complète sans transformation.
 */
export function getOriginalUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`
}

/**
 * Génère l'URL de téléchargement avec les paramètres pour forcer le téléchargement du navigateur.
 * Utilise fl_attachment pour forcer le download au lieu d'afficher l'image dans le navigateur.
 */
export function getDownloadUrl(publicId: string): string {
  // fl_attachment force le navigateur à télécharger au lieu d'afficher
  // L'extension .jpg est préservée par Cloudinary
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_attachment/${publicId}.jpg`
}

/**
 * Extrait le publicId Cloudinary depuis une URL complète.
 */
export function extractPublicId(cloudinaryUrl: string): string {
  const parts = cloudinaryUrl.split('/upload/')
  if (parts.length < 2) return cloudinaryUrl
  // Supprimer les transformations et l'extension
  const withoutTransforms = parts[1].replace(/^[^/]+\//, '') // retire les transforms
  return withoutTransforms.replace(/\.[^.]+$/, '') // retire l'extension
}

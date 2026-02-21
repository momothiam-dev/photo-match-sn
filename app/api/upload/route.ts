import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { savePhoto } from '@/lib/firestore'

// Configurer Cloudinary côté serveur
const config = getCloudinaryConfig()
cloudinary.config(config)

export async function POST(request: NextRequest) {
  try {
    const formData  = await request.formData()
    const file      = formData.get('file') as File | null
    const eventId   = formData.get('eventId') as string | null
    const photographerName = formData.get('photographerName') as string || 'Photo-Match SN'

    if (!file || !eventId) {
      return NextResponse.json({ error: 'Fichier et eventId requis' }, { status: 400 })
    }

    // Validation type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez JPEG, PNG ou HEIC.' }, { status: 400 })
    }

    // Validation taille (max 20 Mo)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux. Maximum 20 Mo.' }, { status: 400 })
    }

    // Convertir le File en buffer
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary dans le dossier originals/eventId/
    const uploadResult = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:          `originals/${eventId}`,
          resource_type:   'image',
          // Pas de transformation ici — l'original est stocké tel quel
          // Le watermark est appliqué à la demande via les URLs CDN
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { public_id: string; secure_url: string })
        }
      ).end(buffer)
    })

    // Sauvegarder les métadonnées dans Firestore
    // Note : le descripteur facial sera extrait côté client lors de l'indexation
    const photoId = await savePhoto({
      eventId,
      cloudinaryPublicId: uploadResult.public_id,
      thumbnailUrl:       '',        // Généré dynamiquement via getThumbnailUrl()
      descriptor:         [],        // Sera rempli après indexation côté client
      hasDescriptor:      false,     // Passera à true après indexation
      filename:           file.name,
    })

    return NextResponse.json({
      success:            true,
      photoId,
      cloudinaryPublicId: uploadResult.public_id,
      originalUrl:        uploadResult.secure_url,
    })

  } catch (error) {
    console.error('[Upload] Erreur :', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'upload' }, { status: 500 })
  }
}

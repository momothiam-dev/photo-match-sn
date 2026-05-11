import { NextRequest, NextResponse } from 'next/server'
import { adminUpdatePhoto } from '@/lib/firestore-admin'

/**
 * Reçoit le descripteur facial extrait côté client
 * et le sauvegarde dans Firestore pour la photo correspondante.
 *
 * Flux :
 * 1. Client uploade la photo → /api/upload → retourne photoId + originalUrl
 * 2. Client charge l'image depuis Cloudinary
 * 3. Client extrait le descripteur via face-api.js
 * 4. Client envoie le descripteur ici → sauvegardé dans Firestore
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photoId, descriptor } = body

    if (!photoId || !descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: 'photoId et descriptor (array) requis' },
        { status: 400 }
      )
    }

    if (descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Le descripteur doit contenir exactement 128 valeurs' },
        { status: 400 }
      )
    }

    // Sauvegarder le descripteur dans Firestore via Admin SDK
    await adminUpdatePhoto(photoId, {
      descriptor,
      hasDescriptor: true,
    })

    return NextResponse.json({ success: true, photoId })

  } catch (error) {
    console.error('[IndexDescriptor] Erreur :', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

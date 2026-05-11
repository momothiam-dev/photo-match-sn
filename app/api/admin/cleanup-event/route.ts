import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { adminGetEventPhotos, adminDeletePhoto, adminUpdateEvent } from '@/lib/firestore-admin'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 })
    }

    // Config Cloudinary
    const config = getCloudinaryConfig()
    cloudinary.config(config)

    // Récupérer toutes les photos de l'événement via Admin SDK
    const photos = await adminGetEventPhotos(eventId)
    
    if (photos.length === 0) {
      return NextResponse.json({ message: 'Aucune photo à supprimer' })
    }

    // 1. Supprimer de Cloudinary par lots de 100 (limite de l'API)
    const publicIds = photos
      .filter(p => p.cloudinaryPublicId)
      .map(p => p.cloudinaryPublicId!)

    if (publicIds.length > 0) {
      // Cloudinary delete_resources supporte jusqu'à 100 IDs par appel
      for (let i = 0; i < publicIds.length; i += 100) {
        const batch = publicIds.slice(i, i + 100)
        await cloudinary.api.delete_resources(batch)
      }
    }

    // 2. Supprimer de Firestore via Admin SDK
    for (const photo of photos) {
      await adminDeletePhoto(photo.id)
    }

    // 3. Remettre le compteur de photos à zéro dans l'événement via Admin SDK
    await adminUpdateEvent(eventId, { totalPhotos: 0 })

    return NextResponse.json({ 
      success: true, 
      message: `${photos.length} photos supprimées avec succès.` 
    })

  } catch (error) {
    console.error('Erreur cleanup event:', error)
    return NextResponse.json({ error: 'Erreur serveur lors du nettoyage' }, { status: 500 })
  }
}

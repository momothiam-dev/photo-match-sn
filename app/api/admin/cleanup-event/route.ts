import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { adminGetEventPhotos, adminDeletePhoto, adminUpdateEvent } from '@/lib/firestore-admin'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()
    if (!eventId) return NextResponse.json({ error: 'eventId requis' }, { status: 400 })

    const config = getCloudinaryConfig()
    cloudinary.config(config)

    const photos = await adminGetEventPhotos(eventId)
    if (photos.length === 0) return NextResponse.json({ message: 'Aucune photo' })

    const publicIds = photos.filter(p => p.cloudinaryPublicId).map(p => p.cloudinaryPublicId!)
    if (publicIds.length > 0) {
      for (let i = 0; i < publicIds.length; i += 100) {
        await cloudinary.api.delete_resources(publicIds.slice(i, i + 100))
      }
    }

    for (const photo of photos) await adminDeletePhoto(photo.id)
    await adminUpdateEvent(eventId, { totalPhotos: 0 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur cleanup:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

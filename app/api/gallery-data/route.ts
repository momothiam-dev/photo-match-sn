import { NextRequest, NextResponse } from 'next/server'
import { getEventPhotos, getEvent } from '@/lib/firestore'
import { getThumbnailUrl } from '@/lib/cloudinary'
import { Photo } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 })
    }

    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    const photos = await getEventPhotos(eventId, event.photographerName || 'Photo-Match SN')

    // Régénérer les thumbnailUrl avec le bon photographerName
    const enrichedPhotos = photos.map((photo) => ({
      ...photo,
      thumbnailUrl: photo.cloudinaryPublicId
        ? getThumbnailUrl(photo.cloudinaryPublicId, event.photographerName || 'Photo-Match SN')
        : '/placeholder.svg',
    }))

    return NextResponse.json({ event, photos: enrichedPhotos })
  } catch (error) {
    console.error('Erreur gallery-data:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPhoto, getEvent } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'photoId requis' }, { status: 400 })
    }

    const photo = await getPhoto(photoId)
    if (!photo) {
      return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 })
    }

    const event = await getEvent(photo.eventId)
    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    return NextResponse.json({ photo, event })
  } catch (error) {
    console.error('Erreur récupération photo/événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

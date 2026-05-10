import { NextRequest, NextResponse } from 'next/server'
import { getEvent, getEventPhotos, getPurchasesForEvent } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId')
    const photographerId = request.nextUrl.searchParams.get('photographerId')

    if (!eventId || !photographerId) {
      return NextResponse.json({ error: 'Paramètres requis' }, { status: 400 })
    }

    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    const photos = await getEventPhotos(eventId)
    const purchases = await getPurchasesForEvent(eventId)

    const totalPhotos = photos.length
    const confirmedPurchases = purchases.filter((p) => p.status === 'confirmed')
    const totalRevenue = confirmedPurchases.reduce((sum, p) => sum + p.totalAmount, 0)
    const totalDownloads = confirmedPurchases.reduce((sum, p) => sum + p.photoIds.length, 0)

    return NextResponse.json({
      event: {
        name: event.name,
        date: event.date,
        photosUploaded: totalPhotos,
      },
      analytics: {
        totalPhotos,
        totalRevenue,
        totalDownloads,
        totalPurchases: confirmedPurchases.length,
        averagePhotosPerPurchase:
          confirmedPurchases.length > 0
            ? Math.round(totalDownloads / confirmedPurchases.length)
            : 0,
      },
    })
  } catch (error) {
    console.error('Erreur analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

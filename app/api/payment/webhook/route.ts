import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updatePurchase, getPurchase, getPhoto } from '@/lib/firestore'
import { getDownloadUrl } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()
    let body: any = {}
    try {
      body = JSON.parse(raw)
    } catch (e) {}

    const purchaseId = body.purchaseId || body.orderId || body.reference
    let statusRaw = body.status || body.paymentStatus || body.state
    
    if (!purchaseId || !statusRaw) {
      return NextResponse.json({ error: 'purchaseId et status requis' }, { status: 400 })
    }

    let status = 'pending'
    if (typeof statusRaw === 'string') {
      const s = statusRaw.toLowerCase()
      if (s === 'paid' || s === 'success' || s === 'confirmed' || s === 'completed') status = 'confirmed'
      else if (s === 'failed' || s === 'cancelled' || s === 'declined' || s === 'error') status = 'failed'
    }

    const purchase = await getPurchase(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: 'Achat introuvable' }, { status: 404 })
    }

    const updateData: any = { status }

    if (status === 'confirmed') {
      const photos = await Promise.all(
        purchase.photoIds.map(async (photoId) => {
          const photo = await getPhoto(photoId, 'Photo-Match SN')
          if (photo && photo.cloudinaryPublicId) {
            return getDownloadUrl(photo.cloudinaryPublicId)
          }
          return null
        })
      )
      updateData.originalUrls = photos.filter((url) => url !== null) as string[]
    }

    await updatePurchase(purchaseId, updateData)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur webhook paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
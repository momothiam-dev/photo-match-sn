import { NextRequest, NextResponse } from 'next/server'
import { adminUpdatePurchase, adminGetPurchase, adminGetPhoto } from '@/lib/firestore-admin'
import { getDownloadUrl } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const purchaseId = body.purchaseId || body.orderId || body.reference
    const statusRaw = body.status || body.paymentStatus || body.state
    
    if (!purchaseId || !statusRaw) return NextResponse.json({ error: 'Data missing' }, { status: 400 })

    let status = 'pending'
    const s = String(statusRaw).toLowerCase()
    if (['paid', 'success', 'confirmed', 'completed'].includes(s)) status = 'confirmed'
    else if (['failed', 'cancelled', 'declined', 'error'].includes(s)) status = 'failed'

    // Utiliser adminGetPurchase
    const purchase = await adminGetPurchase(purchaseId)
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData: any = { status }

    if (status === 'confirmed') {
      const photos = await Promise.all(
        purchase.photoIds.map(async (photoId) => {
          // Utiliser adminGetPhoto
          const photo = await adminGetPhoto(photoId)
          return photo?.cloudinaryPublicId ? getDownloadUrl(photo.cloudinaryPublicId) : null
        })
      )
      updateData.originalUrls = photos.filter(url => url !== null) as string[]
    }

    await adminUpdatePurchase(purchaseId, updateData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
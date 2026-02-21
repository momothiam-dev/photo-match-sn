import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updatePurchase, getPurchase, getPhoto } from '@/lib/firestore'
import { getDownloadUrl } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text()

    // Tenter de parser le body JSON
    let body: any = {}
    try {
      body = JSON.parse(raw)
    } catch (e) {
      console.warn('Webhook: body non JSON ou parsing échoué')
    }

    // Vérification signature PayTech si présente
    const paytechSignature = request.headers.get('x-paytech-signature')
    if (paytechSignature && process.env.PAYTECH_SECRET) {
      const expected = crypto.createHmac('sha256', process.env.PAYTECH_SECRET).update(raw).digest('hex')
      if (expected !== paytechSignature) {
        console.error('Signature PayTech invalide')
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
      }
    }

    // Supporter plusieurs schémas de payload (générique ou PayTech)
    const purchaseId = body.purchaseId || body.orderId || body.reference
    let statusRaw = body.status || body.paymentStatus || body.state
    if (!purchaseId || !statusRaw) {
      return NextResponse.json({ error: 'purchaseId et status requis' }, { status: 400 })
    }

    // Normaliser le statut
    let status = 'pending'
    if (typeof statusRaw === 'string') {
      const s = statusRaw.toLowerCase()
      if (s === 'paid' || s === 'success' || s === 'confirmed' || s === 'completed') status = 'confirmed'
      else if (s === 'failed' || s === 'cancelled' || s === 'declined' || s === 'error') status = 'failed'
      else status = 'pending'
    }

    const transactionId = body.transactionId || body.transaction_id || body.txnId || body.transaction

    // Vérifier que l'achat existe
    const purchase = await getPurchase(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: 'Achat introuvable' }, { status: 404 })
    }

    // Mettre à jour le statut
    const updateData: any = { status }
    if (transactionId) updateData.transactionId = transactionId

    // Si paiement confirmé, générer les URLs HD sans watermark prêtes au téléchargement
    if (status === 'confirmed') {
      try {
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
        console.log(`✅ URLs de téléchargement générées pour l'achat ${purchaseId}:`, updateData.originalUrls)
      } catch (err) {
        console.error('Erreur génération URLs HD:', err)
        updateData.originalUrls = []
      }
    }

    await updatePurchase(purchaseId, updateData)
    console.log(`✅ Purchase ${purchaseId} mis à jour: ${status}`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur webhook paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
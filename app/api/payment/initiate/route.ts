import { NextRequest, NextResponse } from 'next/server'
import { getEvent } from '@/lib/firestore'
import { adminCreatePurchase } from '@/lib/firestore-admin'

export async function POST(request: NextRequest) {
  try {
    const { photoIds, eventId, paymentMethod } = await request.json()

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: 'photoIds requis' }, { status: 400 })
    }

    if (!eventId || !paymentMethod) {
      return NextResponse.json({ error: 'eventId et paymentMethod requis' }, { status: 400 })
    }

    // Récupérer l'événement pour calculer le total
    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    const totalAmount = photoIds.length * event.pricePerPhoto

    // Créer l'achat via Admin SDK
    const purchaseId = await adminCreatePurchase({
      eventId,
      photoIds,
      totalAmount,
      paymentMethod,
      status: 'pending',
    })

    // URL de secours pour le développement (simulation locale)
    let paymentUrl = `${request.headers.get('origin')}/user/success?purchaseId=${purchaseId}&simulated=true`

    // Tenter l'intégration PayTech si configurée
    const paytechApiKey = process.env.PAYTECH_API_KEY
    const paytechApiUrl = process.env.PAYTECH_API_URL

    if (paytechApiKey && paytechApiUrl) {
      try {
        const callbackUrl = `${request.headers.get('origin')}/api/payment/webhook`
        const returnUrl = `${request.headers.get('origin')}/user/success?purchaseId=${purchaseId}`

        const payload = {
          amount: totalAmount,
          currency: 'XOF',
          orderId: purchaseId,
          callbackUrl,
          returnUrl,
          // Optionnel: on peut spécifier la méthode à PayTech si l'API le supporte
          paymentMethod: paymentMethod === 'paytech' ? undefined : paymentMethod
        }

        const payRes = await fetch(`${paytechApiUrl}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${paytechApiKey}`,
          },
          body: JSON.stringify(payload),
        })

        if (payRes.ok) {
          const payData = await payRes.json()
          paymentUrl = payData.paymentUrl || payData.checkoutUrl || payData.redirectUrl || paymentUrl
        }
      } catch (err) {
        console.error('Erreur intégration PayTech, repli sur simulation:', err)
      }
    }

    return NextResponse.json({ purchaseId, paymentUrl, totalAmount })

  } catch (error) {
    console.error('Erreur initiation paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
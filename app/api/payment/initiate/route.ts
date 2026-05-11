import { NextRequest, NextResponse } from 'next/server'
import { createPurchase, getEvent } from '@/lib/firestore'

export async function POST(request: NextRequest) {
  try {
    const { photoIds, eventId, paymentMethod } = await request.json()

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: 'photoIds requis' }, { status: 400 })
    }

    if (!eventId || !paymentMethod) {
      return NextResponse.json({ error: 'eventId et paymentMethod requis' }, { status: 400 })
    }

    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    const totalAmount = photoIds.length * event.pricePerPhoto

    // Créer l'achat
    const purchaseId = await createPurchase({
      eventId,
      photoIds,
      totalAmount,
      paymentMethod,
      status: 'pending',
    })

    let paymentUrl = `${request.headers.get('origin')}/user/success?purchaseId=${purchaseId}&simulated=true`

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
        console.error('Erreur PayTech:', err)
      }
    }

    return NextResponse.json({ purchaseId, paymentUrl, totalAmount })

  } catch (error) {
    console.error('Erreur initiation paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
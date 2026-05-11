import { NextRequest, NextResponse } from 'next/server'
import { getEvent } from '@/lib/firestore'
import { adminCreatePurchase } from '@/lib/firestore-admin'

export async function POST(request: NextRequest) {
  try {
    const { photoIds, eventId, paymentMethod } = await request.json()

    if (!photoIds || !eventId || !paymentMethod) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const event = await getEvent(eventId)
    if (!event) return NextResponse.json({ error: 'Event introuvable' }, { status: 404 })

    const totalAmount = photoIds.length * event.pricePerPhoto

    const purchaseId = await adminCreatePurchase({
      eventId,
      photoIds,
      totalAmount,
      paymentMethod,
      status: 'pending',
    })

    let paymentUrl = `${request.headers.get('origin')}/user/success?purchaseId=${purchaseId}&simulated=true`

    // PayTech integration
    const paytechApiKey = process.env.PAYTECH_API_KEY
    const paytechApiUrl = process.env.PAYTECH_API_URL

    if (paytechApiKey && paytechApiUrl) {
      try {
        const payload = {
          amount: totalAmount,
          currency: 'XOF',
          orderId: purchaseId,
          callbackUrl: `${request.headers.get('origin')}/api/payment/webhook`,
          returnUrl: `${request.headers.get('origin')}/user/success?purchaseId=${purchaseId}`,
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
          paymentUrl = payData.paymentUrl || payData.checkoutUrl || paymentUrl
        }
      } catch (err) {
        console.error('PayTech Error:', err)
      }
    }

    return NextResponse.json({ purchaseId, paymentUrl, totalAmount })
  } catch (error) {
    console.error('Erreur initiation paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
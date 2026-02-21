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

    // Récupérer l'événement pour calculer le total
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

    // Construire une URL de paiement selon le fournisseur choisi
    let paymentUrl = `https://payment-provider.com/pay?amount=${totalAmount}&purchaseId=${purchaseId}&method=${paymentMethod}`

    // Intégration PayTech
    if (paymentMethod === 'paytech') {
      try {
        const paytechApiUrl = process.env.PAYTECH_API_URL
        const paytechApiKey = process.env.PAYTECH_API_KEY

        if (!paytechApiUrl || !paytechApiKey) {
          return NextResponse.json({ error: 'PayTech non configuré (PAYTECH_API_URL / PAYTECH_API_KEY manquants)' }, { status: 500 })
        }

        const callbackUrl = `${request.headers.get('origin')}/api/payment/webhook`
        const returnUrl = `${request.headers.get('origin')}/success?purchaseId=${purchaseId}`

        const payload: any = {
          merchantId: process.env.PAYTECH_MERCHANT_ID || undefined,
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

        if (!payRes.ok) {
          const text = await payRes.text()
          return NextResponse.json({ error: `PayTech error: ${payRes.status} ${text}` }, { status: 502 })
        }

        const payData = await payRes.json()
        // PayTech peut renvoyer différents champs pour l'URL de paiement
        let candidate = payData.paymentUrl || payData.checkoutUrl || payData.redirectUrl || paymentUrl

        // Si l'URL renvoyée est relative (ex: "pay?...") ou manque de protocole, la rendre absolue
        try {
          const isAbsolute = /^https?:\/\//i.test(candidate)
          if (!isAbsolute) {
            // Utiliser l'origine de PAYTECH_API_URL si fourni, sinon celle de la requête
            const originBase = paytechApiUrl || request.headers.get('origin') || ''
            candidate = new URL(candidate, originBase).toString()
          }
        } catch (e) {
          console.warn('Impossible de normaliser paymentUrl:', candidate, e)
        }

        paymentUrl = candidate
      } catch (err) {
        console.error('Erreur intégration PayTech:', err)
        // on continue en renvoyant une URL de secours
      }
    }

    return NextResponse.json({ purchaseId, paymentUrl, totalAmount })

  } catch (error) {
    console.error('Erreur initiation paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
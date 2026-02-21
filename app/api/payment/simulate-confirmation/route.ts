import { NextRequest, NextResponse } from 'next/server'

/**
 * Route de test UNIQUEMENT en développement
 * Simule la confirmation d'un paiement par Wave/Orange Money
 * En production, ce webhook serait appelé par le fournisseur de paiement
 */
export async function POST(request: NextRequest) {
  // Cette route NE DOIT ÊTRE UTILISÉE qu'en développement.
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Simulation désactivée en production' }, { status: 404 })
  }

  try {
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'purchaseId requis' }, { status: 400 })
    }

    // Appeler le webhook de confirmation comme le ferait Wave/Orange Money
    const webhookResponse = await fetch(`${request.headers.get('origin')}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purchaseId,
        status: 'confirmed',
        transactionId: `SIM-${Date.now()}`,
      }),
    })

    if (!webhookResponse.ok) {
      throw new Error('Webhook confirmation failed')
    }

    console.log(`✅ Paiement simulé confirmé: ${purchaseId}`)

    return NextResponse.json({ success: true, purchaseId })

  } catch (error) {
    console.error('Erreur simulation paiement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
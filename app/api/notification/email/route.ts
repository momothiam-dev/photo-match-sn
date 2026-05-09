import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { purchaseId, email, photoCount, totalAmount } = await request.json()

    // En production, intégrer avec un service d'email (SendGrid, Brevo, etc.)
    console.log(`✉️ Email de confirmation envoyé à ${email}`)
    console.log(`  - Achat: ${purchaseId}`)
    console.log(`  - Photos: ${photoCount}`)
    console.log(`  - Montant: ${totalAmount} FCFA`)

    return NextResponse.json({
      success: true,
      message: 'Email envoyé',
    })
  } catch (error) {
    console.error('Erreur email:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

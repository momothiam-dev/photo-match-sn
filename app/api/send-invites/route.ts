import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { eventId, emails, message, subject } = await request.json()

    if (!eventId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Paramètres requis' }, { status: 400 })
    }

    // En production, intégrer avec SendGrid/Brevo
    console.log(`📧 Invitations envoyées pour l'événement ${eventId}`)
    emails.forEach((email: string) => {
      console.log(`  ✉️ ${email}`)
    })

    return NextResponse.json({
      success: true,
      message: `${emails.length} invitations envoyées`,
    })
  } catch (error) {
    console.error('Erreur envoi invitations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

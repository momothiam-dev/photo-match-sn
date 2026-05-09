import { NextRequest, NextResponse } from 'next/server'
import { getEvent } from '@/lib/firestore'

export async function GET(request: NextRequest, { params }: any) {
  try {
    const shareCode = params.shareCode

    // En production, chercher l'événement par shareCode
    const event = await getEvent(shareCode)

    if (!event) {
      return NextResponse.json({ error: 'Galerie non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Erreur galerie partagée:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

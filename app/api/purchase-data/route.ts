import { NextRequest, NextResponse } from 'next/server'
import { getPurchase } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const purchaseId = searchParams.get('purchaseId')

    if (!purchaseId) {
      return NextResponse.json({ error: 'purchaseId requis' }, { status: 400 })
    }

    const purchase = await getPurchase(purchaseId)
    if (!purchase) {
      return NextResponse.json({ error: 'Achat introuvable' }, { status: 404 })
    }

    return NextResponse.json({ purchase })
  } catch (error) {
    console.error('Erreur récupération achat:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { photoId, userId, reason, description } = await request.json()

    if (!photoId || !reason) {
      return NextResponse.json(
        { error: 'photoId et reason requis' },
        { status: 400 }
      )
    }

    // Sauvegarder le signalement
    const reportsRef = collection(db, 'Reports')
    await addDoc(reportsRef, {
      photoId,
      userId: userId || 'anonymous',
      reason,
      description: description || '',
      createdAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    })

    console.log(`⚠️ Signalement: Photo ${photoId} pour raison: ${reason}`)

    return NextResponse.json({
      success: true,
      message: 'Merci de votre signalement. Nous examinerons cette photo.',
    })
  } catch (error) {
    console.error('Erreur signalement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

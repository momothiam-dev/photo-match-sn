import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { photoId, userId, action } = await request.json()

    if (!photoId || !userId) {
      return NextResponse.json({ error: 'photoId et userId requis' }, { status: 400 })
    }

    const favoriteId = `${userId}-${photoId}`
    const favoriteRef = doc(db, 'Favorites', favoriteId)

    if (action === 'add') {
      await setDoc(favoriteRef, {
        userId,
        photoId,
        createdAt: new Date(),
      })
      return NextResponse.json({ success: true, message: 'Ajouté aux favoris' })
    } else if (action === 'remove') {
      await deleteDoc(favoriteRef)
      return NextResponse.json({ success: true, message: 'Retiré des favoris' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error('Erreur favoris:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // En production, utiliser une vraie requête Firestore
    return NextResponse.json({ favorites: [] })
  } catch (error) {
    console.error('Erreur récupération favoris:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { adminUpdatePhoto } from '@/lib/firestore-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photoId, descriptor } = body

    if (!photoId || !descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json({ error: 'photoId et descriptor requis' }, { status: 400 })
    }

    await adminUpdatePhoto(photoId, {
      descriptor,
      hasDescriptor: true,
    })

    return NextResponse.json({ success: true, photoId })
  } catch (error) {
    console.error('[IndexDescriptor] Erreur :', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getEvent, updateEvent, deleteEvent, createEvent } from '@/lib/firestore'

// GET - Récupérer un événement
export async function GET(request: NextRequest, { params }: any) {
  try {
    const eventId = params.eventId

    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Erreur récupération événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un événement
export async function PUT(request: NextRequest, { params }: any) {
  try {
    const eventId = params.eventId
    const updates = await request.json()

    await updateEvent(eventId, updates)

    return NextResponse.json({ success: true, message: 'Événement mis à jour' })
  } catch (error) {
    console.error('Erreur mise à jour événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un événement
export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const eventId = params.eventId

    await deleteEvent(eventId)

    return NextResponse.json({ success: true, message: 'Événement supprimé' })
  } catch (error) {
    console.error('Erreur suppression événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

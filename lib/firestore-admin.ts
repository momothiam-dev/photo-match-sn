import { adminDb } from './firebase-admin'
import type { Photo, Purchase, Event } from './types'

function checkAdmin() {
  if (!adminDb) throw new Error('Firebase Admin DB is not initialized. Check your environment variables.')
  return adminDb
}

// ─── PHOTOS ───────────────────────────────────────────────

export async function adminSavePhoto(photo: Omit<Photo, 'id' | 'uploadedAt'>): Promise<string> {
  const db = checkAdmin()
  const ref = db.collection('photos').doc()
  await ref.set({
    ...photo,
    uploadedAt: new Date().toISOString(),
  })

  // Incrémenter le compteur de photos de l'événement
  const eventRef = db.collection('events').doc(photo.eventId)
  const eventSnap = await eventRef.get()
  if (eventSnap.exists) {
    const current = eventSnap.data()?.totalPhotos || 0
    await eventRef.update({ totalPhotos: current + 1 })
  }

  return ref.id
}

export async function adminUpdatePhoto(photoId: string, data: Partial<Photo>): Promise<void> {
  const db = checkAdmin()
  await db.collection('photos').doc(photoId).update(data)
}

export async function adminDeletePhoto(photoId: string): Promise<void> {
  const db = checkAdmin()
  await db.collection('photos').doc(photoId).delete()
}

// ─── ÉVÉNEMENTS ───────────────────────────────────────────

export async function adminUpdateEvent(eventId: string, data: Partial<Event>): Promise<void> {
  const db = checkAdmin()
  await db.collection('events').doc(eventId).update(data)
}

// ─── ACHATS ───────────────────────────────────────────────

export async function adminCreatePurchase(purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<string> {
  const db = checkAdmin()
  const ref = db.collection('purchases').doc()
  await ref.set({
    ...purchase,
    createdAt: new Date().toISOString(),
  })
  return ref.id
}

export async function adminUpdatePurchase(purchaseId: string, data: Partial<Purchase>): Promise<void> {
  const db = checkAdmin()
  await db.collection('purchases').doc(purchaseId).update(data)
}

// ─── RÉCUPÉRATION ─────────────────────────────────────────

export async function adminGetEvent(eventId: string): Promise<Event | null> {
  const db = checkAdmin()
  const snap = await db.collection('events').doc(eventId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Event
}

export async function adminGetPhoto(photoId: string): Promise<Photo | null> {
  const db = checkAdmin()
  const snap = await db.collection('photos').doc(photoId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Photo
}

export async function adminGetPurchase(purchaseId: string): Promise<Purchase | null> {
  const db = checkAdmin()
  const snap = await db.collection('purchases').doc(purchaseId).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Purchase
}

export async function adminGetEventPhotos(eventId: string): Promise<Photo[]> {
  const db = checkAdmin()
  const snap = await db.collection('photos').where('eventId', '==', eventId).get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Photo))
}

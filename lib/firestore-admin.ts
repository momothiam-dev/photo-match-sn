import { adminDb } from './firebase-admin'
import type { Photo, Purchase, Event } from './types'

// ─── PHOTOS ───────────────────────────────────────────────

export async function adminSavePhoto(photo: Omit<Photo, 'id' | 'uploadedAt'>): Promise<string> {
  const ref = adminDb.collection('photos').doc()
  await ref.set({
    ...photo,
    uploadedAt: new Date().toISOString(),
  })

  // Incrémenter le compteur de photos de l'événement
  const eventRef = adminDb.collection('events').doc(photo.eventId)
  const eventSnap = await eventRef.get()
  if (eventSnap.exists) {
    const current = eventSnap.data()?.totalPhotos || 0
    await eventRef.update({ totalPhotos: current + 1 })
  }

  return ref.id
}

export async function adminUpdatePhoto(photoId: string, data: Partial<Photo>): Promise<void> {
  await adminDb.collection('photos').doc(photoId).update(data)
}

export async function adminDeletePhoto(photoId: string): Promise<void> {
  await adminDb.collection('photos').doc(photoId).delete()
}

// ─── ÉVÉNEMENTS ───────────────────────────────────────────

export async function adminUpdateEvent(eventId: string, data: Partial<Event>): Promise<void> {
  await adminDb.collection('events').doc(eventId).update(data)
}

// ─── ACHATS ───────────────────────────────────────────────

export async function adminCreatePurchase(purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<string> {
  const ref = adminDb.collection('purchases').doc()
  await ref.set({
    ...purchase,
    createdAt: new Date().toISOString(),
  })
  return ref.id
}

export async function adminUpdatePurchase(purchaseId: string, data: Partial<Purchase>): Promise<void> {
  await adminDb.collection('purchases').doc(purchaseId).update(data)
}

// ─── RÉCUPÉRATION ─────────────────────────────────────────

export async function adminGetEventPhotos(eventId: string): Promise<Photo[]> {
  const snap = await adminDb.collection('photos').where('eventId', '==', eventId).get()
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Photo))
}

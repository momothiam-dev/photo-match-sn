import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, orderBy, Timestamp, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db } from './firebase'
import { getThumbnailUrl } from './cloudinary'
import type { Event, Photo, Purchase } from './types'

// ─── PHOTOGRAPHES ─────────────────────────────────────────

export async function getPhotographerByEmail(email: string) {
  const q = query(collection(db, 'photographers'), where('email', '==', email))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any
}

export async function createPhotographer(data: any) {
  const ref = doc(collection(db, 'photographers'))
  await setDoc(ref, {
    ...data,
    createdAt: data.createdAt ? data.createdAt.toISOString() : new Date().toISOString()
  })
  return { id: ref.id, ...data }
}

// ─── ÉVÉNEMENTS ───────────────────────────────────────────

export async function createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
  const ref = doc(collection(db, 'events'))
  await setDoc(ref, {
    ...event,
    createdAt: Timestamp.now().toDate().toISOString(),
  })
  return ref.id
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, 'events', eventId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Event
}

export async function listEvents(): Promise<Event[]> {
  const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Event))
}

export async function updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
  await updateDoc(doc(db, 'events', eventId), data)
}

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'events', eventId))
}

// ─── PHOTOS ───────────────────────────────────────────────

export async function savePhoto(photo: Omit<Photo, 'id' | 'uploadedAt'>): Promise<string> {
  const ref = doc(collection(db, 'photos'))
  await setDoc(ref, {
    ...photo,
    uploadedAt: Timestamp.now().toDate().toISOString(),
  })

  // Incrémenter le compteur de photos de l'événement
  const eventRef = doc(db, 'events', photo.eventId)
  const eventSnap = await getDoc(eventRef)
  if (eventSnap.exists()) {
    const current = eventSnap.data().totalPhotos || 0
    await updateDoc(eventRef, { totalPhotos: current + 1 })
  }

  return ref.id
}

/**
 * Récupère les descripteurs faciaux + thumbnailUrl pour la recherche côté client.
 * On reconstruit la thumbnailUrl depuis le publicId Cloudinary à la volée.
 */
export async function getEventDescriptors(
  eventId: string,
  photographerName: string = 'Photo-Match SN'
): Promise<{ id: string; descriptor: number[]; thumbnailUrl: string; cloudinaryPublicId: string }[]> {
  const q = query(
    collection(db, 'photos'),
    where('eventId', '==', eventId),
    where('hasDescriptor', '==', true)
  )
  const snap = await getDocs(q)

  return snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      descriptor: data.descriptor as number[],
      cloudinaryPublicId: data.cloudinaryPublicId as string,
      // URL watermarkée générée dynamiquement depuis le publicId
      thumbnailUrl: getThumbnailUrl(data.cloudinaryPublicId, photographerName),
    }
  })
}

export async function getEventPhotos(eventId: string, photographerName: string = 'Photo-Match SN'): Promise<Photo[]> {
  const q = query(
    collection(db, 'photos'),
    where('eventId', '==', eventId)
    // Temporairement supprimé orderBy pour éviter le besoin d'index composite
    // orderBy('uploadedAt', 'asc')
  )
  const snap = await getDocs(q)
  const photos = snap.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      // Générer dynamiquement la thumbnailUrl depuis le cloudinaryPublicId
      thumbnailUrl: data.cloudinaryPublicId ? getThumbnailUrl(data.cloudinaryPublicId, photographerName) : '/placeholder.svg',
    } as Photo
  })
  // Trier côté client par uploadedAt
  return photos.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
}

export async function getPhoto(photoId: string, photographerName: string = 'Photo-Match SN'): Promise<Photo | null> {
  const snap = await getDoc(doc(db, 'photos', photoId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    // Générer dynamiquement la thumbnailUrl depuis le cloudinaryPublicId
    thumbnailUrl: data.cloudinaryPublicId ? getThumbnailUrl(data.cloudinaryPublicId, photographerName) : '/placeholder.svg',
  } as Photo
}

export async function deletePhoto(photoId: string): Promise<void> {
  await deleteDoc(doc(db, 'photos', photoId))
}

// ─── ACHATS ───────────────────────────────────────────────

export async function createPurchase(purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<string> {
  const ref = doc(collection(db, 'purchases'))
  await setDoc(ref, {
    ...purchase,
    createdAt: Timestamp.now().toDate().toISOString(),
  })
  return ref.id
}

export async function updatePurchase(purchaseId: string, data: Partial<Purchase>): Promise<void> {
  await updateDoc(doc(db, 'purchases', purchaseId), data)
}

export async function getPurchase(purchaseId: string): Promise<Purchase | null> {
  const snap = await getDoc(doc(db, 'purchases', purchaseId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Purchase
}

export async function getPurchasesForEvent(eventId: string): Promise<Purchase[]> {
  const q = query(collection(db, 'purchases'), where('eventId', '==', eventId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Purchase))
}

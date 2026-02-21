'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEventPhotos, getEvent } from '@/lib/firestore'
import type { Photo, Event } from '@/lib/types'

export default function EventGalleryPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEvent(eventId)
        setEvent(eventData)

        // Charger les photos avec le photographerName de l'événement
        const photosData = await getEventPhotos(eventId, eventData?.photographerName || 'Photo-Match SN')
        setPhotos(photosData)
      } catch (err) {
        console.error('Erreur chargement galerie:', err)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadData()
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Événement introuvable.</p>
        <Link href="/user" className="btn-primary">← Accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display font-bold text-2xl">{event.name}</h1>
          <p className="text-white/60 text-sm">
            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {photos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📂</div>
            <p className="font-medium text-gray-500">Aucune photo pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <Link
                key={photo.id}
                href={`/user/photo/${photo.id}`}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={photo.thumbnailUrl || '/placeholder.svg'}
                  alt={photo.filename}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg'
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {event.pricePerPhoto > 0 && (
                  <div className="absolute top-2 right-2 bg-brand-gold text-brand-navy px-2 py-1 rounded-full text-xs font-semibold">
                    {event.pricePerPhoto.toLocaleString()} FCFA
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPhoto, getEvent } from '@/lib/firestore'
import type { Photo, Event } from '@/lib/types'

export default function PhotoPage() {
  const params = useParams()
  const router = useRouter()
  const photoId = params.photoId as string

  const [photo, setPhoto] = useState<Photo | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        // Charger d'abord la photo
        const photoData = await getPhoto(photoId)
        if (!photoData) {
          setError('Photo introuvable')
          return
        }
        setPhoto(photoData)

        // Puis charger l'event pour avoir le photographerName
        const eventData = await getEvent(photoData.eventId)
        setEvent(eventData)

        // Régénérer la thumbnailUrl avec le bon photographerName
        if (eventData && photoData.cloudinaryPublicId) {
          const { getThumbnailUrl } = await import('@/lib/cloudinary')
          photoData.thumbnailUrl = getThumbnailUrl(photoData.cloudinaryPublicId, eventData.photographerName)
          setPhoto({ ...photoData })
        }
      } catch (err) {
        console.error('Erreur chargement photo:', err)
        setError('Erreur lors du chargement de la photo')
      } finally {
        setLoading(false)
      }
    }

    if (photoId) {
      loadData()
    }
  }, [photoId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !photo || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || 'Photo introuvable.'}</p>
        <Link href="/user" className="btn-primary">← Accueil</Link>
      </div>
    )
  }

  const isFree = event.pricePerPhoto === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href={`/user/gallery/${event.id}`} className="text-white/60 hover:text-white transition-colors mb-2 block">← Galerie</Link>
          <h1 className="font-display font-bold text-xl">{event.name}</h1>
          <p className="text-white/60 text-sm">
            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="aspect-square max-w-2xl mx-auto">
            <img
              src={photo.thumbnailUrl}
              alt={photo.filename}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg'
              }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-brand-navy">
                Photo {photo.filename}
              </h2>
              <span className="text-sm text-gray-500">
                {new Date(photo.uploadedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {isFree ? (
                  <p className="text-green-600 font-semibold">Gratuit</p>
                ) : (
                  <p className="text-2xl font-bold text-brand-navy">
                    {event.pricePerPhoto.toLocaleString()} FCFA
                  </p>
                )}
              </div>

              {isFree ? (
                <button
                  onClick={() => {
                    // Télécharger la photo HD (simulé pour l'instant)
                    const link = document.createElement('a')
                    link.href = photo.thumbnailUrl // En vrai, ce serait l'URL HD
                    link.download = photo.filename
                    link.click()
                  }}
                  className="btn-primary"
                >
                  📥 Télécharger
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Rediriger vers le checkout
                    router.push(`/user/checkout?photoId=${photoId}`)
                  }}
                  className="btn-primary"
                >
                  🛒 Acheter cette photo
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

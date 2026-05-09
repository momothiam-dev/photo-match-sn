'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPhoto, getEvent } from '@/lib/firestore'
import type { Photo, Event } from '@/lib/types'
import { BackButton } from '@/components/BackButton'

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
        const photoData = await getPhoto(photoId)
        if (!photoData) {
          setError('Photo introuvable')
          return
        }
        setPhoto(photoData)

        const eventData = await getEvent(photoData.eventId)
        setEvent(eventData)

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

    if (photoId) loadData()
  }, [photoId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !photo || !event) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">🚫</div>
        <p className="text-gray-500 text-xl font-medium">{error || 'Photo introuvable.'}</p>
        <BackButton fallback="/user" label="Retour" className="btn-secondary" />
      </div>
    )
  }

  const isFree = event.pricePerPhoto === 0

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <header className="bg-brand-navy-light dark:bg-brand-navy-light/50 text-white px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <BackButton fallback={`/user/gallery/${event.id}`} className="text-white/60 hover:text-white mb-6" />
          <h1 className="text-3xl font-display font-bold mb-2">{event.name}</h1>
          <p className="text-white/60">
            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="card !p-0 overflow-hidden group">
          <div className="relative aspect-square md:aspect-video bg-gray-900 flex items-center justify-center">
            <img
              src={photo.thumbnailUrl}
              alt={photo.filename}
              className="max-w-full max-h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
            />
            {/* Watermark notice */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <span className="text-4xl md:text-6xl font-bold text-white border-4 border-white px-8 py-4 rotate-[-30deg] uppercase tracking-widest">
                Aperçu
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-display text-brand-navy dark:text-white mb-2">
                  Détails de la photo
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="badge badge-info">Format HD</span>
                  <span>•</span>
                  <span>{photo.filename}</span>
                </div>
              </div>

              <div className="text-left md:text-right">
                {isFree ? (
                  <div className="badge badge-success text-lg py-2 px-4 mb-2 italic">Gratuit</div>
                ) : (
                  <div className="text-3xl font-bold text-brand-navy dark:text-white mb-2">
                    {event.pricePerPhoto.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                  </div>
                )}
                <p className="text-xs text-gray-400">Paiement sécurisé par Wave / OM</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {isFree ? (
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = photo.thumbnailUrl
                    link.download = photo.filename
                    link.click()
                  }}
                  className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">📥</span>
                  Télécharger gratuitement
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/user/checkout?photoId=${photoId}`)}
                  className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🛒</span>
                  Acheter en Haute Définition
                </button>
              )}
              <button 
                onClick={() => router.back()}
                className="btn-secondary px-8 py-4 text-lg"
              >
                Retour
              </button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-2xl">✨</span>
                <span>Qualité maximale sans filigrane</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-2xl">⚡</span>
                <span>Téléchargement instantané</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-2xl">💳</span>
                <span>Paiement local sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

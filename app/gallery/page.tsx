'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Photo } from '@/lib/types'

function GalleryContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')

  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPhotos() {
      try {
        const response = await fetch(`/api/gallery-data?eventId=${eventId}`)
        
        if (!response.ok) throw new Error('Erreur chargement')

        const data = await response.json()
        setPhotos(data.photos || [])
      } catch (err) {
        console.error('Erreur photos:', err)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadPhotos()
    } else {
      setLoading(false)
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-brand-navy mb-8">🖼️ Galerie</h1>

        {photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative w-full h-64 bg-gray-200">
                  <Image
                    src={photo.thumbnailUrl}
                    alt="Photo"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500">
                    {new Date(photo.uploadedAt).toLocaleDateString('fr-FR')}
                  </p>
                  <Link
                    href={`/photo/${photo.id}`}
                    className="mt-4 block btn-secondary text-center"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">
              {!eventId 
                ? "Veuillez spécifier un identifiant d'événement dans l'URL." 
                : "Aucune photo trouvée pour cet événement."}
            </p>
            {!eventId && (
              <Link href="/" className="mt-4 inline-block text-brand-blue hover:underline">
                Retour à l'accueil
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  )
}

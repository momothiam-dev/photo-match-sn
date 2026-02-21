'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEventDescriptors, getEvent } from '@/lib/firestore'
import { loadFaceApiModels, getFaceDescriptor, compareFaces, arrayToDescriptor } from '@/lib/faceapi'
import type { Event } from '@/lib/types'

export default function SearchFacePage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEvent(eventId)
        setEvent(eventData)
        await loadFaceApiModels()
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur chargement événement')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) loadEvent()
  }, [eventId])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSearching(true)
    setError('')
    setResults([])

    try {
      // Charger l'image
      const img = new Image()
      img.src = URL.createObjectURL(file)

      img.onload = async () => {
        try {
          // Extraire le descripteur de l'image de recherche
          const searchDescriptor = await getFaceDescriptor(img)
          if (!searchDescriptor) {
            setError('❌ Aucun visage détecté dans votre photo')
            setSearching(false)
            return
          }

          // Récupérer tous les descripteurs de l'événement
          const eventDescriptors = await getEventDescriptors(eventId, event?.photographerName)

          // Comparer et limiter les résultats aux meilleurs
          const matches = await Promise.all(
            eventDescriptors.map(async (photoData) => {
              const distance = await compareFaces(searchDescriptor, arrayToDescriptor(photoData.descriptor))
              return {
                ...photoData,
                distance,
                confidence: Math.max(0, 100 - distance * 100),
              }
            })
          )

          // Trier par score de confiance
          const sortedMatches = matches
            .filter(m => m.confidence > 30)
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 20)

          setResults(sortedMatches)

          if (sortedMatches.length === 0) {
            setError('❌ Aucune correspondance trouvée')
          }
        } catch (err) {
          console.error('Erreur recherche:', err)
          setError('Erreur lors de la recherche faciale')
        } finally {
          setSearching(false)
        }
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors du traitement de l\'image')
      setSearching(false)
    }
  }

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
        <Link href="/" className="btn-primary">← Accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link href={`/gallery/${eventId}`} className="text-white/60 hover:text-white transition-colors mb-2 block">← Galerie</Link>
          <h1 className="font-display font-bold text-2xl">🔍 Recherche par visage</h1>
          <p className="text-white/60 text-sm">{event.name}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="card mb-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-brand-blue hover:bg-brand-light/30 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={searching}
              className="hidden"
            />
            <div className="text-5xl mb-3">📸</div>
            <p className="font-medium text-gray-700 mb-1">Sélectionnez une photo</p>
            <p className="text-sm text-gray-500">Chargez une photo pour trouver les photos similaires</p>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {searching && (
            <div className="mt-4 text-center">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Recherche en cours...</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-gray-700 mb-4">
                {results.length} photo{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map(photo => (
                  <div key={photo.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={photo.thumbnailUrl}
                      alt="Match"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {photo.confidence.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

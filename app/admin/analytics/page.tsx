'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/auth'
import Link from 'next/link'

interface Analytics {
  event: {
    name: string
    date: string
    photosUploaded: number
  }
  analytics: {
    totalPhotos: number
    totalRevenue: number
    totalDownloads: number
    totalPurchases: number
    averagePhotosPerPurchase: number
  }
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)

  const auth = authService.getAuth()

  useEffect(() => {
    // Charger les événements du photographe
    async function loadEvents() {
      if (!auth) return
      // En production, récupérer les vrais événements
      setEvents([])
    }
    loadEvents()
  }, [auth])

  const loadAnalytics = async (eventId: string) => {
    if (!auth || !eventId) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/analytics?eventId=${eventId}&photographerId=${auth.photographerId}`
      )
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Erreur chargement analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
          <Link href="/auth/login" className="btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-bold text-brand-navy">📊 Analytics</h1>
          <Link href="/admin" className="btn-secondary">
            ← Retour
          </Link>
        </div>

        {/* Sélection événement */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un événement
          </label>
          <div className="flex gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value)
                if (e.target.value) loadAnalytics(e.target.value)
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Choisir un événement</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card Détails événement */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">Événement</p>
              <h2 className="text-2xl font-bold text-brand-navy">{analytics.event.name}</h2>
              <p className="text-gray-600 text-sm mt-2">
                {new Date(analytics.event.date).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {/* Card Photos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">Photos uploadées</p>
              <h2 className="text-4xl font-bold text-blue-600">
                {analytics.analytics.totalPhotos}
              </h2>
            </div>

            {/* Card Revenus */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">Revenus totaux</p>
              <h2 className="text-4xl font-bold text-green-600">
                {analytics.analytics.totalRevenue.toLocaleString()} FCFA
              </h2>
            </div>

            {/* Card Téléchargements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">Téléchargements</p>
              <h2 className="text-4xl font-bold text-purple-600">
                {analytics.analytics.totalDownloads}
              </h2>
            </div>

            {/* Card Achats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">Achats confirmés</p>
              <h2 className="text-4xl font-bold text-orange-600">
                {analytics.analytics.totalPurchases}
              </h2>
            </div>

            {/* Card Moyenne */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-sm">Moy. par achat</p>
              <h2 className="text-4xl font-bold text-indigo-600">
                {analytics.analytics.averagePhotosPerPurchase} photos
              </h2>
            </div>
          </div>
        )}

        {!loading && !analytics && selectedEventId && (
          <div className="text-center text-gray-500 py-12">
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}

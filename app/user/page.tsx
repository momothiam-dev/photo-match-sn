"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listEvents } from '@/lib/firestore'
import type { Event } from '@/lib/types'

export default function UserHomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-display font-bold">Galerie publique</h1>
          <p className="text-white/70 text-sm">Parcourez les événements et achetez des photos</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucun événement disponible.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(e => (
              <Link key={e.id} href={`/user/gallery/${e.id}`} className="card p-4 hover:shadow">
                <h3 className="font-semibold text-lg text-brand-navy">{e.name}</h3>
                <p className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-gray-400 mt-2">{e.totalPhotos || 0} photo{(e.totalPhotos || 0) > 1 ? 's' : ''}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

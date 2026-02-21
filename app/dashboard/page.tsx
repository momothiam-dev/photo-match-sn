'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listEvents } from '@/lib/firestore'
import type { Event } from '@/lib/types'

export default function DashboardPage() {
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalPhotos = events.reduce((sum, e) => sum + (e.totalPhotos || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📷</span>
          <div>
            <h1 className="font-display font-bold text-lg">Photo-Match SN</h1>
            <p className="text-white/60 text-xs">Espace Photographe</p>
          </div>
        </div>
        <Link href="/admin/new-event" className="bg-brand-gold text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all">
          + Nouvel événement
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Événements',  value: loading ? '...' : events.length.toString(),        icon: '🗓️' },
            { label: 'Photos',      value: loading ? '...' : totalPhotos.toString(),           icon: '🖼️' },
            { label: 'Actifs',      value: loading ? '...' : events.filter(e => e.status === 'active').length.toString(), icon: '✅' },
            { label: 'Revenus',     value: '0 FCFA',                                           icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-brand-navy">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Liste des événements */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Mes événements</h2>
          </div>

          {loading && (
            <div className="text-center py-12 text-gray-400">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Chargement...</p>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📂</div>
              <p className="font-medium text-gray-500 mb-2">Aucun événement pour le moment</p>
              <p className="text-sm mb-6">Créez votre premier événement pour commencer</p>
              <Link href="/admin/new-event" className="btn-primary inline-block">
                Créer un événement
              </Link>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="space-y-3">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/admin/event/${event.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand-blue hover:bg-brand-light/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-xl">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors">
                        {event.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-bold text-brand-navy">{event.totalPhotos || 0}</p>
                      <p className="text-xs text-gray-400">photos</p>
                    </div>
                    <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                      {event.status === 'active' ? 'Actif' : 'Archivé'}
                    </span>
                    <span className="text-gray-300 group-hover:text-brand-blue transition-colors">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

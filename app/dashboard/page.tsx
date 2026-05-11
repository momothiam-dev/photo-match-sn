'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listEvents, getPhotographerEarnings } from '@/lib/firestore'
import type { Event } from '@/lib/types'
import { BackButton } from '@/components/BackButton'
import { Calendar, Image, CheckCircle, DollarSign, FolderOpen, Camera, Plus, ChevronRight, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [earnings, setEarnings] = useState(0)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      listEvents(),
      getPhotographerEarnings()
    ]).then(([eventsData, earningsData]) => {
      setEvents(eventsData)
      setEarnings(earningsData)
    })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalPhotos = events.reduce((sum, e) => sum + (e.totalPhotos || 0), 0)

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <header className="bg-brand-navy-light dark:bg-brand-navy-light/50 text-white px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <BackButton fallback="/" className="text-white/60 hover:text-white mb-6" />
            <h1 className="text-4xl font-display font-bold mb-2">Espace Photographe</h1>
            <p className="text-white/60 text-lg">Gérez vos événements et suivez vos revenus.</p>
          </div>
          <Link href="/admin/new-event" className="btn-primary bg-brand-gold hover:bg-brand-gold/90 text-brand-navy px-8 py-3.5 shadow-lg shadow-brand-gold/20 flex items-center gap-2">
            <Plus size={20} /> Nouvel événement
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Événements',  value: loading ? '...' : events.length.toString(),        icon: Calendar },
            { label: 'Photos',      value: loading ? '...' : totalPhotos.toString(),           icon: Image },
            { label: 'Actifs',      value: loading ? '...' : events.filter(e => e.status === 'active').length.toString(), icon: CheckCircle },
            { label: 'Revenus',     value: loading ? '...' : `${earnings.toLocaleString()} FCFA`, icon: DollarSign },
          ].map(stat => (
            <div key={stat.label} className="card flex flex-col items-center justify-center p-8">
              <stat.icon size={40} className="mb-3 text-brand-blue" />
              <div className="text-2xl font-bold text-brand-navy dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Liste des événements */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-brand-navy/50">
            <h2 className="text-xl font-display font-semibold text-brand-navy dark:text-white">Mes événements récents</h2>
            {!loading && events.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{events.length} au total</span>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 size={40} className="mx-auto mb-4 text-brand-blue animate-spin" />
              <p>Chargement de vos données...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24 px-8">
              <FolderOpen size={64} className="mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-2">Aucun événement</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                Commencez par créer votre premier événement pour importer vos photos et les partager.
              </p>
              <Link href="/admin/new-event" className="btn-primary">
                Créer un événement
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/admin/event/${event.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-8 hover:bg-gray-50 dark:hover:bg-brand-navy/30 transition-colors group"
                >
                  <div className="flex items-center gap-6 mb-4 sm:mb-0">
                    <div className="w-16 h-16 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera size={32} className="text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{event.location || 'Sénégal'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-brand-navy dark:text-white">{event.totalPhotos || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Photos</p>
                    </div>
                    <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                      {event.status === 'active' ? 'Actif' : 'Archivé'}
                    </span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-400 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
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

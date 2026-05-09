"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listEvents } from '@/lib/firestore'
import type { Event } from '@/lib/types'
import { BackButton } from '@/components/BackButton'

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
    <div className="min-h-[calc(100vh-73px)]">
      <header className="bg-brand-navy-light dark:bg-brand-navy-light/50 text-white px-6 py-12 relative overflow-hidden">
        {/* Abstract pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <BackButton fallback="/" className="text-white/60 hover:text-white mb-6" />
          <h1 className="text-4xl font-display font-bold mb-2">Galeries Publiques</h1>
          <p className="text-white/60 text-lg">Retrouvez vos photos et commandez-les en haute qualité.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card h-40 animate-pulse bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-20 card">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-lg">Aucun événement n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(e => (
              <Link 
                key={e.id} 
                href={`/user/gallery/${e.id}`} 
                className="card group flex items-center justify-between p-8 hover:-translate-y-1 transition-all"
              >
                <div>
                  <div className="badge badge-info mb-3">
                    {new Date(e.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="font-display text-2xl text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
                    {e.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">📸 {e.totalPhotos || 0} photos</span>
                    <span className="flex items-center gap-1">📍 {e.location || 'Sénégal'}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

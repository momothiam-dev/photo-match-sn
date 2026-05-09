'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/lib/firestore'
import type { Event } from '@/lib/types'
import dynamic from 'next/dynamic'
import { BackButton } from '@/components/BackButton'

const UploadZone        = dynamic(() => import('@/components/photographer/UploadZone'), { ssr: false })
const QRCodeGenerator   = dynamic(() => import('@/components/photographer/QRCodeGenerator'), { ssr: false })

export default function EventDetailPage() {
  const params  = useParams()
  const eventId = params.eventId as string

  const [event, setEvent]   = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState<'upload' | 'qr' | 'photos'>('upload')

  useEffect(() => {
    getEvent(eventId)
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">😕</div>
        <p className="text-gray-500 text-xl font-medium">Événement introuvable.</p>
        <BackButton fallback="/admin" label="Retour au dashboard" className="btn-secondary" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)]">
      <header className="bg-brand-navy-light dark:bg-brand-navy-light/50 text-white px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <BackButton fallback="/admin" className="text-white/60 hover:text-white mb-6" />
            <h1 className="text-4xl font-display font-bold mb-2">{event.name}</h1>
            <div className="flex items-center gap-4 text-white/60 text-lg">
              <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>•</span>
              <span>{event.location || 'Sénégal'}</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-4xl font-bold text-brand-gold">{event.totalPhotos || 0}</p>
            <p className="text-white/50 text-xs uppercase font-bold tracking-widest">Photos Indexées</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl mb-10">
          {([
            { key: 'upload', label: '⬆️ Upload photos' },
            { key: 'qr',     label: '📱 QR Code' },
            { key: 'photos', label: '🖼️ Galerie' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300
                ${tab === t.key 
                  ? 'bg-white dark:bg-brand-navy text-brand-blue shadow-premium' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card">
          {tab === 'upload' && (
            <div>
              <h2 className="text-2xl font-display text-brand-navy dark:text-white mb-2">Upload des photos</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Vos clichés seront optimisés pour le web, marqués avec votre filigrane et indexés pour la recherche faciale.
              </p>
              <UploadZone
                eventId={eventId}
                photographerName={event.photographerName}
                onComplete={(total) => {
                  setEvent(prev => prev ? { ...prev, totalPhotos: (prev.totalPhotos || 0) + total } : prev)
                }}
              />
            </div>
          )}

          {tab === 'qr' && (
            <div className="text-center">
              <h2 className="text-2xl font-display text-brand-navy dark:text-white mb-2">Partager l&apos;événement</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                Partagez ce QR Code avec vos invités pour qu&apos;ils accèdent directement à leur galerie.
              </p>
              <div className="bg-gray-50 dark:bg-brand-navy p-8 rounded-3xl inline-block border border-gray-100 dark:border-gray-800 shadow-inner">
                <QRCodeGenerator eventId={eventId} eventName={event.name} />
              </div>
            </div>
          )}

          {tab === 'photos' && (
            <div>
              <h2 className="text-2xl font-display text-brand-navy dark:text-white mb-2">Gestion des photos</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {event.totalPhotos} photo{event.totalPhotos > 1 ? 's' : ''} indexée{event.totalPhotos > 1 ? 's' : ''} dans cette galerie.
              </p>
              
              {event.totalPhotos === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-brand-navy rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="text-5xl mb-4">🖼️</div>
                  <p className="text-gray-500">Commencez par uploader quelques clichés.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/gallery?eventId=${eventId}`} className="btn-primary flex-1 flex items-center justify-center gap-3 py-4">
                    <span>📷</span> Voir la galerie publique
                  </Link>
                  <Link href={`/search-face/${eventId}`} className="btn-secondary flex-1 flex items-center justify-center gap-3 py-4">
                    <span>🔍</span> Tester la recherche faciale
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

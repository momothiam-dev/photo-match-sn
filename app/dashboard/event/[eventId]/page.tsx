'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEvent } from '@/lib/firestore'
import type { Event } from '@/lib/types'
import dynamic from 'next/dynamic'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Événement introuvable.</p>
        <Link href="/admin" className="btn-secondary">← Retour au dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-white/60 hover:text-white transition-colors">← Retour</Link>
        <div className="flex-1">
          <h1 className="font-display font-bold text-lg">{event.name}</h1>
          <p className="text-white/60 text-xs">
            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">{event.totalPhotos}</p>
          <p className="text-white/50 text-xs">photos</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {([
            { key: 'upload', label: '⬆️ Upload photos' },
            { key: 'qr',     label: '📱 QR Code' },
            { key: 'photos', label: '🖼️ Galerie' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${tab === t.key ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab : Upload */}
        {tab === 'upload' && (
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-brand-navy mb-1">Upload des photos</h2>
            <p className="text-gray-400 text-sm mb-6">
              Les photos seront uploadées sur Cloudinary et indexées automatiquement par l&apos;IA.
            </p>
            <UploadZone
              eventId={eventId}
              photographerName={event.photographerName}
              onComplete={(total) => {
                setEvent(prev => prev ? { ...prev, totalPhotos: prev.totalPhotos + total } : prev)
              }}
            />
          </div>
        )}

        {/* Tab : QR Code */}
        {tab === 'qr' && (
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-brand-navy mb-1">QR Code de l&apos;événement</h2>
            <p className="text-gray-400 text-sm mb-6">
              Imprimez ce QR Code ou partagez-le. Les invités accèdent à la galerie en le scannant.
            </p>
            <QRCodeGenerator eventId={eventId} eventName={event.name} />
          </div>
        )}

        {/* Tab : Galerie */}
        {tab === 'photos' && (
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-brand-navy mb-1">Photos de l&apos;événement</h2>
            <p className="text-gray-400 text-sm mb-6">{event.totalPhotos} photo{event.totalPhotos > 1 ? 's' : ''} indexée{event.totalPhotos > 1 ? 's' : ''}</p>
            {event.totalPhotos === 0
              ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-sm">Aucune photo uploadée pour le moment.</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  <Link href={`/gallery/${eventId}`} className="btn-primary inline-block">
                    📷 Voir la galerie
                  </Link>
                  <Link href={`/search-face/${eventId}`} className="btn-secondary inline-block ml-3">
                    🔍 Rechercher par visage
                  </Link>
                </div>
              )
            }
          </div>
        )}
      </main>
    </div>
  )
}

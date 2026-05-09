'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEventPhotos, getEvent } from '@/lib/firestore'
import type { Photo, Event } from '@/lib/types'
import { BackButton } from '@/components/BackButton'
import { Image as ImageIcon, Camera, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function EventGalleryPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEvent(eventId)
        setEvent(eventData)

        const photosData = await getEventPhotos(eventId, eventData?.photographerName || 'Photo-Match SN')
        setPhotos(photosData)
      } catch (err) {
        console.error('Erreur chargement galerie:', err)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) loadData()
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-white dark:bg-brand-navy">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
          <p className="text-gray-500 animate-pulse font-medium">Sécurisation de l'accès...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center gap-6 bg-white dark:bg-brand-navy">
        <div className="text-8xl animate-bounce">😕</div>
        <p className="text-gray-500 text-2xl font-medium">Événement introuvable.</p>
        <BackButton fallback="/user" label="Retour aux événements" className="btn-secondary px-8 py-3" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white dark:bg-brand-navy pb-32">
      <header className="bg-brand-navy-light dark:bg-brand-navy-light/50 text-white px-6 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <BackButton fallback="/user" className="text-white/60 hover:text-white mb-10 inline-flex items-center gap-2" />
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight leading-none animate-slide-up">
            {event.name}
          </h1>
          <div className="flex items-center justify-center gap-6 text-white/60 text-lg animate-slide-up [animation-delay:100ms]">
            <span className="flex items-center gap-2"><ImageIcon size={20} /> {photos.length} photos</span>
            <span className="opacity-30">|</span>
            <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 -mt-16 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="card !p-0 overflow-hidden shadow-2xl border-none ring-1 ring-black/5 dark:ring-white/5 animate-slide-up [animation-delay:200ms]">
            <div className="grid md:grid-cols-2">
              {/* Left Side: Info & Privacy */}
              <div className="p-10 md:p-14 bg-gray-50 dark:bg-brand-navy-light/30">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-8">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-display font-bold text-brand-navy dark:text-white mb-6">
                  Galerie Sécurisée
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                  Pour protéger la vie privée des invités, cette galerie est protégée par reconnaissance faciale. 
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    Accès instantané à vos photos uniquement
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    Confidentialité totale garantie
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    Recherche par scan ou par import
                  </li>
                </ul>
              </div>

              {/* Right Side: Actions */}
              <div className="p-10 md:p-14 bg-white dark:bg-brand-navy flex flex-col justify-center gap-6">
                <Link 
                  href={`/search-face/${eventId}`}
                  className="group flex items-center gap-6 p-6 rounded-3xl border-2 border-brand-blue/20 hover:border-brand-blue hover:bg-brand-blue/5 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-brand-navy dark:text-white">Scanner mon visage</h3>
                    <p className="text-sm text-gray-500">Utiliser la caméra</p>
                  </div>
                </Link>

                <Link 
                  href={`/search-face/${eventId}`}
                  className="group flex items-center gap-6 p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 hover:border-brand-gold hover:bg-brand-gold/5 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-brand-navy dark:text-white">Importer une photo</h3>
                    <p className="text-sm text-gray-500">Depuis votre galerie</p>
                  </div>
                </Link>
                
                <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-4">
                  Protection des données RGPD active
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

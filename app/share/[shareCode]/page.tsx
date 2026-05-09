'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { shareService } from '@/lib/share'

interface SharedGallery {
  name: string
  date: string
  photos: any[]
}

export default function SharedGalleryPage() {
  const params = useParams()
  const shareCode = params?.shareCode as string
  const [gallery, setGallery] = useState<SharedGallery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch(`/api/share-gallery/${shareCode}`)
        if (!response.ok) {
          setError('Galerie non trouvée')
          return
        }

        const data = await response.json()
        setGallery(data.event)
      } catch (err) {
        setError('Erreur chargement galerie')
      } finally {
        setLoading(false)
      }
    }

    if (shareCode) loadGallery()
  }, [shareCode])

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `Découvrez les photos de ${gallery?.name || 'mon événement'} sur Photo-Match SN!`

    if (platform === 'whatsapp') shareService.shareWhatsApp(text, url)
    else if (platform === 'facebook') shareService.shareFacebook(url)
    else if (platform === 'twitter') shareService.shareTwitter(text, url)
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      shareService.copyLink(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Galerie introuvable'}</p>
          <Link href="/" className="btn-primary">
            ← Accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-brand-navy mb-2">{gallery.name}</h1>
          <p className="text-gray-600">
            {new Date(gallery.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Actions de partage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-sm text-gray-600 mb-4">Partager cette galerie:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              📱 WhatsApp
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              f Facebook
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition text-sm"
            >
              𝕏 Twitter
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
            >
              {copied ? '✅ Copié!' : '🔗 Copier le lien'}
            </button>
          </div>
        </div>

        {/* Galerie */}
        {gallery.photos && gallery.photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.photos.map((photo, idx) => (
              <div key={photo.id || idx} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative w-full h-64 bg-gray-200">
                  <Image
                    src={photo.watermarkUrl}
                    alt="Photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <Link
                    href={`/photo/${photo.id}`}
                    className="block btn-secondary text-center text-sm"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p>Aucune photo dans cette galerie</p>
          </div>
        )}
      </div>
    </div>
  )
}

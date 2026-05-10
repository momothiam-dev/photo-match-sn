'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPhoto, getEvent, createPurchase } from '@/lib/firestore'
import type { Photo, Event, Purchase } from '@/lib/types'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const singlePhotoId = searchParams.get('photoId')
  const multiplePhotoIds = searchParams.get('photoIds')
  const idsToFetch = multiplePhotoIds ? multiplePhotoIds.split(',') : (singlePhotoId ? [singlePhotoId] : [])

  const [photos, setPhotos] = useState<Photo[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'paytech'>('wave')

    async function loadData() {
      if (idsToFetch.length === 0) {
        setError('Aucune photo sélectionnée')
        setLoading(false)
        return
      }

      try {
        const fetchedPhotos: Photo[] = []
        let currentEvent: Event | null = null

        for (const id of idsToFetch) {
          const photoData = await getPhoto(id)
          if (photoData) {
            fetchedPhotos.push(photoData)
          }
        }

        if (fetchedPhotos.length === 0) {
          setError('Photos introuvables')
          return
        }

        currentEvent = await getEvent(fetchedPhotos[0].eventId)
        setEvent(currentEvent)
        
        if (currentEvent) {
          const { getThumbnailUrl } = await import('@/lib/cloudinary')
          const updatedPhotos = fetchedPhotos.map(p => {
            if (p.cloudinaryPublicId) {
              return { ...p, thumbnailUrl: getThumbnailUrl(p.cloudinaryPublicId, currentEvent!.photographerName) }
            }
            return p
          })
          setPhotos(updatedPhotos)
        } else {
          setPhotos(fetchedPhotos)
        }
      } catch (err) {
        console.error('Erreur chargement:', err)
        setError('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchParams])

  const handlePurchase = async () => {
    if (photos.length === 0 || !event) return

    setProcessing(true)
    setError('')

    try {
      // Appeler l'API de paiement
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds: photos.map(p => p.id),
          eventId: event.id,
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du paiement')
      }

      const { purchaseId, paymentUrl } = await response.json()
      console.log('✅ Paiement initié:', purchaseId)

      // Rediriger vers le fournisseur de paiement réel si on reçoit une URL externe
      if (paymentUrl && paymentUrl.startsWith('http')) {
        window.location.href = paymentUrl
        return
      }

      // Sinon, rediriger vers la page de succès interne
      router.push(`/success?purchaseId=${purchaseId}`)

    } catch (err) {
      console.error('Erreur achat:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || photos.length === 0 || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || 'Erreur de chargement.'}</p>
        <Link href="/" className="btn-primary">← Accueil</Link>
      </div>
    )
  }

  const totalAmount = event.pricePerPhoto * photos.length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors mb-2 block">← Retour</button>
          <h1 className="font-display font-bold text-xl">🛒 Checkout</h1>
          <p className="text-white/60 text-sm">{event.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Résumé de la commande */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-brand-navy mb-4">Résumé de la commande</h2>

            <div className="flex gap-4 mb-4">
              <div className="relative w-20 h-20">
                <img
                  src={photos[0].thumbnailUrl}
                  alt={photos[0].filename}
                  className="w-full h-full object-cover rounded-lg"
                />
                {photos.length > 1 && (
                  <div className="absolute -bottom-2 -right-2 bg-brand-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                    +{photos.length - 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{photos.length} photo{photos.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-gray-500">{event.name}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">{totalAmount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-brand-navy mt-2">
                <span>Total</span>
                <span>{totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-brand-navy mb-4">Mode de paiement</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-blue transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="wave"
                  checked={paymentMethod === 'wave'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'wave')}
                  className="w-4 h-4 text-brand-blue"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">W</div>
                  <div>
                    <p className="font-medium">Wave</p>
                    <p className="text-sm text-gray-500">Paiement mobile rapide</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-blue transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="orange_money"
                  checked={paymentMethod === 'orange_money'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'orange_money')}
                  className="w-4 h-4 text-brand-blue"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">O</div>
                  <div>
                    <p className="font-medium">Orange Money</p>
                    <p className="text-sm text-gray-500">Paiement mobile sécurisé</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-brand-blue transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="paytech"
                  checked={paymentMethod === 'paytech'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'paytech')}
                  className="w-4 h-4 text-brand-blue"
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">P</div>
                  <div>
                    <p className="font-medium">PayTech</p>
                    <p className="text-sm text-gray-500">Paiement par carte (PayTech)</p>
                  </div>
                </div>
              </label>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={processing}
              className="btn-primary w-full mt-6"
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Traitement...
                </span>
              ) : (
                `Payer ${totalAmount.toLocaleString()} FCFA`
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Purchase } from '@/lib/types'

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get('purchaseId')

  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (url: string, filename: string) => {
    try {
      setDownloading(filename)

      // Utiliser fetch + blob pour télécharger le fichier
      const response = await fetch(url)
      if (!response.ok) throw new Error('Erreur téléchargement')

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Erreur téléchargement:', err)
      alert('Erreur téléchargement. Vérifiez votre connexion.')
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    async function loadPurchase() {
      if (!purchaseId) {
        setError('Aucun achat trouvé')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/purchase-data?purchaseId=${purchaseId}`)
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Achat introuvable')
          setLoading(false)
          return
        }

        const { purchase: purchaseData } = await response.json()
        setPurchase(purchaseData)

        // En développement, simuler la confirmation automatique du paiement
        if (purchaseData && purchaseData.status === 'pending') {
          console.log('🔄 Simulation de confirmation de paiement...')
          const confirmResponse = await fetch('/api/payment/simulate-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId }),
          })

          if (confirmResponse.ok) {
            // Recharger les données du purchase après confirmation
            const updatedResponse = await fetch(`/api/purchase-data?purchaseId=${purchaseId}`)
            if (updatedResponse.ok) {
              const { purchase: updatedPurchase } = await updatedResponse.json()
              setPurchase(updatedPurchase)
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement achat:', err)
        setError('Erreur lors du chargement de l\'achat')
      } finally {
        setLoading(false)
      }
    }

    loadPurchase()
  }, [purchaseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || 'Achat introuvable.'}</p>
        <Link href="/user" className="btn-primary">← Accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="font-display text-2xl font-bold text-brand-navy mb-2">Paiement réussi !</h1>
          <p className="text-gray-600 mb-6">
            Votre achat a été confirmé. Vous pouvez maintenant télécharger vos photos en haute définition.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Détails de l'achat</p>
            <p className="font-semibold text-brand-navy">
              {purchase.photoIds.length} photo{purchase.photoIds.length > 1 ? 's' : ''} • {purchase.totalAmount.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ID: {purchase.id} • {new Date(purchase.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>

          {purchase.originalUrls && purchase.originalUrls.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {purchase.originalUrls.map((url, idx) => {
                  const filename = `photo-${purchase.id}-${idx + 1}.jpg`

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDownload(url, filename)}
                      disabled={downloading === filename}
                      className="btn-primary block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === filename ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Téléchargement...
                        </span>
                      ) : (
                        `📥 Télécharger photo ${idx + 1}`
                      )}
                    </button>
                  )
                })}
              </div>
              <Link href="/user" className="btn-secondary block">
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Paiement en cours de traitement...</p>
              <p className="text-xs text-gray-400">Les liens de téléchargement apparaîtront ici dès que le paiement sera confirmé.</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary w-full"
              >
                🔄 Rafraîchir
              </button>
              <Link href="/user" className="btn-secondary block">
                Retour à l'accueil
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
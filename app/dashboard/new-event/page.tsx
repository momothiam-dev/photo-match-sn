'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent } from '@/lib/firestore'

export default function NewEventPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name:              '',
    date:              '',
    location:          '',
    photographerName:  '',
    pricePerPhoto:     500,
    isFree:            false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!form.name.trim()) {
      setError('Le nom de l\'événement est requis')
      return
    }
    if (!form.date) {
      setError('La date est requise')
      return
    }
    if (!form.photographerName.trim()) {
      setError('Votre nom est requis')
      return
    }

    // Vérifier Firebase
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      setError('❌ Firebase n\'est pas configuré! Complétez les variables d\'environnement dans .env.local')
      console.error('Firebase variables manquantes:')
      console.error('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗')
      console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗')
      console.error('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓' : '✗')
      return
    }

    setLoading(true)
    setError('')
    
    // Timeout de 15 secondes
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('❌ Timeout: La création prend trop de temps. Vérifiez votre connexion et que Firebase est bien configuré.')
      console.error('Timeout après 15s')
    }, 15000)
    
    try {
      console.log('🚀 Création de l\'événement...', form)
      const eventId = await createEvent({
        name:             form.name.trim(),
        date:             form.date,
        location:         form.location.trim(),
        photographerName: form.photographerName.trim(),
        pricePerPhoto:    form.isFree ? 0 : Number(form.pricePerPhoto),
        totalPhotos:      0,
        status:           'active',
      })
      clearTimeout(timeoutId)
      
      console.log('✅ Événement créé:', eventId)
      
      if (eventId) {
        router.push(`/admin/event/${eventId}`)
      } else {
        throw new Error('Pas d\'ID retourné par createEvent')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('[NewEvent] ❌ Erreur:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(`❌ Erreur: ${message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-navy text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-white/60 hover:text-white transition-colors">← Retour</Link>
        <h1 className="font-display font-bold text-lg">Nouvel événement</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Info Firebase */}
        {!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">⚠️ Firebase non configuré</p>
            <p className="text-xs text-yellow-700 mt-2">Complétez les variables d'environnement dans <code className="bg-yellow-100 px-1 rounded">.env.local</code></p>
          </div>
        )}

        <div className="card">
          {/* Affichage des erreurs */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l&apos;événement *</label>
              <input name="name" type="text" required placeholder="ex: Mariage Diallo — 15 Fév 2026"
                value={form.name} onChange={handleChange} className="input-field" disabled={loading} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input name="date" type="date" required value={form.date} onChange={handleChange} className="input-field" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                <input name="location" type="text" placeholder="ex: Hôtel Radisson, Dakar"
                  value={form.location} onChange={handleChange} className="input-field" disabled={loading} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre nom (photographe) *</label>
              <input name="photographerName" type="text" required placeholder="ex: Studio Fatou Photography"
                value={form.photographerName} onChange={handleChange} className="input-field" disabled={loading} />
              <p className="text-xs text-gray-400 mt-1">Ce nom apparaîtra en watermark sur les photos.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tarification</label>
              <div className="flex items-center gap-3 mb-3">
                <input name="isFree" type="checkbox" id="isFree" checked={form.isFree} onChange={handleChange} className="w-4 h-4" disabled={loading} />
                <label htmlFor="isFree" className="text-sm text-gray-600">Galerie gratuite (portfolio / cadeau client)</label>
              </div>
              {!form.isFree && (
                <div className="flex items-center gap-3">
                  <input name="pricePerPhoto" type="number" min={100} step={100}
                    value={form.pricePerPhoto} onChange={handleChange} className="input-field w-40" disabled={loading} />
                  <span className="text-gray-500 text-sm">FCFA / photo</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Link href="/admin" className="btn-secondary flex-1 text-center pointer-events-none" style={{pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.5 : 1}}>Annuler</Link>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création...
                  </span>
                ) : (
                  'Créer l\'événement →'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

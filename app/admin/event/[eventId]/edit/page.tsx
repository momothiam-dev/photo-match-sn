'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  date: string
  location: string
  pricePerPhoto: number
  photographerId: string
  createdAt: Date
}

export default function EditEventPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const auth = authService.getAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    pricePerPhoto: 0,
  })

  useEffect(() => {
    async function loadEvent() {
      if (!auth) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch(`/api/event/${params.eventId}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data.event)
          setFormData({
            name: data.event.name,
            date: data.event.date,
            location: data.event.location,
            pricePerPhoto: data.event.pricePerPhoto,
          })
        }
      } catch (err) {
        console.error('Erreur chargement:', err)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [params.eventId, auth, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/event/${params.eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Événement mis à jour!')
        router.push('/admin')
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) return

    try {
      const response = await fetch(`/api/event/${params.eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Événement supprimé!')
        router.push('/admin')
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Événement introuvable</p>
          <Link href="/admin" className="btn-primary">
            Retour
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-brand-navy mb-8">✏️ Modifier l'événement</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix par photo (FCFA)</label>
            <input
              type="number"
              value={formData.pricePerPhoto}
              onChange={(e) => setFormData({ ...formData, pricePerPhoto: Number(e.target.value) })}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
            <Link href="/admin" className="flex-1 btn-secondary text-center">
              ← Annuler
            </Link>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

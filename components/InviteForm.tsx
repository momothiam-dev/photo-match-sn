'use client'

import { useState } from 'react'

interface InviteFormProps {
  eventId: string
  onClose: () => void
}

export function InviteForm({ eventId, onClose }: InviteFormProps) {
  const [emails, setEmails] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState("Vous êtes invité à consulter notre galerie d'événement!")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const emailList = emails.split('\n').filter((e) => e.trim())

      const response = await fetch('/api/send-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          emails: emailList,
          message,
          subject,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(onClose, 2000)
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">📧</div>
          <p className="text-gray-700 font-semibold mb-2">Invitations envoyées!</p>
          <p className="text-sm text-gray-500">Vos invitations ont été envoyées avec succès.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-brand-navy mb-4">📧 Envoyer des invitations</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresses email (une par ligne)
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              rows={5}
              placeholder="email1@example.com&#10;email2@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              rows={3}
              placeholder="Ajoutez un message personnalisé..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !emails.trim()}
              className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Envoi...' : '📤 Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

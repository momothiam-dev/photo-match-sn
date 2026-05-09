'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import { BackButton } from '@/components/BackButton'

export default function SystemAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'login' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Identifiants incorrects')
        return
      }

      authService.setAuth({
        photographerId: data.photographerId,
        email: data.email || email,
        token: data.token,
      })

      router.push('/dashboard')
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 bg-gray-50 dark:bg-brand-navy">
      <div className="card w-full max-w-md relative overflow-hidden shadow-2xl">
        {/* Accent decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-navy" />
        
        <div className="mb-8 mt-4">
          <BackButton fallback="/" className="mb-6 opacity-60 hover:opacity-100 transition-opacity" />
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🛡️
            </div>
            <h1 className="text-3xl font-display font-bold text-brand-navy dark:text-white mb-2">
              Panel Administration
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Accès sécurisé pour photographes
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400 text-sm flex items-center gap-3 animate-shake">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Identifiant Admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="input-field focus:ring-brand-blue focus:border-brand-blue"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="input-field focus:ring-brand-blue focus:border-brand-blue"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/30 active:scale-[0.98] transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Vérification...
              </span>
            ) : 'Accéder au Panel'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            Zone de sécurité restreinte
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/auth'
import Link from 'next/link'

interface Sale {
  id: string
  date: string
  buyerEmail: string
  photoCount: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'failed'
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all')

  const auth = authService.getAuth()

  useEffect(() => {
    async function loadSales() {
      if (!auth) return

      try {
        // En production, récupérer depuis l'API
        setSales([])
      } catch (err) {
        console.error('Erreur chargement ventes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [auth])

  const filteredSales = sales.filter((s) => filterStatus === 'all' || s.status === filterStatus)
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
          <Link href="/auth/login" className="btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-bold text-brand-navy">📊 Historique des ventes</h1>
          <Link href="/admin" className="btn-secondary">
            ← Retour
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">Total des ventes</p>
            <h2 className="text-4xl font-bold text-green-600">{filteredSales.length}</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">Revenus totaux</p>
            <h2 className="text-4xl font-bold text-blue-600">{totalRevenue.toLocaleString()} FCFA</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">Moyenne par vente</p>
            <h2 className="text-4xl font-bold text-purple-600">
              {filteredSales.length > 0 ? Math.round(totalRevenue / filteredSales.length) : 0} FCFA
            </h2>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === status
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? 'Toutes' : status === 'confirmed' ? 'Confirmées' : status === 'pending' ? 'En attente' : 'Échouées'}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSales.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Photos</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Montant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sale.buyerEmail}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sale.photoCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {sale.totalAmount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(sale.status)}`}>
                        {sale.status === 'confirmed' ? '✅ Confirmée' : sale.status === 'pending' ? '⏳ En attente' : '❌ Échouée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p>Aucune vente pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

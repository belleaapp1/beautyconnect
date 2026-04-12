'use client'
import { useEffect, useState } from 'react'
import { getProviderStats } from '@/lib/queries'
import { ProviderStats } from '@/types'

function MiniBar({ values, color = 'bg-pink-400' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const today = new Date().getDay()
  const labels = Array.from({ length: 7 }, (_, i) => days[(today - 6 + i + 7) % 7])
  return (
    <div className="flex items-end gap-1.5 h-24 mt-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-md ${color} opacity-80 transition-all`}
            style={{ height: `${Math.max((v / max) * 80, 4)}px` }}
            title={`${v} vues`}
          />
          <span className="text-[10px] text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color = 'text-gray-900' }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<ProviderStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProviderStats().then(s => { setStats(s); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return <p className="text-gray-500 py-10 text-center">Erreur de chargement</p>

  const completionRate = stats.totalReservations > 0
    ? Math.round((stats.completedReservations / stats.totalReservations) * 100)
    : 0

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-500 mt-1">Aperçu de ton activité</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📅" label="Réservations" value={stats.totalReservations} sub="total" />
        <StatCard icon="⏳" label="En attente" value={stats.pendingReservations} color="text-amber-600" />
        <StatCard icon="✅" label="Terminées" value={stats.completedReservations} color="text-green-600" />
        <StatCard icon="💰" label="CA ce mois" value={`${stats.monthRevenue}€`} color="text-pink-600" />
      </div>

      {/* Views chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-900">Vues du profil</h2>
          <span className="text-2xl font-extrabold text-pink-500">{stats.profileViews}</span>
        </div>
        <p className="text-xs text-gray-400 mb-2">Vues au total · 7 derniers jours ci-dessous</p>
        <MiniBar values={stats.weeklyViews} color="bg-pink-400" />
      </div>

      {/* Reservation funnel */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Entonnoir des réservations</h2>
        {[
          { label: 'Total reçues', value: stats.totalReservations, color: 'bg-gray-300', pct: 100 },
          { label: 'Confirmées',   value: stats.confirmedReservations, color: 'bg-blue-400', pct: stats.totalReservations ? Math.round(stats.confirmedReservations / stats.totalReservations * 100) : 0 },
          { label: 'Terminées',    value: stats.completedReservations, color: 'bg-green-400', pct: completionRate },
        ].map(row => (
          <div key={row.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{row.label}</span>
              <span className="font-semibold">{row.value} <span className="text-gray-400 font-normal">({row.pct}%)</span></span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Rating */}
      {stats.avgRating && (
        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl flex-shrink-0">⭐</div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Note moyenne</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-0.5">{stats.avgRating} <span className="text-base text-gray-400 font-normal">/ 5</span></p>
            <p className="text-xs text-gray-400">{stats.reviewCount} avis clients</p>
          </div>
        </div>
      )}
    </div>
  )
}

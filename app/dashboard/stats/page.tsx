'use client'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { getProviderStats } from '@/lib/queries'
import { ProviderStats } from '@/types'

function StatCard({ icon, label, value, sub, colorClass = 'text-gray-900' }: {
  icon: string; label: string; value: string | number; sub?: string; colorClass?: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-extrabold mt-1 ${colorClass}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card px-3 py-2 text-sm">
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="font-bold text-pink-600">{payload[0].value} vues</p>
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats]   = useState<ProviderStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProviderStats()
      .then(s => { setStats(s); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!stats) return <p className="text-gray-500 py-10 text-center">Erreur de chargement</p>

  const completionRate = stats.totalReservations > 0
    ? Math.round((stats.completedReservations / stats.totalReservations) * 100) : 0

  // Build last-7-days labels
  const today = new Date()
  const dayLabels = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const viewsData = stats.weeklyViews.map((count, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return { day: dayLabels[d.getDay()], vues: count }
  })

  // Reservations by status bar chart
  const resData = [
    { name: 'En attente',  value: stats.pendingReservations,   fill: '#FCD34D' },
    { name: 'Confirmées',  value: stats.confirmedReservations, fill: '#60A5FA' },
    { name: 'Terminées',   value: stats.completedReservations, fill: '#34D399' },
  ]

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de ton activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📅" label="Réservations" value={stats.totalReservations} sub="total" />
        <StatCard icon="⏳" label="En attente"   value={stats.pendingReservations}   colorClass="text-amber-500" />
        <StatCard icon="✅" label="Terminées"    value={stats.completedReservations} colorClass="text-emerald-600" />
        <StatCard icon="💰" label="CA ce mois"   value={`${stats.monthRevenue}€`}    colorClass="text-pink-600" />
      </div>

      {/* Area chart — weekly profile views */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Vues du profil</h2>
            <p className="text-xs text-gray-400 mt-0.5">7 derniers jours</p>
          </div>
          <span className="text-2xl font-extrabold text-pink-500">{stats.profileViews} <span className="text-sm font-normal text-gray-400">au total</span></span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={viewsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EC4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="vues"
              stroke="#EC4899" strokeWidth={2.5}
              fill="url(#pinkGrad)"
              dot={{ fill: '#EC4899', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart — reservations by status */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Réservations par statut</h2>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={resData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="bg-white border border-gray-100 rounded-xl shadow-card px-3 py-2 text-sm">
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="font-bold text-gray-900">{payload[0].value}</p>
                  </div>
                ) : null
              }
            />
            {resData.map(d => (
              <Bar key={d.name} dataKey="value" fill={d.fill} radius={[6, 6, 0, 0]} maxBarSize={48} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Entonnoir de conversion</h2>
        {[
          { label: 'Reçues',     value: stats.totalReservations,      pct: 100,             color: 'bg-gray-300' },
          { label: 'Confirmées', value: stats.confirmedReservations,  pct: stats.totalReservations ? Math.round(stats.confirmedReservations / stats.totalReservations * 100) : 0, color: 'bg-blue-400' },
          { label: 'Terminées',  value: stats.completedReservations,  pct: completionRate,  color: 'bg-emerald-400' },
        ].map(row => (
          <div key={row.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600 font-medium">{row.label}</span>
              <span className="font-semibold text-gray-900">{row.value} <span className="text-gray-400 font-normal text-xs">({row.pct}%)</span></span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Rating */}
      {stats.avgRating !== undefined && (
        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl flex-shrink-0">⭐</div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Note moyenne</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-0.5">
              {stats.avgRating} <span className="text-base font-normal text-gray-400">/ 5</span>
            </p>
            <p className="text-xs text-gray-400">{stats.reviewCount} avis clients</p>
          </div>
          {/* Star visual */}
          <div className="ml-auto flex gap-0.5">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`text-xl ${n <= Math.round(stats.avgRating ?? 0) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

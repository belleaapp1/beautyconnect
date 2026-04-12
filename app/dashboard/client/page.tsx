'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Reservation } from '@/types'
import Link from 'next/link'

const STATUS = {
  pending:   { label: 'En attente',  color: 'bg-amber-100 text-amber-700',  icon: '⏳' },
  confirmed: { label: 'Confirmée',   color: 'bg-blue-100 text-blue-700',    icon: '✅' },
  cancelled: { label: 'Annulée',     color: 'bg-red-100 text-red-500',      icon: '❌' },
  completed: { label: 'Terminée',    color: 'bg-green-100 text-green-700',  icon: '🎉' },
}

export default function ClientDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { setLoading(false); return }
      setEmail(user.email)
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .eq('client_email', user.email)
        .order('service_date', { ascending: false })
      setReservations(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const upcoming = reservations.filter(r => ['pending', 'confirmed'].includes(r.status))
  const history  = reservations.filter(r => ['completed', 'cancelled'].includes(r.status))

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
        <p className="text-sm text-gray-500 mt-1">{email}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'À venir',   value: upcoming.length,  color: 'text-blue-600' },
          { label: 'Terminées', value: history.filter(r => r.status === 'completed').length, color: 'text-green-600' },
          { label: 'Total',     value: reservations.length, color: 'text-gray-900' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3">📅 À venir</h2>
          <div className="space-y-3">
            {upcoming.map(r => <ReservationCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-500 text-sm mb-3">Historique</h2>
          <div className="space-y-2 opacity-75">
            {history.map(r => <ReservationCard key={r.id} r={r} compact />)}
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <div className="card p-10 text-center space-y-4">
          <span className="text-5xl block">💅</span>
          <p className="font-bold text-gray-700">Aucune réservation pour l&apos;instant</p>
          <p className="text-sm text-gray-400">Trouve ta prochaine prestataire et réserve en ligne</p>
          <Link href="/" className="btn-primary inline-block mt-2">Chercher une prestataire</Link>
        </div>
      )}
    </div>
  )
}

function ReservationCard({ r, compact = false }: { r: Reservation; compact?: boolean }) {
  const st = STATUS[r.status]
  return (
    <div className={`card p-4 ${compact ? '' : 'border border-gray-100'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{st.icon}</span>
            <p className="font-bold text-gray-900">{r.service_name}</p>
            <span className={`badge ${st.color}`}>{st.label}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>📅 {new Date(r.service_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à {r.service_time}</span>
            <span>💰 {r.total_price}€</span>
            {r.deposit_paid && <span className="text-green-600">💳 Acompte payé</span>}
          </div>
        </div>
        {!compact && r.status === 'confirmed' && (
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium flex-shrink-0">Confirmé ✓</span>
        )}
      </div>
    </div>
  )
}

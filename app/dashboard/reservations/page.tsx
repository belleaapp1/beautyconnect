'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Reservation } from '@/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmée',   color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée',     color: 'bg-red-100 text-red-700' },
  completed: { label: 'Terminée',    color: 'bg-gray-100 text-gray-600' },
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('profile_id', user.id)
      .order('service_date', { ascending: true })
    setReservations(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('reservations').update({ status }).eq('id', id)
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: status as Reservation['status'] } : r))
  }

  const pending = reservations.filter(r => r.status === 'pending')
  const upcoming = reservations.filter(r => r.status === 'confirmed')
  const past = reservations.filter(r => ['completed', 'cancelled'].includes(r.status))

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
        <p className="text-sm text-gray-500 mt-1">Gère les demandes de tes clientes</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'En attente', value: pending.length, color: 'text-amber-600' },
          { label: 'Confirmées', value: upcoming.length, color: 'text-green-600' },
          { label: 'Terminées', value: past.filter(r=>r.status==='completed').length, color: 'text-gray-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* En attente */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            En attente de confirmation ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(r => <ReservationCard key={r.id} reservation={r} onUpdate={updateStatus} />)}
          </div>
        </div>
      )}

      {/* Confirmées */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-900 mb-3">📅 Prochains rendez-vous</h2>
          <div className="space-y-3">
            {upcoming.map(r => <ReservationCard key={r.id} reservation={r} onUpdate={updateStatus} />)}
          </div>
        </div>
      )}

      {/* Passées */}
      {past.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-500 mb-3 text-sm">Historique</h2>
          <div className="space-y-2 opacity-70">
            {past.map(r => <ReservationCard key={r.id} reservation={r} onUpdate={updateStatus} compact />)}
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <div className="card p-10 text-center space-y-3">
          <span className="text-4xl">📅</span>
          <p className="font-semibold text-gray-700">Aucune réservation pour l&apos;instant</p>
          <p className="text-sm text-gray-400">Les demandes de tes clientes apparaîtront ici</p>
        </div>
      )}
    </div>
  )
}

function ReservationCard({ reservation: r, onUpdate, compact = false }: { reservation: Reservation; onUpdate: (id: string, status: string) => void; compact?: boolean }) {
  const st = STATUS_LABELS[r.status]
  return (
    <div className={`card p-4 ${compact ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900">{r.client_name}</p>
            <span className={`badge ${st.color}`}>{st.label}</span>
            {r.deposit_paid && <span className="badge bg-green-100 text-green-700">💳 Acompte payé</span>}
          </div>
          <p className="text-sm text-gray-600 mt-1">{r.service_name}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>📅 {new Date(r.service_date).toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' })} à {r.service_time}</span>
            <span>💰 {r.total_price}€ total · {r.deposit_amount}€ acompte</span>
          </div>
          {r.notes && <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{r.notes}&rdquo;</p>}
          <div className="text-xs text-gray-400 mt-1">{r.client_email} {r.client_phone && `· ${r.client_phone}`}</div>
        </div>
      </div>

      {r.status === 'pending' && !compact && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => onUpdate(r.id, 'confirmed')}
            className="btn-primary text-sm py-2 px-4">✓ Confirmer</button>
          <button onClick={() => onUpdate(r.id, 'cancelled')}
            className="btn-secondary text-sm py-2 px-4 text-red-500 hover:border-red-200">✕ Annuler</button>
        </div>
      )}
      {r.status === 'confirmed' && !compact && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => onUpdate(r.id, 'completed')}
            className="btn-secondary text-sm py-2 px-4">✅ Marquer terminée</button>
          <button onClick={() => onUpdate(r.id, 'cancelled')}
            className="text-sm text-red-400 hover:text-red-500 px-3">Annuler</button>
        </div>
      )}
    </div>
  )
}

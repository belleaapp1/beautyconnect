'use client'
import { useEffect, useState, useCallback } from 'react'
import { getAllProfiles, toggleProfileActive, deleteProfile, getAdminStats } from '@/lib/queries'
import { ProfileWithDetails, AdminStats, Reservation, Specialty } from '@/types'
import { getSpecialty } from '@/lib/constants'
import { createClient } from '@/lib/supabase'

// ── Bar chart (CSS only) ──────────────────────────────────────────────────────
function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const recent = data.slice(-14)
  return (
    <div className="flex items-end gap-0.5 h-16">
      {recent.map((d, i) => (
        <div key={i} className="flex-1">
          <div className="w-full bg-pink-400 rounded-t opacity-70 hover:opacity-100 transition-opacity cursor-default"
            style={{ height: `${Math.max((d.count / max) * 56, 2)}px` }}
            title={`${d.date}: ${d.count}`} />
        </div>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats }: { stats: AdminStats }) {
  const totalViews = stats.dailyViews.reduce((s, d) => s + d.count, 0)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI icon="👩" label="Prestataires"  value={stats.totalProviders}         sub={`${stats.activeProviders} actives`} />
        <KPI icon="📅" label="Reservations"  value={stats.totalReservations}      sub={`${stats.monthReservations} ce mois`} />
        <KPI icon="💰" label="CA total"       value={`${stats.totalRevenue}€`} />
        <KPI icon="💼" label="Commissions"    value={`${stats.totalCommissions.toFixed(2)}€`} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Vues du site — 14 derniers jours</h3>
            <p className="text-xs text-gray-400">Toutes pages confondues</p>
          </div>
          <p className="text-2xl font-extrabold text-pink-500">{totalViews} vues</p>
        </div>
        <BarChart data={stats.dailyViews} />
      </div>

      {stats.topProfiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">🏆 Top profils visités</h3>
          <div className="space-y-3">
            {stats.topProfiles.map((p, i) => {
              const sp = getSpecialty(p.specialty as Specialty)
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-lg">{sp.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.full_name}</span>
                  <span className="text-sm font-bold text-pink-600">{p.views} vues</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Providers tab ─────────────────────────────────────────────────────────────
function ProvidersTab() {
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const load = useCallback(async () => { setProfiles(await getAllProfiles()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const handleToggle = async (id: string, current: boolean) => {
    await toggleProfileActive(id, !current)
    setProfiles(ps => ps.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return
    await deleteProfile(id)
    setProfiles(ps => ps.filter(p => p.id !== id))
  }
  const filtered = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input type="text" placeholder="Rechercher par nom ou ville..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
        <button onClick={load} className="btn-secondary text-sm py-2 px-4">Actualiser</button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Prestataire','Ville','Specialite','Photos','Plan','Statut','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const sp = getSpecialty(p.specialty)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-sm flex-shrink-0">{sp.emoji}</div>
                          <div>
                            <p className="font-semibold text-gray-900">{p.full_name}</p>
                            {p.is_featured && <span className="text-xs text-amber-500">En vedette</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.city}</td>
                      <td className="px-4 py-3"><span className={`badge ${sp.color} text-xs`}>{sp.label}</span></td>
                      <td className="px-4 py-3 text-center text-gray-600">{p.photos?.length ?? 0}/5</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${p.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.is_featured ? 'Vedette' : 'Gratuit'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(p.id, p.is_active)}
                          className={`badge text-xs cursor-pointer ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                          {p.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <a href={`/prestataires/${p.id}`} target="_blank" className="text-xs text-blue-500 hover:text-blue-700">Voir</a>
                          <button onClick={() => handleDelete(p.id, p.full_name)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucune prestataire</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">{filtered.length} prestataire(s)</div>
        </div>
      )}
    </div>
  )
}

// ── Reservations tab ──────────────────────────────────────────────────────────
function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(100)
      setReservations(data ?? [])
      setLoading(false)
    }
    load()
  }, [])
  const SC: Record<string, string> = { pending:'bg-amber-100 text-amber-700', confirmed:'bg-blue-100 text-blue-700', completed:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-500' }
  const SL: Record<string, string> = { pending:'En attente', confirmed:'Confirmee', completed:'Terminee', cancelled:'Annulee' }
  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Cliente','Prestation','Date RDV','Montant','Acompte','Statut'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reservations.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.client_name}</p>
                  <p className="text-xs text-gray-400">{r.client_email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{r.service_name}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(r.service_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {r.service_time}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{r.total_price}€</td>
                <td className="px-4 py-3">
                  {r.deposit_paid
                    ? <span className="text-green-600 text-xs font-medium">✓ {r.deposit_amount}€</span>
                    : <span className="text-gray-400 text-xs">{r.deposit_amount}€</span>}
                </td>
                <td className="px-4 py-3"><span className={`badge text-xs ${SC[r.status]}`}>{SL[r.status]}</span></td>
              </tr>
            ))}
            {reservations.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune reservation</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">{reservations.length} reservation(s)</div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'providers' | 'reservations'

export default function AdminClient() {
  const [tab, setTab]         = useState<Tab>('overview')
  const [stats, setStats]     = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(s => { setStats(s); setLoadingStats(false) })
      .catch(() => setLoadingStats(false))
  }, [])

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'overview',     icon: '🏠', label: 'Vue ensemble' },
    { id: 'providers',    icon: '👥', label: 'Prestataires' },
    { id: 'reservations', icon: '📅', label: 'Reservations' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        loadingStats
          ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
          : stats ? <OverviewTab stats={stats} /> : <p className="text-gray-500 text-center py-10">Erreur de chargement</p>
      )}
      {tab === 'providers'    && <ProvidersTab />}
      {tab === 'reservations' && <ReservationsTab />}
    </div>
  )
}

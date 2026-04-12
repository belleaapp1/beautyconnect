'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { getAllProfiles, toggleProfileActive, deleteProfile } from '@/lib/queries'
import { ProfileWithDetails } from '@/types'
import { getSpecialty } from '@/lib/constants'

export default function AdminClient() {
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const load = useCallback(async () => { setProfiles(await getAllProfiles()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const handleToggle = async (id: string, current: boolean) => {
    await toggleProfileActive(id, !current)
    setProfiles(ps => ps.map(p => p.id === id ? {...p, is_active: !current} : p))
  }
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return
    await deleteProfile(id)
    setProfiles(ps => ps.filter(p => p.id !== id))
  }

  const filtered = profiles.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
  const stats = { total: profiles.length, active: profiles.filter(p => p.is_active).length, withPhotos: profiles.filter(p => p.photos?.length > 0).length }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[{label:'Total',value:stats.total,color:'text-gray-900'},{label:'Actifs',value:stats.active,color:'text-green-600'},{label:'Avec photos',value:stats.withPhotos,color:'text-pink-600'}].map(s => (
          <div key={s.label} className="card p-5 text-center"><p className={`text-3xl font-bold ${s.color}`}>{s.value}</p><p className="text-sm text-gray-500 mt-1">{s.label}</p></div>
        ))}
      </div>
      <div className="flex gap-3">
        <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
        <button onClick={load} className="btn-secondary text-sm py-2.5 px-4">Actualiser</button>
      </div>
      {loading ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Prestataire','Ville','Spécialité','Photos','Statut','Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const s = getSpecialty(p.specialty)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 flex items-center justify-center text-lg">
                            {p.photos?.[0]?.url ? <Image src={p.photos[0].url} alt={p.full_name} width={36} height={36} className="object-cover w-full h-full" /> : s.emoji}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[120px]">{p.full_name || '—'}</p>
                            <a href={`/prestataires/${p.id}`} target="_blank" className="text-xs text-pink-400 hover:underline">Voir →</a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.city || '—'}</td>
                      <td className="px-4 py-3"><span className={`badge ${s.color}`}>{s.emoji} {s.label}</span></td>
                      <td className="px-4 py-3 text-gray-600">{p.photos?.length ?? 0}/5</td>
                      <td className="px-4 py-3"><button onClick={() => handleToggle(p.id, p.is_active)} className={`px-3 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Actif' : 'Inactif'}</button></td>
                      <td className="px-4 py-3"><button onClick={() => handleDelete(p.id, p.full_name)} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg">Supprimer</button></td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune prestataire</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

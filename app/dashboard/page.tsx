'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMyProfile, updateProfile } from '@/lib/queries'
import { Profile, Specialty } from '@/types'
import { CITIES, SPECIALTIES, MAX_DESCRIPTION_LENGTH } from '@/lib/constants'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { getMyProfile().then(p => { setProfile(p); setLoading(false) }) }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true); setError('')
    try {
      await updateProfile({ full_name: profile.full_name, city: profile.city, description: profile.description, specialty: profile.specialty, whatsapp: profile.whatsapp })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { setError('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!profile) return <p className="text-gray-500">Erreur de chargement</p>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Mon profil</h1><p className="text-sm text-gray-500 mt-1">Visible par toutes les clientes</p></div>
        <Link href={`/prestataires/${profile.id}`} target="_blank" className="btn-secondary text-sm py-2 px-4 hidden sm:block">Voir mon profil →</Link>
      </div>
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label><input type="text" value={profile.full_name} onChange={e => setProfile(p => p ? {...p, full_name: e.target.value} : p)} className="input-field" placeholder="Sophie Martin" required maxLength={80} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Ville *</label><select value={profile.city} onChange={e => setProfile(p => p ? {...p, city: e.target.value} : p)} className="input-field cursor-pointer" required><option value="">Sélectionner</option>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Spécialité *</label><select value={profile.specialty} onChange={e => setProfile(p => p ? {...p, specialty: e.target.value as Specialty} : p)} className="input-field cursor-pointer">{SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp * <span className="text-gray-400 font-normal">(+33...)</span></label><input type="tel" value={profile.whatsapp} onChange={e => setProfile(p => p ? {...p, whatsapp: e.target.value} : p)} className="input-field" placeholder="+33612345678" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">({profile.description.length}/{MAX_DESCRIPTION_LENGTH})</span></label><textarea value={profile.description} onChange={e => setProfile(p => p ? {...p, description: e.target.value} : p)} className="input-field resize-none" rows={4} maxLength={MAX_DESCRIPTION_LENGTH} placeholder="Parle de toi, de ton style, de tes techniques..." /></div>
        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">🔒 Paiement sécurisé · Bientôt disponible</p>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Sauvegarde...' : saved ? '✅ Sauvegardé !' : 'Sauvegarder'}</button>
        </div>
      </form>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/photos" className="card p-5 hover:shadow-md transition-all flex items-center gap-4"><span className="text-3xl">📸</span><div><p className="font-semibold text-gray-900">Mes photos</p><p className="text-sm text-gray-500">Jusqu&apos;à 5 réalisations</p></div></Link>
        <Link href="/dashboard/services" className="card p-5 hover:shadow-md transition-all flex items-center gap-4"><span className="text-3xl">💅</span><div><p className="font-semibold text-gray-900">Mes prestations</p><p className="text-sm text-gray-500">Services et tarifs</p></div></Link>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getProfileById } from '@/lib/queries'
import { createClient } from '@/lib/supabase'
import { ProfileWithDetails, Service } from '@/types'
import { getSpecialty } from '@/lib/constants'
import { DEPOSIT_RATE } from '@/lib/constants'

export default function ReserverPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.profileId as string

  const [profile, setProfile] = useState<ProfileWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfileById(profileId).then(p => { setProfile(p); setLoading(false) })
  }, [profileId])

  const depositAmount = selectedService ? Math.round(selectedService.price * DEPOSIT_RATE) : 0
  const minDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !date || !clientName || !clientEmail) {
      setError('Remplis tous les champs obligatoires')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('reservations').insert({
        profile_id: profileId,
        service_id: selectedService.id,
        service_name: selectedService.name,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        service_date: date,
        service_time: time,
        total_price: selectedService.price,
        deposit_amount: depositAmount,
        deposit_paid: false,
        notes,
        status: 'pending',
      })
      if (dbError) throw dbError
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div></div>
  )

  if (!profile) return (
    <div className="min-h-screen"><Navbar /><div className="text-center py-20"><p>Profil introuvable</p><Link href="/" className="btn-primary mt-4 inline-block">Retour</Link></div></div>
  )

  const specialty = getSpecialty(profile.specialty)

  if (done) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5">
        <span className="text-6xl block">🎉</span>
        <h1 className="text-2xl font-extrabold text-gray-900">Demande de réservation envoyée !</h1>
        <div className="card p-6 text-left space-y-3">
          <p className="text-sm text-gray-600"><span className="font-semibold">Prestataire :</span> {profile.full_name}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Prestation :</span> {selectedService?.name}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Date :</span> {new Date(date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })} à {time}</p>
          <p className="text-sm text-gray-600"><span className="font-semibold">Prix total :</span> {selectedService?.price}€</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm font-bold text-amber-800">💳 Acompte à régler : {depositAmount}€</p>
            <p className="text-xs text-amber-600 mt-1">La prestataire te contactera pour confirmer et t&apos;envoyer le lien de paiement sécurisé.</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Un email de confirmation a été envoyé à <strong>{clientEmail}</strong></p>
        <div className="flex gap-3 justify-center">
          <Link href={`/prestataires/${profileId}`} className="btn-secondary py-3 px-6">Voir le profil</Link>
          <Link href="/" className="btn-primary py-3 px-6">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <Link href={`/prestataires/${profileId}`} className="text-sm text-gray-400 hover:text-pink-500 mb-4 block">← Retour au profil</Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Réserver avec {profile.full_name.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${specialty.color}`}>{specialty.emoji} {specialty.label}</span>
            <span className="text-sm text-gray-500">📍 {profile.city}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 1. Choix de la prestation */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">1. Choisis une prestation *</h2>
            <div className="space-y-2">
              {profile.services.map(s => (
                <button key={s.id} type="button"
                  onClick={() => setSelectedService(s)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all
                    ${selectedService?.id === s.id ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.duration_min} min</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-600">{s.price}€</p>
                    <p className="text-xs text-gray-400">Acompte : {Math.round(s.price * DEPOSIT_RATE)}€</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Date et heure */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">2. Date et heure *</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={minDate}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Heure</label>
                <select value={time} onChange={e => setTime(e.target.value)} className="input-field">
                  {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Tes coordonnées */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">3. Tes coordonnées *</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénom et nom *</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                  placeholder="Sophie Martin" className="input-field" required maxLength={80} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                  placeholder="sophie@email.fr" className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>
                <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78" className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Message (optionnel)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Précisions sur ta demande..." className="input-field resize-none" rows={3} maxLength={300} />
            </div>
          </div>

          {/* Récap paiement */}
          {selectedService && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100 space-y-3">
              <h3 className="font-bold text-gray-900">Récapitulatif</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{selectedService.name}</span>
                <span className="font-semibold">{selectedService.price}€</span>
              </div>
              <div className="border-t border-pink-200 pt-3 flex justify-between">
                <div>
                  <p className="font-bold text-gray-900">Acompte à régler maintenant</p>
                  <p className="text-xs text-gray-500">30% du montant total — reste ({selectedService.price - depositAmount}€) en main propre</p>
                </div>
                <p className="text-2xl font-extrabold text-pink-600">{depositAmount}€</p>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1"><span>🔒</span> Paiement sécurisé par Stripe</p>
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

          <button type="submit" className="btn-primary w-full py-4 text-base" disabled={submitting || !selectedService || !date || !clientName || !clientEmail}>
            {submitting ? 'Envoi en cours...' : `Confirmer la réservation${depositAmount ? ` — Acompte ${depositAmount}€` : ''}`}
          </button>
          <p className="text-xs text-gray-400 text-center">
            En confirmant, la prestataire recevra ta demande et te contactera pour finaliser le paiement de l&apos;acompte.
          </p>
        </form>
      </div>
    </div>
  )
}

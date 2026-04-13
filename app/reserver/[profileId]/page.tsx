'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Clock, Euro, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import { getProfileById, getAvailability } from '@/lib/queries'
import { createClient } from '@/lib/supabase'
import { ProfileWithDetails, Service } from '@/types'
import { getSpecialty, DEPOSIT_RATE } from '@/lib/constants'

// ── Zod schema for step 3 ─────────────────────────────────────────────────────
const clientSchema = z.object({
  name:  z.string().min(2, 'Prénom et nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  notes: z.string().max(300).optional(),
})
type ClientForm = z.infer<typeof clientSchema>

const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00']

// ── Step indicator ─────────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const labels = ['Prestation', 'Date & heure', 'Coordonnées', 'Confirmation']
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                done   ? 'bg-pink-500 border-pink-500 text-white'   :
                active ? 'bg-white border-pink-500 text-pink-600 shadow-pink'  :
                         'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? <Check size={16} /> : step}
              </div>
              <span className={`text-[10px] font-medium mt-1 hidden sm:block ${active ? 'text-pink-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-pink-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ReserverPage() {
  const params  = useParams()
  const profileId = params.profileId as string

  const [profile,     setProfile]     = useState<ProfileWithDetails | null>(null)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [loading,     setLoading]     = useState(true)
  const [step,        setStep]        = useState(1)
  const [done,        setDone]        = useState(false)
  const [submitting,  setSubmitting]  = useState(false)

  // Step 1
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  // Step 2
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('10:00')

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  })

  const load = useCallback(async () => {
    const [p, av] = await Promise.all([getProfileById(profileId), getAvailability(profileId)])
    setProfile(p)
    setAvailability(av)
    setLoading(false)
  }, [profileId])

  useEffect(() => { load() }, [load])

  const depositAmount = selectedService ? Math.round(selectedService.price * DEPOSIT_RATE) : 0

  // Handle calendar day click (pick mode, not toggle mode)
  const handleDatePick = (date: string) => {
    setSelectedDate(date)
  }

  const submitReservation = async (data: ClientForm) => {
    if (!selectedService || !selectedDate) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('reservations').insert({
        profile_id:    profileId,
        service_id:    selectedService.id,
        service_name:  selectedService.name,
        client_name:   data.name,
        client_email:  data.email,
        client_phone:  data.phone ?? '',
        service_date:  selectedDate,
        service_time:  selectedTime,
        total_price:   selectedService.price,
        deposit_amount: depositAmount,
        deposit_paid:  false,
        notes:         data.notes ?? '',
        status:        'pending',
      })
      if (dbError) throw dbError
      setDone(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-32 space-y-4">
        <p className="text-gray-500">Profil introuvable</p>
        <Link href="/" className="btn-primary">Retour à l&apos;accueil</Link>
      </div>
    </div>
  )

  const specialty = getSpecialty(profile.specialty)

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    const values = getValues()
    return (
      <div className="min-h-screen bg-gradient-beauty">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
            <span className="text-7xl block">🎉</span>
          </motion.div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Demande envoyée !</h1>
            <p className="text-gray-500 mt-2">
              {profile.full_name.split(' ')[0]} va te contacter pour confirmer.
            </p>
          </div>
          <div className="card p-6 text-left space-y-3">
            {[
              ['👩', 'Prestataire', profile.full_name],
              ['💅', 'Prestation', selectedService?.name ?? ''],
              ['📅', 'Date', `${new Date(selectedDate!).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })} à ${selectedTime}`],
              ['💰', 'Prix total', `${selectedService?.price}€`],
            ].map(([ico, lbl, val]) => (
              <div key={lbl} className="flex items-center gap-3 text-sm">
                <span>{ico}</span>
                <span className="text-gray-400 w-24 flex-shrink-0">{lbl}</span>
                <span className="font-semibold text-gray-900">{val}</span>
              </div>
            ))}
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800">💳 Acompte à régler : {depositAmount}€</p>
              <p className="text-xs text-amber-600 mt-1">La prestataire t&apos;enverra un lien de paiement sécurisé Stripe.</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Confirmation envoyée à <strong>{values.email}</strong></p>
          <div className="flex gap-3 justify-center">
            <Link href={`/prestataires/${profileId}`} className="btn-secondary py-3">Voir le profil</Link>
            <Link href="/" className="btn-primary py-3">Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Back + header */}
        <div>
          <Link href={`/prestataires/${profileId}`} className="text-sm text-gray-400 hover:text-pink-500 mb-3 inline-flex items-center gap-1 transition-colors">
            <ChevronLeft size={16} /> Retour au profil
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Réserver avec {profile.full_name.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`badge ${specialty.color} text-xs`}>{specialty.emoji} {specialty.label}</span>
            <span className="text-sm text-gray-400">📍 {profile.city}</span>
          </div>
        </div>

        {/* Step indicator */}
        <Steps current={step} />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── Step 1: Service ─────────────────────────────────────────── */}
            {step === 1 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Choisis une prestation</h2>
                {profile.services.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">Aucune prestation disponible.</p>
                ) : (
                  <div className="space-y-2">
                    {profile.services.map(s => (
                      <button key={s.id} type="button" onClick={() => setSelectedService(s)}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 text-left transition-all ${
                          selectedService?.id === s.id
                            ? 'border-pink-400 bg-pink-50 shadow-sm'
                            : 'border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${selectedService?.id === s.id ? 'bg-pink-100' : 'bg-gray-50'}`}>
                            {specialty.emoji}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={11} /> {s.duration_min} min
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-extrabold text-pink-600 text-lg">{s.price}€</p>
                          <p className="text-xs text-gray-400">Acompte : {Math.round(s.price * DEPOSIT_RATE)}€</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="btn-primary w-full py-3.5 mt-2"
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                >
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── Step 2: Date & Heure ────────────────────────────────────── */}
            {step === 2 && (
              <div className="card p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg">Choisis ta date et ton heure</h2>

                {/* Calendar in pick mode */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Date du rendez-vous</p>
                  <AvailabilityCalendar
                    availability={availability}
                    onToggle={handleDatePick}
                    readOnly={false}
                  />
                  {selectedDate && (
                    <p className="text-sm text-pink-600 font-semibold mt-3 text-center">
                      ✓ {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  )}
                </div>

                {/* Time slots */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Créneau horaire</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} type="button" onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          selectedTime === t
                            ? 'border-pink-400 bg-pink-50 text-pink-600'
                            : 'border-gray-100 bg-white text-gray-600 hover:border-pink-200'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="btn-secondary flex-1 py-3" onClick={() => setStep(1)}>
                    <ChevronLeft size={18} /> Retour
                  </button>
                  <button
                    className="btn-primary flex-1 py-3"
                    disabled={!selectedDate}
                    onClick={() => setStep(3)}
                  >
                    Continuer <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Coordonnées ─────────────────────────────────────── */}
            {step === 3 && (
              <form onSubmit={handleSubmit(() => setStep(4))} className="card p-6 space-y-5">
                <h2 className="font-bold text-gray-900 text-lg">Tes coordonnées</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prénom et nom *</label>
                    <input {...register('name')} placeholder="Sophie Martin"
                      className={`input-field ${errors.name ? 'input-error' : ''}`} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                    <input {...register('email')} type="email" placeholder="sophie@email.fr"
                      className={`input-field ${errors.email ? 'input-error' : ''}`} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone</label>
                    <input {...register('phone')} type="tel" placeholder="+33 6 12 34 56 78"
                      className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message (optionnel)</label>
                    <textarea {...register('notes')} rows={3}
                      placeholder="Précisions, allergies, demandes particulières..."
                      className="input-field resize-none" maxLength={300} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" className="btn-secondary flex-1 py-3" onClick={() => setStep(2)}>
                    <ChevronLeft size={18} /> Retour
                  </button>
                  <button type="submit" className="btn-primary flex-1 py-3">
                    Voir le récap <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 4: Confirmation ────────────────────────────────────── */}
            {step === 4 && (() => {
              const vals = getValues()
              return (
                <div className="space-y-4">
                  <div className="card p-6 space-y-4">
                    <h2 className="font-bold text-gray-900 text-lg">Récapitulatif</h2>
                    <div className="space-y-3 divide-y divide-gray-50">
                      {[
                        ['💅', 'Prestation', selectedService!.name],
                        ['⏱️', 'Durée', `${selectedService!.duration_min} min`],
                        ['📅', 'Date', `${new Date(selectedDate!).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })} à ${selectedTime}`],
                        ['👩', 'Prestataire', profile.full_name],
                        ['📍', 'Lieu', profile.home_service ? 'À domicile' : profile.city],
                        ['📛', 'Votre nom', vals.name],
                        ['📧', 'Email', vals.email],
                      ].map(([ico, lbl, val]) => (
                        <div key={lbl} className="flex items-center gap-3 pt-3 first:pt-0 text-sm">
                          <span className="text-base">{ico}</span>
                          <span className="text-gray-400 w-28 flex-shrink-0">{lbl}</span>
                          <span className="font-medium text-gray-900">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment recap */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Euro size={18} className="text-pink-500" />
                      <h3 className="font-bold text-gray-900">Paiement</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Prix total</span>
                        <span className="font-semibold">{selectedService!.price}€</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-xs">
                        <span>Reste en main propre</span>
                        <span>{selectedService!.price - depositAmount}€</span>
                      </div>
                      <div className="border-t border-pink-200 pt-2 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">Acompte à régler</p>
                          <p className="text-xs text-gray-400">30% — paiement sécurisé Stripe</p>
                        </div>
                        <p className="text-2xl font-extrabold text-pink-600">{depositAmount}€</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn-secondary flex-1 py-3.5" onClick={() => setStep(3)} disabled={submitting}>
                      <ChevronLeft size={18} /> Modifier
                    </button>
                    <button
                      className="btn-primary flex-1 py-3.5 gap-2"
                      disabled={submitting}
                      onClick={handleSubmit(submitReservation)}
                    >
                      <Sparkles size={18} />
                      {submitting ? 'Envoi...' : `Confirmer — ${depositAmount}€`}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    🔒 Paiement sécurisé · La prestataire confirmera par message
                  </p>
                </div>
              )
            })()}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

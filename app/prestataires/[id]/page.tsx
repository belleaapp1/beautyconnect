'use client'
import { useEffect, useState, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Instagram, BadgeCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ContactButton from '@/components/ContactButton'
import ServiceList from '@/components/ServiceList'
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'
import { StarDisplay } from '@/components/StarRating'
import PageTracker from '@/components/PageTracker'
import FavoriteButton from '@/components/FavoriteButton'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import { getProfileById, getAvailability } from '@/lib/queries'
import { getSpecialty } from '@/lib/constants'
import { ProfileWithDetails } from '@/types'
import Link from 'next/link'

// ── Photo lightbox ────────────────────────────────────────────────────────────
function Lightbox({ photos, initialIndex, onClose }: {
  photos: { url?: string; id: string }[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const total = photos.length

  const prev = useCallback(() => setIndex(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIndex(i => (i + 1) % total), [total])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {index + 1} / {total}
      </div>

      {/* Prev */}
      {total > 1 && (
        <button
          className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          onClick={e => { e.stopPropagation(); prev() }}
          aria-label="Photo précédente"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          src={photos[index]?.url ?? ''}
          alt={`Photo ${index + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Next */}
      {total > 1 && (
        <button
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          onClick={e => { e.stopPropagation(); next() }}
          aria-label="Photo suivante"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Thumbnails */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIndex(i) }}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white scale-125' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Main page (client component) ──────────────────────────────────────────────
export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<ProfileWithDetails | null>(null)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [reviews, setReviews] = useState<NonNullable<ProfileWithDetails['reviews']>>([])

  useEffect(() => {
    Promise.all([
      getProfileById(params.id),
      getAvailability(params.id),
    ]).then(([p, av]) => {
      if (!p) { setLoading(false); return }
      setProfile(p)
      setReviews(p.reviews ?? [])
      setAvailability(av)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!profile) return notFound()

  const specialty = getSpecialty(profile.specialty)
  const minPrice = profile.services?.length ? Math.min(...profile.services.map(s => s.price)) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTracker path={`/prestataires/${params.id}`} profileId={profile.id} />
      <Navbar />

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={profile.photos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Header profil */}
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Avatar / emoji spécialité */}
                <div className="relative flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-pink-100"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0 flex items-center justify-center text-4xl shadow-sm border border-pink-100">
                      {specialty.emoji}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{profile.full_name}</h1>
                        {profile.is_verified && (
                          <BadgeCheck size={22} className="text-blue-500 flex-shrink-0" aria-label="Profil vérifié" />
                        )}
                        {profile.is_featured && (
                          <span className="badge-gold">⭐ En vedette</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`badge ${specialty.color}`}>{specialty.emoji} {specialty.label}</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">📍 {profile.city}</span>
                        {profile.available && (
                          <span className="badge bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                            Disponible
                          </span>
                        )}
                        {profile.home_service && (
                          <span className="badge bg-blue-100 text-blue-700">🛵 Déplacement {profile.home_service_radius}km</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <FavoriteButton profileId={profile.id} />
                      {minPrice !== null && (
                        <div className="text-right bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100">
                          <p className="text-xs text-gray-400 font-medium">À partir de</p>
                          <p className="text-3xl font-extrabold text-pink-500">{minPrice}€</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {profile.avg_rating && (
                    <div className="mt-3">
                      <StarDisplay rating={profile.avg_rating} count={profile.review_count} size="md" />
                    </div>
                  )}

                  {/* Description */}
                  {profile.description && (
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed">{profile.description}</p>
                  )}

                  {/* Infos additionnelles */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {profile.experience_years && (
                      <p className="text-sm text-gray-500">
                        🎓 <span className="font-medium">{profile.experience_years} ans</span> d&apos;expérience
                      </p>
                    )}
                    {profile.instagram_url && (
                      <a
                        href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://instagram.com/${profile.instagram_url.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors"
                      >
                        <Instagram size={15} />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos avec lightbox */}
            {profile.photos.length > 0 && (
              <div className="card p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📸 Réalisations</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {profile.photos.map((photo, i) => (
                    <motion.button
                      key={photo.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLightboxIndex(i)}
                      className="aspect-square rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <img
                        src={photo.url ?? ''}
                        alt={`Réalisation ${i + 1} de ${profile.full_name}`}
                        className="w-full h-full object-cover hover:brightness-90 transition-all"
                        loading="lazy"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Services & tarifs */}
            {profile.services?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💅 Prestations & tarifs</h2>
                <ServiceList services={profile.services} />
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
                  <span>🔒</span>
                  <span>Paiement sécurisé par Stripe — 30% d&apos;acompte, le reste en main propre</span>
                </div>
              </div>
            )}

            {/* Avis clients */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-gray-900">⭐ Avis clients</h2>
                {profile.avg_rating && (
                  <StarDisplay rating={profile.avg_rating} count={profile.review_count} size="md" />
                )}
              </div>
              <ReviewList reviews={reviews} />
              <div className="mt-6 pt-6 border-t border-gray-100">
                <ReviewForm profileId={profile.id} onAdded={() => {}} />
              </div>
            </div>

            {/* CTA retour */}
            <div className="text-center pb-4">
              <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">
                ← Voir d&apos;autres prestataires
              </Link>
            </div>
          </div>

          {/* ── Sticky sidebar ── */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-4 lg:sticky lg:top-6">

            {/* Booking CTA */}
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-900">Réserver un rendez-vous</h3>
              {minPrice !== null && (
                <p className="text-sm text-gray-500">À partir de <span className="font-bold text-pink-600">{minPrice}€</span></p>
              )}
              {profile.whatsapp && (
                <ContactButton profileId={profile.id} whatsapp={profile.whatsapp} name={profile.full_name} />
              )}
              {profile.services?.length > 0 && (
                <Link
                  href={`/reserver/${profile.id}`}
                  className="btn-secondary flex items-center justify-center gap-2 py-3 font-bold w-full"
                >
                  📅 Réserver & payer l&apos;acompte
                </Link>
              )}
              <p className="text-xs text-gray-400 text-center">Réponse rapide garantie</p>
            </div>

            {/* Availability calendar (read-only) */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4">📆 Disponibilités</h3>
              <AvailabilityCalendar availability={availability} readOnly />
              <div className="flex gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />Disponible</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />Indisponible</span>
              </div>
            </div>

            {/* Social links */}
            {profile.instagram_url && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-3">Réseaux sociaux</h3>
                <a
                  href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://instagram.com/${profile.instagram_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  <Instagram size={16} />
                  Voir sur Instagram
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

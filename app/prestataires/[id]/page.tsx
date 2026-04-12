import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import PhotoGallery from '@/components/PhotoGallery'
import ContactButton from '@/components/ContactButton'
import ServiceList from '@/components/ServiceList'
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'
import { StarDisplay } from '@/components/StarRating'
import { getProfileById } from '@/lib/queries'
import { getSpecialty } from '@/lib/constants'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const profile = await getProfileById(params.id)
  if (!profile) return { title: 'Profil introuvable' }
  const s = getSpecialty(profile.specialty)
  return {
    title: `${profile.full_name} — ${s.label} à ${profile.city} | BeautyConnect`,
    description: profile.description || `${profile.full_name}, ${s.label} à ${profile.city}.`,
    openGraph: { images: profile.photos[0]?.url ? [profile.photos[0].url] : [] },
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await getProfileById(params.id)
  if (!profile) notFound()
  const specialty = getSpecialty(profile.specialty)
  const minPrice = profile.services?.length ? Math.min(...profile.services.map(s => s.price)) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header profil ── */}
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar / emoji spécialité */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100
              flex-shrink-0 flex items-center justify-center text-4xl shadow-sm border border-pink-100">
              {specialty.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{profile.full_name}</h1>
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

                {minPrice !== null && (
                  <div className="text-right flex-shrink-0 bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100">
                    <p className="text-xs text-gray-400 font-medium">À partir de</p>
                    <p className="text-3xl font-extrabold text-pink-500">{minPrice}€</p>
                  </div>
                )}
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
              {profile.experience_years && (
                <p className="text-sm text-gray-500 mt-2">
                  🎓 <span className="font-medium">{profile.experience_years} ans</span> d&apos;expérience
                </p>
              )}
            </div>
          </div>

          {/* CTA Principal */}
          {profile.whatsapp && (
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <ContactButton profileId={profile.id} whatsapp={profile.whatsapp} name={profile.full_name} />
              {profile.services?.length > 0 && (
                <Link href={`/reserver/${profile.id}`}
                  className="btn-secondary flex items-center justify-center gap-2 text-base py-4 font-bold">
                  📅 Réserver avec acompte
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Photos ── */}
        {profile.photos.length > 0 && (
          <div className="card p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📸 Réalisations</h2>
            <PhotoGallery photos={profile.photos} name={profile.full_name} />
          </div>
        )}

        {/* ── Services & tarifs ── */}
        {profile.services?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💅 Prestations & tarifs</h2>
            <ServiceList services={profile.services} />
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {profile.whatsapp && (
                <ContactButton profileId={profile.id} whatsapp={profile.whatsapp} name={profile.full_name} />
              )}
              <Link href={`/reserver/${profile.id}`}
                className="btn-secondary flex items-center justify-center gap-2 py-4 font-bold">
                📅 Réserver & payer l&apos;acompte
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
              <span>🔒</span>
              <span>Paiement sécurisé par Stripe — 30% d&apos;acompte, le reste en main propre</span>
            </div>
          </div>
        )}

        {/* ── Avis clients ── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-900">⭐ Avis clients</h2>
            {profile.avg_rating && (
              <StarDisplay rating={profile.avg_rating} count={profile.review_count} size="md" />
            )}
          </div>
          <ReviewList reviews={profile.reviews ?? []} />
          <div className="mt-6 pt-6 border-t border-gray-100">
            <ReviewForm profileId={profile.id} onAdded={() => {}} />
          </div>
        </div>

        {/* ── CTA retour ── */}
        <div className="text-center pb-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">
            ← Voir d&apos;autres prestataires
          </Link>
        </div>
      </div>
    </div>
  )
}

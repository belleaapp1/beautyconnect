import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SearchBar from '@/components/SearchBar'
import ProfileCard from '@/components/ProfileCard'
import { SkeletonGrid } from '@/components/SkeletonCard'
import { searchProfiles } from '@/lib/queries'
import { SPECIALTIES, HERO_PHOTOS } from '@/lib/constants'
import { Specialty } from '@/types'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { city?: string; specialty?: string }
}) {
  const { city, specialty } = searchParams
  const profiles = await searchProfiles(city, specialty as Specialty | undefined).catch(() => [])
  const featured = profiles.filter(p => p.is_featured)
  const regular = profiles.filter(p => !p.is_featured)
  const hasFilters = city || specialty

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT — Texte */}
            <div className="space-y-7 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 text-xs font-bold px-4 py-2 rounded-full border border-pink-100">
                🌸 La plateforme beauté entre particulières
              </div>

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.05]">
                La beauté<br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                    près de chez toi.
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9C50 3 100 1 150 3C200 5 250 8 297 6" stroke="#FBCFE8" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                Nails, coiffure, cils, maquillage, sourcils — des centaines de prestataires vérifiées et notées, directement joignables sur WhatsApp.
              </p>

              {/* Search */}
              <div className="max-w-xl">
                <Suspense><SearchBar /></Suspense>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><span className="text-green-500 font-bold">✓</span> 100% gratuit pour les clientes</span>
                <span className="flex items-center gap-1.5"><span className="text-green-500 font-bold">✓</span> Avis clients vérifiés</span>
                <span className="flex items-center gap-1.5"><span className="text-green-500 font-bold">✓</span> Contact WhatsApp direct</span>
              </div>
            </div>

            {/* RIGHT — Photo mosaic */}
            <div className="order-1 lg:order-2 relative">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {HERO_PHOTOS.map((photo, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl
                      ${i === 1 ? 'mt-6 sm:mt-8' : ''}
                      ${i === 3 ? '-mt-3 sm:-mt-4' : ''}
                    `}
                    style={{ aspectRatio: '4/5' }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 45vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ))}
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100 z-10">
                <div className="flex -space-x-2">
                  {['🧖‍♀️','💅','💇‍♀️'].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm border-2 border-white">{e}</div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">+2 400 presta</p>
                  <p className="text-xs text-gray-400">dans toute la France</p>
                </div>
              </div>
              {/* Stars badge */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 border border-gray-100 z-10">
                <span className="text-amber-400 text-sm">★★★★★</span>
                <span className="text-xs font-bold text-gray-900">4.9/5</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          SPÉCIALITÉS (cards avec photos)
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="section-title">Explorer par spécialité</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {SPECIALTIES.map(s => (
              <Link key={s.value} href={`/?specialty=${s.value}`}>
                <div className="group relative overflow-hidden rounded-2xl cursor-pointer" style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={s.photo}
                    alt={s.label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-2xl mb-1">{s.emoji}</p>
                    <p className="text-white font-bold text-lg leading-tight">{s.label}</p>
                    <p className="text-white/70 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{s.desc}</p>
                  </div>
                  {/* Arrow on hover */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          HEADER SECTION FILTRÉE
      ══════════════════════════════ */}
      {hasFilters && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
            <Suspense><SearchBar /></Suspense>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-semibold text-gray-700">
                <span className="text-pink-600 font-bold">{profiles.length}</span> prestataire{profiles.length !== 1 ? 's' : ''}
                {specialty && <span> en <span className="capitalize">{specialty}</span></span>}
                {city && <span> à {city}</span>}
              </p>
              <Link href="/" className="text-sm text-pink-500 hover:text-pink-600 font-medium flex items-center gap-1">
                ✕ Réinitialiser
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          PRESTATAIRES EN VEDETTE
      ══════════════════════════════ */}
      {!hasFilters && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="section-title">⭐ En vedette</h2>
            <span className="badge-gold">Premium</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p, i) => <ProfileCard key={p.id} profile={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          GRILLE PROFILS
      ══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {!hasFilters && <h2 className="section-title mb-6">Toutes nos prestataires</h2>}

        {profiles.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <span className="text-6xl block">🔍</span>
            <p className="text-gray-500 text-lg">Aucune prestataire trouvée.</p>
            <p className="text-gray-400 text-sm">Essaie une autre ville ou spécialité</p>
            <Link href="/" className="btn-primary inline-block mt-4">Voir toutes les villes</Link>
          </div>
        ) : (
          <Suspense fallback={<SkeletonGrid />}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(hasFilters ? profiles : regular).map((p, i) => (
                <ProfileCard key={p.id} profile={p} index={i + featured.length} />
              ))}
            </div>
          </Suspense>
        )}
      </section>

      {/* ══════════════════════════════
          COMMENT ÇA MARCHE
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Comment ça marche ?</h2>
              <p className="text-gray-500 mt-2">En 3 étapes, trouve ta presta beauté idéale</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 relative">
              {/* Line connector (desktop) */}
              <div className="hidden sm:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-pink-200 z-0" />
              {[
                { step: '01', emoji: '🔍', title: 'Recherche', desc: 'Filtre par ville et spécialité pour trouver les prestataires proches de toi.' },
                { step: '02', emoji: '👁️', title: 'Compare', desc: 'Consulte les photos de réalisations, les avis clients et les tarifs.' },
                { step: '03', emoji: '📲', title: 'Contacte', desc: 'Un clic sur WhatsApp et c\'est parti — aucun intermédiaire, zéro commission pour toi.' },
              ].map(item => (
                <div key={item.step} className="relative bg-white rounded-3xl p-7 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <span className="text-4xl block mb-3">{item.emoji}</span>
                  <p className="font-bold text-gray-900 text-lg mb-2">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          CTA PRESTATAIRE — avec photo BG
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80&fit=crop"
              alt="Salon de beauté"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-2 rounded-full border border-white/20">
              💼 Tu es presta beauté ?
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Développe ta clientèle<br />
              <span className="text-pink-400">gratuitement.</span>
            </h2>
            <p className="text-white/75 text-lg max-w-lg mx-auto leading-relaxed">
              Crée ton profil en 5 minutes, showcase tes réalisations et reçois des clientes directement sur WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/auth/register"
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 text-center">
                Créer mon profil — Gratuit →
              </Link>
              <Link href="/tarifs"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/30 text-center">
                Voir les offres Premium
              </Link>
            </div>
            <div className="flex justify-center flex-wrap gap-6 text-sm text-white/60 pt-2">
              <span>✓ 100% gratuit</span>
              <span>✓ Sans carte bancaire</span>
              <span>✓ Profil en 5 minutes</span>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          PLANS FREEMIUM
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Des offres pour toutes les ambitions</h2>
              <p className="text-gray-500 mt-2">Commence gratuitement, monte en puissance quand tu veux</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { name: 'Gratuit', price: '0€', period: 'pour toujours', color: 'border-gray-200', badge: '', features: ['Profil public', '5 photos', '10 prestations', 'Contact WhatsApp'], cta: 'Commencer', href: '/auth/register', btnClass: 'btn-secondary' },
                { name: 'En vedette', price: '15€', period: 'par mois', color: 'border-pink-300 ring-2 ring-pink-200', badge: '⭐ Populaire', features: ['Tout le plan Gratuit', 'Apparaît en 1er dans les résultats', 'Badge "En vedette" doré', 'Statistiques de vues'], cta: 'Passer en vedette', href: '/auth/register', btnClass: 'btn-primary' },
                { name: 'Premium', price: '35€', period: 'par mois', color: 'border-amber-300', badge: '🏆 Pro', features: ['Tout le plan En vedette', 'Réservations en ligne', 'Acompte sécurisé', 'Badge Premium exclusif', 'Support prioritaire'], cta: 'Devenir Premium', href: '/auth/register', btnClass: 'btn-gold' },
              ].map(plan => (
                <div key={plan.name} className={`rounded-3xl border-2 ${plan.color} p-7 relative hover:shadow-lg transition-shadow`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">{plan.badge}</span>
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                      <span className="text-gray-400 text-sm">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-pink-500 font-bold mt-0.5">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`${plan.btnClass} block text-center w-full py-3`}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌸</span>
                <span className="font-extrabold text-xl">Beauty<span className="text-pink-400">Connect</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                La plateforme de mise en relation beauté entre particulières en France. Gratuit pour les clientes, simple pour les prestataires.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-gray-300">Spécialités</p>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Nails 💅', 'Coiffure ✂️', 'Cils 👁️', 'Maquillage 💄', 'Sourcils 🪮'].map(s => (
                  <li key={s} className="hover:text-white transition-colors cursor-pointer">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-gray-300">Prestataires</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Créer mon profil</Link></li>
                <li><Link href="/tarifs" className="hover:text-white transition-colors">Nos offres</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2026 BeautyConnect. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}

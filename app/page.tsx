import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SearchBar from '@/components/SearchBar'
import ProfileCard from '@/components/ProfileCard'
import { SkeletonGrid } from '@/components/SkeletonCard'
import { searchProfiles } from '@/lib/queries'
import { SPECIALTIES, HERO_PHOTOS, PLANS } from '@/lib/constants'
import { Specialty } from '@/types'
import { Search, Calendar, Star, CheckCircle, ArrowRight, Sparkles, Users, MapPin } from 'lucide-react'

const TESTIMONIALS = [
  {
    initials: 'SC',
    name: 'Sophie C.',
    city: 'Paris',
    color: 'from-pink-400 to-rose-500',
    text: 'Sophie est incroyable, j\'adore mes ongles ! Elle est minutieuse, rapide et très professionnelle. Je recommande à 100% !',
  },
  {
    initials: 'AM',
    name: 'Amina M.',
    city: 'Lyon',
    color: 'from-purple-400 to-fuchsia-500',
    text: 'J\'ai trouvé ma coiffeuse idéale grâce à BeautyConnect. Résultat magnifique, prix imbattable et elle vient chez moi !',
  },
  {
    initials: 'LB',
    name: 'Lucie B.',
    city: 'Bordeaux',
    color: 'from-amber-400 to-orange-400',
    text: 'Extension de cils parfaite, durée au top. L\'interface est simple et j\'ai réservé en 2 minutes. Une appli indispensable.',
  },
]

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
          FILTERED RESULTS HEADER
      ══════════════════════════════ */}
      {hasFilters && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
            <Suspense><SearchBar /></Suspense>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-semibold text-gray-700">
                <span className="text-pink-600 font-bold">{profiles.length}</span>{' '}
                prestataire{profiles.length !== 1 ? 's' : ''}
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
          HERO
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="relative overflow-hidden bg-gradient-hero">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pink-100/60 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-100/50 to-transparent rounded-full blur-3xl translate-y-32 -translate-x-16 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT — Text */}
            <div className="space-y-7 order-2 lg:order-1">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-pink-100 text-pink-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                <Sparkles size={12} />
                La plateforme beauté entre particulières
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.05]">
                La beauté à domicile,
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-gradient-pink">
                    c&apos;est maintenant.
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full opacity-40"
                    viewBox="0 0 340 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M3 9C60 3 120 1 170 3C220 5 280 8 337 6"
                      stroke="#EC4899"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                Nails, coiffure, cils, maquillage, sourcils — des centaines de prestataires vérifiées, directement joignables pour un rendez-vous à domicile.
              </p>

              {/* Search */}
              <div className="max-w-xl">
                <Suspense><SearchBar /></Suspense>
              </div>

              {/* Stats + CTA badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm text-sm font-semibold text-gray-700">
                  <span className="text-base">📅</span>
                  <span>2 341+ réservations</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm text-sm font-semibold text-gray-700">
                  <span className="text-base">💅</span>
                  <span>500+ prestataires</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/recherche" className="btn-primary-lg shine">
                  Trouver une prestataire
                  <ArrowRight size={18} />
                </Link>
                <Link href="/auth/register" className="btn-secondary text-base px-8 py-4 rounded-2xl">
                  Devenir prestataire
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  100% gratuit pour les clientes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Avis clients vérifiés
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Contact WhatsApp direct
                </span>
              </div>
            </div>

            {/* RIGHT — Photo mosaic */}
            <div className="order-1 lg:order-2 relative">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {HERO_PHOTOS.map((photo, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl
                      ${i === 1 ? 'mt-6 sm:mt-10' : ''}
                      ${i === 3 ? '-mt-3 sm:-mt-5' : ''}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                  </div>
                ))}
              </div>

              {/* Floating badge — bottom left */}
              <div className="absolute -bottom-5 -left-4 sm:-bottom-7 sm:-left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100 z-10">
                <div className="flex -space-x-2">
                  {['🧖‍♀️', '💅', '💇‍♀️'].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm border-2 border-white">{e}</div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">+2 400 presta</p>
                  <p className="text-xs text-gray-400">dans toute la France</p>
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-5 bg-white rounded-2xl shadow-xl px-3 py-2.5 flex items-center gap-2 border border-gray-100 z-10">
                <span className="text-amber-400 text-sm tracking-tight">★★★★★</span>
                <span className="text-xs font-bold text-gray-900">4.9/5</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          SPECIALTIES
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <h2 className="section-title">Explorer par spécialité</h2>
              <p className="section-sub">Choisissez votre domaine de beauté préféré</p>
            </div>
            <Link href="/recherche" className="text-sm text-pink-500 hover:text-pink-600 font-semibold flex items-center gap-1 flex-shrink-0">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
            {SPECIALTIES.map((s) => (
              <Link key={s.value} href={`/?specialty=${s.value}`} className="flex-shrink-0 w-44 sm:w-auto">
                <div
                  className="group relative overflow-hidden rounded-2xl cursor-pointer"
                  style={{ aspectRatio: '3/4' }}
                >
                  <Image
                    src={s.photo}
                    alt={s.label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 44vw, 20vw"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-2xl mb-1">{s.emoji}</p>
                    <p className="text-white font-bold text-lg leading-tight">{s.label}</p>
                    <p className="text-white/70 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {s.desc}
                    </p>
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
          FEATURED PROVIDERS
      ══════════════════════════════ */}
      {!hasFilters && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="flex items-center gap-3 mb-7">
            <h2 className="section-title">✨ Prestataires en vedette</h2>
            <span className="badge-gold">Premium</span>
          </div>
          <Suspense fallback={<SkeletonGrid count={4} />}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p, i) => (
                <ProfileCard key={p.id} profile={p} index={i} />
              ))}
            </div>
          </Suspense>
        </section>
      )}

      {/* ══════════════════════════════
          ALL PROFILES GRID
      ══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {!hasFilters && (
          <h2 className="section-title mb-7">Toutes nos prestataires</h2>
        )}

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
          TESTIMONIALS
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="bg-gradient-beauty py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Ce qu&apos;elles disent de nous</h2>
              <p className="section-sub">Des milliers de clientes satisfaites partout en France</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-extrabold shadow-sm`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={10} />
                        {t.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="bg-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Comment ça marche ?</h2>
              <p className="section-sub">En 3 étapes, trouve ta presta beauté idéale</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 relative">
              {/* Connector line */}
              <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200 z-0" />

              {[
                {
                  step: '01',
                  icon: <Search size={22} className="text-white" />,
                  title: 'Recherche',
                  desc: 'Filtre par ville et spécialité pour trouver les prestataires proches de toi.',
                },
                {
                  step: '02',
                  icon: <Calendar size={22} className="text-white" />,
                  title: 'Réserve',
                  desc: 'Consulte les photos de réalisations, les avis clients et les tarifs, puis réserve.',
                },
                {
                  step: '03',
                  icon: <Star size={22} className="text-white fill-white" />,
                  title: 'Profite',
                  desc: 'Ta prestataire se déplace chez toi — aucun intermédiaire, zéro commission.',
                },
              ].map((item, i) => (
                <div key={item.step} className="relative bg-white rounded-3xl p-7 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow z-10">
                  {/* Circle with gradient */}
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[var(--shadow-pink)]">
                    {item.icon}
                  </div>
                  <span className="text-xs font-black text-gray-200 absolute top-6 right-7 text-5xl leading-none select-none">
                    {item.step}
                  </span>
                  <p className="font-extrabold text-gray-900 text-xl mb-2">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          CTA BANNER — Prestataire
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
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/92 to-gray-900/65" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-5 py-2 rounded-full border border-white/20">
              <Users size={12} />
              Vous êtes prestataire ?
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Développe ta clientèle<br />
              <span className="text-pink-400">gratuitement.</span>
            </h2>
            <p className="text-white/75 text-lg max-w-lg mx-auto leading-relaxed">
              Crée ton profil en 5 minutes, showcase tes réalisations et reçois des clientes directement sur WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/auth/register"
                className="bg-pink-500 hover:bg-pink-600 active:scale-[0.97] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-[var(--shadow-pink)] inline-flex items-center justify-center gap-2"
              >
                Créer mon profil gratuit
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/tarifs"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/30 text-center"
              >
                Voir les offres Premium
              </Link>
            </div>
            <div className="flex justify-center flex-wrap gap-6 text-sm text-white/55 pt-2">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> 100% gratuit</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Sans carte bancaire</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Profil en 5 minutes</span>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════
          PRICING PLANS
      ══════════════════════════════ */}
      {!hasFilters && (
        <section className="py-16 px-4 bg-white" id="tarifs">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Des offres pour toutes les ambitions</h2>
              <p className="section-sub">Commence gratuitement, monte en puissance quand tu veux</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  name: 'Gratuit',
                  price: '0€',
                  period: 'pour toujours',
                  borderClass: 'border-gray-200',
                  badge: null,
                  features: [
                    'Profil public visible',
                    '5 photos de réalisations',
                    '10 prestations listées',
                    'Contact WhatsApp direct',
                  ],
                  cta: 'Commencer gratuitement',
                  href: '/auth/register',
                  btnClass: 'btn-secondary',
                },
                {
                  name: 'En vedette',
                  price: '9,99€',
                  period: 'par mois',
                  borderClass: 'border-pink-300 ring-2 ring-pink-200',
                  badge: '⭐ Populaire',
                  features: [
                    'Tout le plan Gratuit',
                    'Apparaît en 1er dans les résultats',
                    'Badge "En vedette" doré',
                    'Statistiques de vues',
                  ],
                  cta: 'Passer en vedette',
                  href: '/auth/register',
                  btnClass: 'btn-primary',
                },
                {
                  name: 'Premium',
                  price: '24,99€',
                  period: 'par mois',
                  borderClass: 'border-amber-300',
                  badge: '🏆 Pro',
                  features: [
                    'Tout le plan En vedette',
                    'Réservations en ligne',
                    'Acompte sécurisé',
                    'Badge Premium exclusif',
                    'Support prioritaire',
                  ],
                  cta: 'Devenir Premium',
                  href: '/auth/register',
                  btnClass: 'btn-gold',
                },
              ].map(plan => (
                <div
                  key={plan.name}
                  className={`rounded-3xl border-2 ${plan.borderClass} p-7 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                      <span className="text-gray-400 text-sm">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <CheckCircle size={15} className="text-pink-500 flex-shrink-0 mt-0.5" />
                        {f}
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

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      {!hasFilters && (
        <footer className="bg-gray-900 text-white py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-4 gap-10 mb-12">
              {/* Brand */}
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌸</span>
                  <span className="font-extrabold text-xl">
                    Beauty<span className="text-pink-400">Connect</span>
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  La plateforme de mise en relation beauté entre particulières en France. Gratuit pour les clientes, simple pour les prestataires.
                </p>
              </div>

              {/* Nav links */}
              <div>
                <p className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-widest">Navigation</p>
                <ul className="space-y-2.5 text-sm text-gray-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
                  <li><Link href="/recherche" className="hover:text-white transition-colors">Prestataires</Link></li>
                  <li><Link href="/#tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>

              {/* Specialties */}
              <div>
                <p className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-widest">Spécialités</p>
                <ul className="space-y-2.5 text-sm text-gray-400">
                  {SPECIALTIES.map(s => (
                    <li key={s.value}>
                      <Link href={`/?specialty=${s.value}`} className="hover:text-white transition-colors flex items-center gap-2">
                        <span>{s.emoji}</span>
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
              <span>© 2026 BeautyConnect. Tous droits réservés.</span>
              <div className="flex items-center gap-4">
                <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
                <Link href="/cgv" className="hover:text-gray-300 transition-colors">CGV</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

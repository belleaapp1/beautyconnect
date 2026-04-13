'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ProfileCard from '@/components/ProfileCard'
import { SkeletonGrid } from '@/components/SkeletonCard'
import { searchProfiles } from '@/lib/queries'
import { CITIES, SPECIALTIES } from '@/lib/constants'
import { Specialty, ProfileWithDetails } from '@/types'
import { SlidersHorizontal, X, ChevronDown, Home, Star, Search } from 'lucide-react'
import clsx from 'clsx'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Filters {
  city: string
  specialty: string
  minPrice: number
  maxPrice: number
  minRating: number
  homeService: boolean
}

const DEFAULT_FILTERS: Filters = {
  city: '',
  specialty: '',
  minPrice: 0,
  maxPrice: 500,
  minRating: 0,
  homeService: false,
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RecherchePage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fetch profiles whenever city/specialty filter changes
  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const results = await searchProfiles(
        filters.city || undefined,
        filters.specialty ? (filters.specialty as Specialty) : undefined
      )
      setProfiles(results)
    } catch {
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [filters.city, filters.specialty])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  // Apply client-side price / rating / homeService filters
  const filteredProfiles = profiles.filter(p => {
    if (filters.minRating > 0 && (!p.avg_rating || p.avg_rating < filters.minRating)) return false
    if (filters.homeService && !p.home_service) return false
    if (p.min_price !== undefined) {
      if (p.min_price < filters.minPrice || p.min_price > filters.maxPrice) return false
    }
    return true
  })

  // Active filter chips
  const activeFilters: { key: keyof Filters; label: string }[] = []
  if (filters.city) activeFilters.push({ key: 'city', label: `📍 ${filters.city}` })
  if (filters.specialty) {
    const s = SPECIALTIES.find(x => x.value === filters.specialty)
    if (s) activeFilters.push({ key: 'specialty', label: `${s.emoji} ${s.label}` })
  }
  if (filters.minRating > 0) activeFilters.push({ key: 'minRating', label: `★ ${filters.minRating}+` })
  if (filters.homeService) activeFilters.push({ key: 'homeService', label: '🛵 Domicile' })
  if (filters.minPrice > 0 || filters.maxPrice < 500) {
    activeFilters.push({ key: 'minPrice', label: `${filters.minPrice}€ – ${filters.maxPrice}€` })
  }

  const removeFilter = (key: keyof Filters) => {
    setFilters(prev => ({
      ...prev,
      [key]: DEFAULT_FILTERS[key],
      // Also reset maxPrice when clearing minPrice chip
      ...(key === 'minPrice' ? { maxPrice: DEFAULT_FILTERS.maxPrice } : {}),
    }))
  }

  const resetAll = () => setFilters(DEFAULT_FILTERS)

  // ── Filter panel (shared between sidebar and mobile drawer) ──────────────

  const FilterPanel = () => (
    <div className="space-y-7">
      {/* City */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Ville
        </label>
        <div className="relative">
          <select
            value={filters.city}
            onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
            className="input-field appearance-none pr-9 cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Specialty */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Spécialité
        </label>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setFilters(f => ({ ...f, specialty: '' }))}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all',
              !filters.specialty
                ? 'border-pink-300 bg-pink-50 text-pink-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50'
            )}
          >
            <span className="text-base">✨</span> Toutes
          </button>
          {SPECIALTIES.map(s => (
            <button
              key={s.value}
              onClick={() => setFilters(f => ({ ...f, specialty: f.specialty === s.value ? '' : s.value }))}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all text-left',
                filters.specialty === s.value
                  ? 'border-pink-300 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50'
              )}
            >
              <span className="text-base">{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Budget
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              min={0}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: Math.max(0, Number(e.target.value)) }))}
              className="input-field pl-3 pr-7 text-sm"
              placeholder="0"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
          </div>
          <span className="text-gray-400 text-sm flex-shrink-0">–</span>
          <div className="relative flex-1">
            <input
              type="number"
              min={filters.minPrice}
              max={500}
              value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: Math.min(500, Math.max(f.minPrice, Number(e.target.value))) }))}
              className="input-field pl-3 pr-7 text-sm"
              placeholder="500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
          </div>
        </div>
      </div>

      {/* Min rating */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Note minimale
        </label>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4, 5].map(r => (
            <button
              key={r}
              onClick={() => setFilters(f => ({ ...f, minRating: r === f.minRating ? 0 : r }))}
              className={clsx(
                'flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold border transition-all',
                filters.minRating === r && r > 0
                  ? 'border-amber-300 bg-amber-50 text-amber-600'
                  : r === 0
                  ? 'border-gray-200 bg-gray-50 text-gray-400 text-xs'
                  : 'border-gray-200 bg-white text-gray-400 hover:border-amber-200 hover:bg-amber-50'
              )}
              title={r === 0 ? 'Toutes' : `${r}+ étoiles`}
            >
              {r === 0 ? '–' : <><Star size={11} className={filters.minRating > 0 && r <= filters.minRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'} />{r}</>}
            </button>
          ))}
        </div>
      </div>

      {/* Home service */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setFilters(f => ({ ...f, homeService: !f.homeService }))}
            className={clsx(
              'w-12 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 cursor-pointer flex-shrink-0',
              filters.homeService ? 'bg-pink-500' : 'bg-gray-200'
            )}
          >
            <div className={clsx(
              'w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              filters.homeService ? 'translate-x-6' : 'translate-x-0'
            )} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Home size={13} className="text-gray-400" />
              Déplacement à domicile
            </p>
            <p className="text-xs text-gray-400">Prestataires qui se déplacent</p>
          </div>
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={resetAll}
        className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-xl transition-all font-medium"
      >
        Réinitialiser les filtres
      </button>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Trouver une prestataire
              </h1>
              <p className="text-gray-500 mt-1.5 text-base">
                {loading
                  ? 'Chargement…'
                  : `${filteredProfiles.length} prestataire${filteredProfiles.length !== 1 ? 's' : ''} trouvée${filteredProfiles.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <Link href="/" className="text-sm text-pink-500 hover:text-pink-600 font-semibold flex items-center gap-1.5 flex-shrink-0">
              ← Retour à l&apos;accueil
            </Link>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-xs font-semibold text-gray-400 mr-1">Filtres actifs :</span>
              {activeFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => removeFilter(f.key)}
                  className="inline-flex items-center gap-1.5 bg-white border border-pink-200 text-pink-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors shadow-sm"
                >
                  {f.label}
                  <X size={11} />
                </button>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={resetAll}
                  className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 transition-colors"
                >
                  Tout effacer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar — desktop ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={16} className="text-pink-500" />
                <h2 className="font-extrabold text-gray-900 text-base">Filtres</h2>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* ── Results ── */}
          <main className="flex-1 min-w-0">

            {/* Mobile filter button */}
            <div className="lg:hidden mb-5 flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-pink-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
              >
                <SlidersHorizontal size={15} className="text-pink-500" />
                Filtres
                {activeFilters.length > 0 && (
                  <span className="ml-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
              {activeFilters.length > 0 && (
                <button onClick={resetAll} className="text-sm text-pink-500 hover:text-pink-600 font-medium">
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Results grid */}
            {loading ? (
              <SkeletonGrid count={8} />
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-24 space-y-4 bg-white rounded-2xl border border-gray-100">
                <Search size={48} className="mx-auto text-gray-200" />
                <p className="text-gray-500 text-lg font-semibold">Aucune prestataire trouvée</p>
                <p className="text-gray-400 text-sm">Essaie de modifier ou réinitialiser tes filtres.</p>
                <button onClick={resetAll} className="btn-primary mt-2">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProfiles.map((p, i) => (
                  <ProfileCard key={p.id} profile={p} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] bg-white shadow-2xl flex flex-col lg:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-pink-500" />
                <h2 className="font-extrabold text-gray-900 text-base">Filtres</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable filter content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterPanel />
            </div>

            {/* Apply button */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-primary w-full py-3 text-sm"
              >
                Voir {filteredProfiles.length} prestataire{filteredProfiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

'use client'
import { useEffect, useState, useCallback } from 'react'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import { getAvailability, setAvailability } from '@/lib/queries'
import { getMyProfile } from '@/lib/queries'

export default function CalendarPage() {
  const [availability, setAvailabilityMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const load = useCallback(async () => {
    const profile = await getMyProfile()
    if (!profile) return
    const av = await getAvailability(profile.id)
    setAvailabilityMap(av)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleToggle = async (date: string, makeAvailable: boolean) => {
    // Optimistic update
    setAvailabilityMap(prev => ({ ...prev, [date]: makeAvailable }))
    setSaving(true)
    try {
      await setAvailability(date, makeAvailable)
      setLastSaved(date)
      setTimeout(() => setLastSaved(null), 2000)
    } catch {
      // Rollback
      setAvailabilityMap(prev => ({ ...prev, [date]: !makeAvailable }))
    } finally {
      setSaving(false)
    }
  }

  const unavailableCount = Object.values(availability).filter(v => v === false).length

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disponibilités</h1>
          <p className="text-sm text-gray-500 mt-1">Gère ton calendrier de disponibilité</p>
        </div>
        {saving && (
          <span className="text-xs text-pink-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            Sauvegarde…
          </span>
        )}
        {lastSaved && !saving && (
          <span className="text-xs text-green-500">✅ Sauvegardé</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-green-600">{unavailableCount === 0 ? '∞' : Object.keys(availability).filter(k => availability[k] !== false).length}</p>
          <p className="text-xs text-gray-500 mt-1">Jours disponibles</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-red-500">{unavailableCount}</p>
          <p className="text-xs text-gray-500 mt-1">Jours bloqués</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <AvailabilityCalendar
          availability={availability}
          onToggle={handleToggle}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-800">💡 Comment ça marche</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Tous les jours futurs sont disponibles par défaut</li>
          <li>Clique sur un jour pour le marquer comme <strong>indisponible</strong></li>
          <li>Clique à nouveau pour le rendre disponible</li>
          <li>Les clientes voient ton calendrier avant de réserver</li>
        </ul>
      </div>
    </div>
  )
}

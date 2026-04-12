'use client'
import { Profile } from '@/types'

interface Step { label: string; done: boolean; href: string }

export default function ProfileCompletion({ profile, photoCount, serviceCount }: {
  profile: Profile; photoCount: number; serviceCount: number
}) {
  const steps: Step[] = [
    { label: 'Nom complet', done: !!profile.full_name, href: '/dashboard' },
    { label: 'Ville', done: !!profile.city, href: '/dashboard' },
    { label: 'WhatsApp', done: !!profile.whatsapp, href: '/dashboard' },
    { label: 'Description', done: !!profile.description, href: '/dashboard' },
    { label: 'Au moins 1 photo', done: photoCount > 0, href: '/dashboard/photos' },
    { label: '3 photos ou plus', done: photoCount >= 3, href: '/dashboard/photos' },
    { label: 'Au moins 1 prestation', done: serviceCount > 0, href: '/dashboard/services' },
  ]
  const done = steps.filter(s => s.done).length
  const pct = Math.round((done / steps.length) * 100)
  const color = pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-pink-500' : 'bg-amber-400'

  if (pct === 100) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
      <span className="text-2xl">🏆</span>
      <div><p className="font-semibold text-green-800">Profil complet !</p><p className="text-sm text-green-600">Tu es visible par toutes les clientes.</p></div>
    </div>
  )

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">Complète ton profil</p>
        <span className="text-sm font-bold text-pink-500">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-1.5">
        {steps.filter(s => !s.done).map(s => (
          <a key={s.label} href={s.href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-500 transition-colors">
            <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
            {s.label}
          </a>
        ))}
      </div>
    </div>
  )
}

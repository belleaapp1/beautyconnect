'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PROVIDER_NAV = [
  { section: 'Mon espace', items: [
    { href: '/dashboard',              icon: '👤', label: 'Mon profil' },
    { href: '/dashboard/photos',       icon: '📸', label: 'Mes photos' },
    { href: '/dashboard/services',     icon: '💅', label: 'Prestations & tarifs' },
  ]},
  { section: 'Activité', items: [
    { href: '/dashboard/reservations', icon: '📅', label: 'Réservations' },
    { href: '/dashboard/calendar',     icon: '🗓️',  label: 'Disponibilités' },
    { href: '/dashboard/stats',        icon: '📊', label: 'Statistiques' },
  ]},
]

const CLIENT_NAV = [
  { section: 'Mon espace', items: [
    { href: '/dashboard/client',       icon: '👩', label: 'Mes réservations' },
  ]},
]

const ADMIN_NAV = [
  { section: 'Administration', items: [
    { href: '/admin',                  icon: '🏠', label: 'Vue d\'ensemble' },
    { href: '/admin',                  icon: '👥', label: 'Prestataires' },
  ]},
]

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const groups = role === 'client' ? CLIENT_NAV : role === 'admin' ? ADMIN_NAV : PROVIDER_NAV

  const navLink = (href: string, icon: string, label: string) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link key={href + label} href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active
            ? 'bg-pink-50 text-pink-600 shadow-sm border border-pink-100'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}>
        <span className="text-base">{icon}</span>
        <span>{label}</span>
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-400" />}
      </Link>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-52 flex-shrink-0 hidden md:block">
        <nav className="space-y-5 sticky top-24">
          {groups.map(g => (
            <div key={g.section}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">{g.section}</p>
              <div className="space-y-0.5">
                {g.items.map(i => navLink(i.href, i.icon, i.label))}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-100">
            <Link href="/tarifs"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition-all">
              <span>⭐</span><span>Passer Premium</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2 py-2 flex gap-1 overflow-x-auto">
        {groups.flatMap(g => g.items).map(i => {
          const active = pathname === i.href || (i.href !== '/dashboard' && pathname.startsWith(i.href))
          return (
            <Link key={i.href + i.label} href={i.href}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                active ? 'bg-pink-50 text-pink-600' : 'text-gray-500'
              }`}>
              <span className="text-lg">{i.icon}</span>
              <span className="truncate max-w-[4rem]">{i.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

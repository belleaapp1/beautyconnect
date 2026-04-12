'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { SPECIALTIES } from '@/lib/constants'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null))
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/'); router.refresh() }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'} border-b border-gray-100`}>
      {/* Barre top annonce */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs py-1.5 text-center font-medium hidden sm:block">
        🌸 BeautyConnect — Mise en relation beauté 100% gratuite pour les clientes
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-2xl">🌸</span>
          <span className="font-extrabold text-xl tracking-tight text-gray-900">
            Beauty<span className="text-pink-500">Connect</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {SPECIALTIES.map(s => (
            <Link
              key={s.value}
              href={`/?specialty=${s.value}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${pathname === '/' ? 'text-gray-600 hover:text-pink-500 hover:bg-pink-50' : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'}`}
            >
              <span>{s.emoji}</span>{s.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-pink-500 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Mon espace
              </Link>
              <button onClick={logout} className="btn-secondary text-sm py-2 px-4">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-pink-500 font-medium px-3 py-2 transition-colors">
                Connexion
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">
                Rejoindre gratuitement
              </Link>
            </>
          )}
        </div>

        {/* Hamburger mobile */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setOpen(!open)}>
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-5 space-y-4 shadow-lg">
          <div className="grid grid-cols-3 gap-2">
            {SPECIALTIES.map(s => (
              <Link key={s.value} href={`/?specialty=${s.value}`}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-pink-50 text-xs font-medium text-gray-700 transition-colors"
                onClick={() => setOpen(false)}>
                <span className="text-xl">{s.emoji}</span>{s.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" className="block w-full text-center py-3 bg-gray-50 rounded-xl text-sm font-medium" onClick={() => setOpen(false)}>
                  Mon espace
                </Link>
                <button onClick={logout} className="block w-full text-center py-3 text-gray-500 text-sm">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block w-full text-center py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>
                  Connexion
                </Link>
                <Link href="/auth/register" className="btn-primary block text-center py-3 text-sm" onClick={() => setOpen(false)}>
                  Rejoindre gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

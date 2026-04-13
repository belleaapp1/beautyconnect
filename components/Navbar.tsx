'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { SPECIALTIES } from '@/lib/constants'
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white text-xs py-2 text-center font-medium tracking-wide hidden sm:block">
        <span className="inline-flex items-center gap-2">
          🌸 Réservez vos prestations beauté en ligne
          <span className="w-1 h-1 rounded-full bg-white/60 inline-block" />
          Livraison de beauté à domicile
        </span>
      </div>

      {/* Main nav */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-gray-100/80"
        animate={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,1)',
          boxShadow: scrolled
            ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
            : '0 1px 0 rgba(0,0,0,0.04)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ backdropFilter: scrolled ? 'blur(16px)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            >
              🌸
            </motion.span>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              Beauty<span className="text-gradient-pink">Connect</span>
            </span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {SPECIALTIES.map((s) => (
              <Link
                key={s.value}
                href={`/?specialty=${s.value}`}
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${pathname === '/'
                    ? 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                    : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                  }
                `}
              >
                <span className="text-base leading-none">{s.emoji}</span>
                {s.label}
              </Link>
            ))}
          </nav>

          {/* Right — Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/register"
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-pink-500" />
              Devenir prestataire
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-primary text-sm py-2 px-5"
                >
                  Mon espace
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-gray-700 px-2 py-2 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm py-2 px-5">
                Connexion
              </Link>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
            onClick={() => setOpen(!open)}
            aria-label="Ouvrir le menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-5 space-y-5">
                {/* Specialty grid */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Spécialités
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {SPECIALTIES.map((s, i) => (
                      <motion.div
                        key={s.value}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={`/?specialty=${s.value}`}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-pink-50 hover:border-pink-200 border border-transparent text-xs font-semibold text-gray-700 transition-all duration-150"
                          onClick={() => setOpen(false)}
                        >
                          <span className="text-2xl">{s.emoji}</span>
                          <span>{s.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Auth section */}
                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-xl text-sm font-semibold text-pink-700 hover:bg-pink-100 transition-all"
                    onClick={() => setOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} />
                      Devenir prestataire
                    </span>
                    <ChevronRight size={14} className="opacity-50" />
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="btn-primary block text-center w-full py-3 text-sm"
                        onClick={() => setOpen(false)}
                      >
                        Mon espace
                      </Link>
                      <button
                        onClick={() => { setOpen(false); logout() }}
                        className="block w-full text-center py-3 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="btn-primary block text-center w-full py-3 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      Connexion
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}

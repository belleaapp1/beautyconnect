'use client'
import { useEffect, useState, useRef } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/queries'
import { Notification } from '@/types'
import Link from 'next/link'

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "À l'instant"
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

const TYPE_ICON: Record<string, string> = {
  reservation: '📅',
  review:      '⭐',
  info:        'ℹ️',
  default:     '🔔',
}

export default function NotificationBell() {
  const [notifs, setNotifs]   = useState<Notification[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.read).length

  const load = async () => {
    setLoading(true)
    const data = await getMyNotifications().catch(() => [])
    setNotifs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRead = async (id: string) => {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
    await markNotificationRead(id).catch(() => {})
  }

  const handleReadAll = async () => {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })))
    await markAllNotificationsRead().catch(() => {})
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) load() }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-card-lg border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={handleReadAll}
                    className="text-xs text-pink-500 hover:text-pink-700 flex items-center gap-1 font-medium transition-colors">
                    <CheckCheck size={13} /> Tout lire
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="text-3xl block mb-2">🔔</span>
                  <p className="text-sm text-gray-400">Aucune notification</p>
                </div>
              ) : (
                notifs.map(n => (
                  <div key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${n.read ? '' : 'bg-pink-50/60'}`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? TYPE_ICON.default}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>{n.title}</p>
                      {n.message && <p className="text-xs text-gray-400 mt-0.5 truncate">{n.message}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                        <div className="flex gap-2">
                          {n.link && (
                            <Link href={n.link} onClick={() => { handleRead(n.id); setOpen(false) }}
                              className="text-xs text-pink-500 hover:text-pink-700 font-medium">
                              Voir →
                            </Link>
                          )}
                          {!n.read && (
                            <button onClick={() => handleRead(n.id)}
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                              <Check size={11} /> Lu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-pink-400 flex-shrink-0 mt-1.5" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

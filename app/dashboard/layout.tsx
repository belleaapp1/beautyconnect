import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const role = profile?.role ?? 'provider'

  // Redirect clients to their own dashboard
  // (only redirect if they somehow land on the provider-only sub-pages)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span className="font-bold text-gray-900">BeautyConnect</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-purple-400' : role === 'client' ? 'bg-blue-400' : 'bg-green-400'}`} />
              {profile?.full_name || user.email}
            </span>
            <Link href="/" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">← Site</Link>
            <form action="/auth/signout" method="post">
              <button className="text-xs text-gray-400 hover:text-red-400 transition-colors">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <DashboardNav role={role} />

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}

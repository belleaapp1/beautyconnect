import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect('/')
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">A</div>
          <div>
            <h1 className="font-bold text-gray-900">Admin BeautyConnect</h1>
            <p className="text-xs text-gray-400">{user.email} · Admin</p>
          </div>
        </div>
        <a href="/" className="btn-secondary text-sm py-2 px-4">← Voir le site</a>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8"><AdminClient /></div>
    </div>
  )
}

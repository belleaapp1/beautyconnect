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
        <div className="flex items-center gap-3"><span className="text-xl">🌸</span><div><h1 className="font-bold text-gray-900">Admin BeautyConnect</h1><p className="text-xs text-gray-400">{user.email}</p></div></div>
        <a href="/" className="text-sm text-gray-500 hover:text-pink-500">← Voir le site</a>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8"><AdminClient /></div>
    </div>
  )
}

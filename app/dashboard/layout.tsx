import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><span className="text-xl">🌸</span><span className="font-bold text-gray-900">BeautyConnect</span></Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
            <Link href="/" className="text-sm text-gray-500 hover:text-pink-500">Voir le site</Link>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-48 flex-shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Mon espace</p>
            {[{href:'/dashboard',label:'👤 Mon profil'},{href:'/dashboard/photos',label:'📸 Mes photos'},{href:'/dashboard/services',label:'💅 Mes prestations'}].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-all">{item.label}</Link>
            ))}
          </nav>
        </aside>
        <div className="md:hidden w-full mb-6 -mt-2">
          <div className="flex gap-2 overflow-x-auto">
            {[{href:'/dashboard',label:'👤 Profil'},{href:'/dashboard/photos',label:'📸 Photos'},{href:'/dashboard/services',label:'💅 Prestations'}].map(item => (
              <Link key={item.href} href={item.href} className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-pink-300 hover:text-pink-600 transition-all">{item.label}</Link>
            ))}
          </div>
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}

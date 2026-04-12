'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2"><span className="text-3xl">🌸</span><span className="font-bold text-2xl text-gray-900">BeautyConnect</span></Link>
          <p className="text-gray-500 mt-2">Connecte-toi à ton espace prestataire</p>
        </div>
        <div className="card p-8 space-y-5">
          <h1 className="text-xl font-semibold text-gray-900">Connexion</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="ton@email.fr" required autoFocus /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required /></div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
          </form>
          <p className="text-center text-sm text-gray-500">Pas de compte ? <Link href="/auth/register" className="text-pink-500 font-medium hover:underline">Rejoindre gratuitement</Link></p>
        </div>
      </div>
    </div>
  )
}

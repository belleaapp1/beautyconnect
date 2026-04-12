'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Mots de passe différents'); return }
    if (password.length < 6) { setError('Minimum 6 caractères'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message === 'User already registered' ? 'Email déjà utilisé' : error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2"><span className="text-3xl">🌸</span><span className="font-bold text-2xl text-gray-900">BeautyConnect</span></Link>
          <p className="text-gray-500 mt-2">Crée ton profil gratuitement en 5 minutes</p>
        </div>
        <div className="flex justify-center gap-6 mb-6 text-xs text-gray-500"><span>✅ 100% gratuit</span><span>✅ Sans CB</span><span>✅ 5 min</span></div>
        <div className="card p-8 space-y-5">
          <h1 className="text-xl font-semibold text-gray-900">Créer mon compte</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="ton@email.fr" required autoFocus /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 caractères" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-field" placeholder="••••••••" required /></div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Création...' : 'Créer mon compte gratuitement'}</button>
          </form>
          <p className="text-xs text-gray-400 text-center">🔒 Paiement sécurisé · Bientôt disponible</p>
          <p className="text-center text-sm text-gray-500">Déjà un compte ? <Link href="/auth/login" className="text-pink-500 font-medium hover:underline">Se connecter</Link></p>
        </div>
      </div>
    </div>
  )
}

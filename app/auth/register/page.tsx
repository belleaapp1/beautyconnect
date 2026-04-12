'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Role } from '@/types'

const ROLES: { value: Role; emoji: string; title: string; desc: string }[] = [
  { value: 'provider', emoji: '💅', title: 'Je suis prestataire', desc: 'Coiffure, ongles, maquillage…' },
  { value: 'client',   emoji: '👩', title: 'Je suis cliente',     desc: 'Je cherche une prestataire' },
]

export default function RegisterPage() {
  const [role, setRole]         = useState<Role>('provider')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Mots de passe différents'); return }
    if (password.length < 6)  { setError('Minimum 6 caractères'); return }
    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message === 'User already registered' ? 'Email déjà utilisé' : signUpError.message)
      setLoading(false); return
    }
    if (data.user) await supabase.from('profiles').update({ role }).eq('id', data.user.id)
    router.push(role === 'client' ? '/dashboard/client' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🌸</span>
            <span className="font-bold text-2xl text-gray-900">BeautyConnect</span>
          </Link>
          <p className="text-gray-500 mt-2">Crée ton compte gratuitement</p>
        </div>
        <div className="card p-8 space-y-6">
          <h1 className="text-xl font-semibold text-gray-900">Créer mon compte</h1>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Je suis…</p>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    role === r.value ? 'border-pink-400 bg-pink-50 shadow-sm' : 'border-gray-200 bg-white hover:border-pink-200'
                  }`}>
                  <span className="text-2xl block mb-1">{r.emoji}</span>
                  <p className="font-semibold text-sm text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="ton@email.fr" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 6 caractères" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-field" placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte gratuitement'}
            </button>
          </form>

          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span>✅ 100% gratuit</span><span>✅ Sans CB</span><span>✅ 2 min</span>
          </div>
          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-pink-500 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { addReview } from '@/lib/queries'
import { StarPicker } from './StarRating'

export default function ReviewForm({ profileId, onAdded }: { profileId: string; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { setError('Choisis une note'); return }
    setLoading(true); setError('')
    try {
      await addReview({ profile_id: profileId, reviewer_name: name.trim(), rating, comment: comment.trim() })
      setDone(true); onAdded()
    } catch { setError('Erreur lors de l\'envoi') }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-2">
      <span className="text-3xl">🎉</span>
      <p className="font-semibold text-green-800">Merci pour ton avis !</p>
      <p className="text-sm text-green-600">Il sera visible dès maintenant.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
      <p className="font-semibold text-gray-900">Laisser un avis</p>
      <div>
        <p className="text-sm text-gray-600 mb-2">Ta note *</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <input type="text" placeholder="Ton prénom *" value={name} onChange={e => setName(e.target.value)} className="input-field" required maxLength={40} />
      <textarea placeholder="Ton commentaire (optionnel)" value={comment} onChange={e => setComment(e.target.value)} className="input-field resize-none" rows={3} maxLength={300} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading || !name.trim() || !rating}>
        {loading ? 'Envoi...' : 'Publier mon avis'}
      </button>
    </form>
  )
}

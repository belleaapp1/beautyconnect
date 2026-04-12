'use client'
import { useState } from 'react'
import { addService } from '@/lib/queries'

export default function ServiceForm({ onAdded, disabled }: { onAdded: () => void; disabled?: boolean }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('60')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) return
    setLoading(true); setError('')
    try {
      await addService({ name: name.trim(), price: Math.round(parseFloat(price)), duration_min: parseInt(duration) })
      setName(''); setPrice(''); setDuration('60'); onAdded()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Erreur') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-pink-50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-gray-700">Ajouter une prestation</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" placeholder="Ex : Pose gel couleur" value={name} onChange={e => setName(e.target.value)} className="input-field flex-1" disabled={disabled || loading} required maxLength={80} />
        <input type="number" placeholder="Prix €" value={price} onChange={e => setPrice(e.target.value)} className="input-field w-28" min="0" max="9999" disabled={disabled || loading} required />
        <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field w-36" disabled={disabled || loading}>
          {[['30','30 min'],['45','45 min'],['60','1h'],['90','1h30'],['120','2h'],['180','3h'],['240','4h']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={disabled || loading || !name.trim() || !price}>
          {loading ? '...' : '+ Ajouter'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  )
}

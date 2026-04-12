'use client'
import { Service } from '@/types'
import { deleteService } from '@/lib/queries'
import { useState } from 'react'

export default function ServiceList({ services, editable, onUpdate }: { services: Service[]; editable?: boolean; onUpdate?: () => void }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette prestation ?')) return
    setDeleting(id)
    try { await deleteService(id); onUpdate?.() } finally { setDeleting(null) }
  }
  if (!services.length) return <p className="text-sm text-gray-400 italic py-4 text-center">Aucune prestation pour l&apos;instant</p>
  return (
    <div className="space-y-2">
      {services.map(s => (
        <div key={s.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-pink-200 transition-colors">
          <div>
            <p className="font-medium text-gray-900 text-sm">{s.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.duration_min} min</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-pink-600">{s.price}€</span>
            {editable && <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="text-gray-300 hover:text-red-400 transition-colors text-lg">{deleting === s.id ? '...' : '✕'}</button>}
          </div>
        </div>
      ))}
    </div>
  )
}

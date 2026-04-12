'use client'
import { useState } from 'react'

export function StarDisplay({ rating, count, size = 'sm' }: { rating?: number; count?: number; size?: 'sm' | 'md' | 'lg' }) {
  if (!rating) return null
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  return (
    <div className={`flex items-center gap-1 ${sizes[size]}`}>
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
        ))}
      </div>
      <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-gray-400">({count})</span>}
    </div>
  )
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i} type="button"
          className={`text-3xl transition-transform hover:scale-110 ${i <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >★</button>
      ))}
    </div>
  )
}

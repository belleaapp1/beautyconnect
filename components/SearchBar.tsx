'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CITIES, SPECIALTIES } from '@/lib/constants'
import { Specialty } from '@/types'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [specialty, setSpecialty] = useState<Specialty | ''>(searchParams.get('specialty') as Specialty ?? '')

  const search = () => {
    const p = new URLSearchParams()
    if (city) p.set('city', city)
    if (specialty) p.set('specialty', specialty)
    router.push(`/?${p.toString()}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col sm:flex-row gap-2">
      <select value={city} onChange={e => setCity(e.target.value)} className="input-field sm:flex-1 cursor-pointer">
        <option value="">📍 Toutes les villes</option>
        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={specialty} onChange={e => setSpecialty(e.target.value as Specialty | '')} className="input-field sm:flex-1 cursor-pointer">
        <option value="">✨ Toutes les spécialités</option>
        {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
      </select>
      <button onClick={search} className="btn-primary whitespace-nowrap px-8">Rechercher</button>
    </div>
  )
}

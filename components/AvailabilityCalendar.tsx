'use client'
import { useState } from 'react'

interface Props {
  availability: Record<string, boolean>
  onToggle?: (date: string, current: boolean) => void
  readOnly?: boolean
}

const DAYS    = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function AvailabilityCalendar({ availability, onToggle, readOnly = false }: Props) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay   = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // getDay(): 0=Sun…6=Sat → reindex so Monday=0
  const startOffset = (firstDay.getDay() + 6) % 7

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="select-none">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">‹</button>
        <p className="font-bold text-gray-900">{MONTHS[month]} {year}</p>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />
          const key     = toKey(year, month, day)
          const isPast  = key < todayKey
          const isToday = key === todayKey
          // undefined = available by default
          const isUnavailable = availability[key] === false

          let cls = 'w-full aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all '
          if (isPast) {
            cls += 'text-gray-200 cursor-default'
          } else if (isUnavailable) {
            cls += 'bg-red-100 text-red-500 ' + (readOnly ? '' : 'hover:bg-red-200 cursor-pointer')
          } else {
            cls += 'bg-green-100 text-green-700 ' + (readOnly ? '' : 'hover:bg-green-200 cursor-pointer')
          }
          if (isToday) cls += ' ring-2 ring-pink-400'

          return (
            <button key={idx} type="button"
              disabled={isPast || readOnly}
              className={cls}
              onClick={() => !isPast && !readOnly && onToggle?.(key, !isUnavailable)}
              title={isUnavailable ? 'Indisponible' : 'Disponible'}>
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      {!readOnly && (
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" />Disponible</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" />Indisponible</span>
        </div>
      )}
    </div>
  )
}

'use client'
import Image from 'next/image'
import { useState } from 'react'
import { Photo } from '@/types'

export default function PhotoGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [selected, setSelected] = useState<Photo | null>(null)
  if (!photos.length) return null
  const [main, ...rest] = photos
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 relative rounded-xl overflow-hidden cursor-pointer bg-gray-100" style={{ aspectRatio: '4/3' }} onClick={() => setSelected(main)}>
          <Image src={main.url!} alt={name} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="60vw" />
        </div>
        <div className="flex flex-col gap-2">
          {rest.slice(0, 3).map((photo, i) => (
            <div key={photo.id} className="relative rounded-xl overflow-hidden cursor-pointer bg-gray-100 flex-1" onClick={() => setSelected(photo)}>
              <Image src={photo.url!} alt={`${name} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="20vw" />
              {i === 2 && rest.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+{rest.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <Image src={selected.url!} alt={name} width={900} height={700} className="object-contain w-full rounded-xl" />
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-white bg-black/50 rounded-full w-9 h-9 flex items-center justify-center">✕</button>
            <div className="flex gap-2 mt-3 justify-center">
              {photos.map(p => <button key={p.id} onClick={() => setSelected(p)} className={`w-2 h-2 rounded-full ${p.id === selected.id ? 'bg-white scale-125' : 'bg-white/40'}`} />)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

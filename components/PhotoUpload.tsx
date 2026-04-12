'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Photo } from '@/types'
import { uploadPhoto, deletePhoto } from '@/lib/queries'
import { MAX_PHOTOS } from '@/lib/constants'

export default function PhotoUpload({ photos, onUpdate }: { photos: Photo[]; onUpdate: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError('')
    if (photos.length >= MAX_PHOTOS) { setError('Maximum 5 photos atteint'); return }
    setUploading(true)
    try {
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
        if (!file.type.startsWith('image/')) { setError('Seules les images sont acceptées'); continue }
        if (file.size > 5 * 1024 * 1024) { setError('Max 5 MB par image'); continue }
        await uploadPhoto(file)
      }
      onUpdate()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur upload')
    } finally { setUploading(false) }
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Supprimer cette photo ?')) return
    setDeleting(photo.id)
    try { await deletePhoto(photo); onUpdate() }
    catch { setError('Erreur suppression') }
    finally { setDeleting(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{photos.length}/{MAX_PHOTOS} photos</p>
        {photos.length > 0 && <p className="text-xs text-gray-400">1ère photo = photo principale</p>}
      </div>
      {photos.length < MAX_PHOTOS && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          {uploading
            ? <div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /><p className="text-sm text-pink-500 font-medium">Upload...</p></div>
            : <div className="flex flex-col items-center gap-2"><span className="text-3xl">📸</span><p className="text-sm font-medium text-gray-700">Glisse tes photos ici</p><p className="text-xs text-gray-400">ou clique • max 5 MB</p></div>}
        </div>
      )}
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '1' }}>
              <Image src={photo.url!} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="33vw" />
              {i === 0 && <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">Principale</div>}
              <button onClick={() => handleDelete(photo)} disabled={deleting === photo.id} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 text-xs">
                {deleting === photo.id ? '...' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

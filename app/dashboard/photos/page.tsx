'use client'
import { useEffect, useState, useCallback } from 'react'
import { getMyPhotos } from '@/lib/queries'
import { Photo } from '@/types'
import PhotoUpload from '@/components/PhotoUpload'

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => { setPhotos(await getMyPhotos()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Mes photos</h1><p className="text-sm text-gray-500 mt-1">Tes photos sont le premier élément que voient les clientes</p></div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-sm font-medium text-amber-800 mb-1">💡 Conseils</p>
        <ul className="text-sm text-amber-700 space-y-0.5 list-disc list-inside">
          <li>Bonne lumière naturelle</li><li>Fond neutre ou propre</li><li>Gros plan sur le travail</li><li>1ère photo = ta vitrine principale</li>
        </ul>
      </div>
      <div className="card p-6">
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> : <PhotoUpload photos={photos} onUpdate={load} />}
      </div>
    </div>
  )
}

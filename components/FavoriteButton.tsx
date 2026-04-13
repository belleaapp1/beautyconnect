'use client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { isFavorited, toggleFavorite } from '@/lib/queries'

interface Props {
  profileId: string
}

export default function FavoriteButton({ profileId }: Props) {
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isFavorited(profileId)
      .then(v => setFavorited(v))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [profileId])

  const handleClick = async () => {
    setLoading(true)
    try {
      const nowFavorited = await toggleFavorite(profileId)
      setFavorited(nowFavorited)
      toast(nowFavorited ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris', {
        description: nowFavorited ? 'Tu pourras retrouver ce profil dans tes favoris.' : 'Ce profil a été retiré de tes favoris.',
      })
    } catch {
      toast.error('Connecte-toi pour ajouter aux favoris')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border transition-all
        ${favorited
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Heart
        size={18}
        className={`transition-all ${favorited ? 'fill-red-500 stroke-red-500' : 'fill-transparent'}`}
      />
    </button>
  )
}

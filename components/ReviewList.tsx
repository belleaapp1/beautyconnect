import { Review } from '@/types'

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`
  if (diff < 2592000) return `Il y a ${Math.floor(diff/86400)}j`
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return (
    <p className="text-sm text-gray-400 italic text-center py-4">Aucun avis pour l&apos;instant — sois la première ! 🌸</p>
  )
  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-sm font-bold text-pink-700">
                {r.reviewer_name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm text-gray-900">{r.reviewer_name}</span>
            </div>
            <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
          </div>
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-sm ${i <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
          </div>
          {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
        </div>
      ))}
    </div>
  )
}

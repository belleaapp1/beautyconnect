'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ProfileWithDetails } from '@/types'
import { getSpecialty } from '@/lib/constants'

export default function ProfileCard({ profile, index = 0 }: { profile: ProfileWithDetails; index?: number }) {
  const specialty = getSpecialty(profile.specialty)
  const mainPhoto = profile.photos?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link href={`/prestataires/${profile.id}`}>
        <div className="group cursor-pointer card transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5">
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50" style={{ aspectRatio: '3/4' }}>
            {mainPhoto?.url ? (
              <Image
                src={mainPhoto.url} alt={profile.full_name} fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <span className="text-5xl">{specialty.emoji}</span>
                <span className="text-xs text-gray-400">Pas encore de photo</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1">
              <span className={`badge ${specialty.color} shadow-sm`}>{specialty.emoji} {specialty.label}</span>
              {profile.available && (
                <span className="badge bg-green-500 text-white shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" /> Dispo
                </span>
              )}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              {profile.avg_rating && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(profile.avg_rating))}</span>
                  <span className="text-xs text-white/80">{profile.avg_rating.toFixed(1)} ({profile.review_count})</span>
                </div>
              )}
              <p className="font-semibold text-sm truncate leading-tight">{profile.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-white/70">📍 {profile.city}</span>
                {profile.experience_years && <span className="text-xs text-white/60">· {profile.experience_years} ans exp.</span>}
              </div>
            </div>
          </div>

          <div className="px-3 py-2.5 flex items-center justify-between">
            {profile.min_price !== undefined
              ? <p className="text-sm font-medium text-gray-900">À partir de <span className="text-pink-600 font-bold">{profile.min_price}€</span></p>
              : <p className="text-sm text-gray-400">Tarifs sur demande</p>}
            <div className="flex items-center gap-1.5">
              {profile.home_service && <span title="Déplacement possible" className="text-base">🛵</span>}
              <span className="text-xs text-pink-500 font-medium group-hover:underline">Voir →</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

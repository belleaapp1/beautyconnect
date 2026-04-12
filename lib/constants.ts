import { Specialty } from '@/types'

export const CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice',
  'Nantes', 'Bordeaux', 'Lille', 'Rennes', 'Grenoble',
  'Strasbourg', 'Montpellier', 'Tours', 'Dijon', 'Angers',
  'Reims', 'Le Havre', 'Rouen', 'Toulon', 'Saint-Étienne',
]

export const SPECIALTIES: {
  value: Specialty
  label: string
  emoji: string
  color: string
  photo: string
  desc: string
}[] = [
  {
    value: 'nails',
    label: 'Nails',
    emoji: '💅',
    color: 'bg-pink-100 text-pink-700',
    photo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85&fit=crop',
    desc: 'Pose gel, manucure, nail art',
  },
  {
    value: 'coiffure',
    label: 'Coiffure',
    emoji: '✂️',
    color: 'bg-purple-100 text-purple-700',
    photo: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=85&fit=crop',
    desc: 'Coupe, couleur, coiffage',
  },
  {
    value: 'cils',
    label: 'Cils',
    emoji: '👁️',
    color: 'bg-blue-100 text-blue-700',
    photo: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800&q=85&fit=crop',
    desc: 'Extensions, rehaussement',
  },
  {
    value: 'maquillage',
    label: 'Maquillage',
    emoji: '💄',
    color: 'bg-red-100 text-red-700',
    photo: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=85&fit=crop',
    desc: 'Mariée, événements, quotidien',
  },
  {
    value: 'sourcils',
    label: 'Sourcils',
    emoji: '🪮',
    color: 'bg-amber-100 text-amber-700',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=85&fit=crop',
    desc: 'Microblading, dermopigmentation',
  },
]

export const getSpecialty = (value: Specialty) =>
  SPECIALTIES.find(s => s.value === value) ?? SPECIALTIES[0]

export const MAX_PHOTOS = 5
export const MAX_SERVICES = 10
export const MAX_DESCRIPTION_LENGTH = 300

// Freemium plans
export const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: ['Profil public', '5 photos', '10 prestations', 'Contacte WhatsApp'],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'featured',
    name: 'En vedette',
    price: 15,
    features: ['Tout le plan Gratuit', '⭐ Badge "En vedette"', 'Apparaît en 1er', 'Statistiques basiques'],
    cta: 'Passer en vedette',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 35,
    features: ['Tout le plan En vedette', '🏆 Badge Premium', 'Réservations en ligne', 'Statistiques avancées', 'Support prioritaire'],
    cta: 'Devenir Premium',
  },
]

// Commission rate (10% on deposit)
export const COMMISSION_RATE = 0.10

// Deposit rate (30% of service price)
export const DEPOSIT_RATE = 0.30

// Hero photos for homepage collage
export const HERO_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=85&fit=crop', alt: 'Nail art' },
  { src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=85&fit=crop', alt: 'Maquillage' },
  { src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&q=85&fit=crop', alt: 'Coiffure' },
  { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=85&fit=crop', alt: 'Beauté' },
]

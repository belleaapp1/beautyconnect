export type Specialty = 'nails' | 'coiffure' | 'cils' | 'maquillage' | 'sourcils'

export interface Profile {
  id: string
  full_name: string
  city: string
  description: string
  specialty: Specialty
  whatsapp: string
  is_active: boolean
  is_featured: boolean
  experience_years?: number
  home_service?: boolean
  home_service_radius?: number
  available?: boolean
  created_at: string
}

export interface Service {
  id: string
  profile_id: string
  name: string
  price: number
  duration_min: number
  created_at: string
}

export interface Photo {
  id: string
  profile_id: string
  storage_path: string
  position: number
  created_at: string
  url?: string
}

export interface Review {
  id: string
  profile_id: string
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

export interface Reservation {
  id: string
  profile_id: string
  service_id?: string
  service_name?: string
  client_name: string
  client_email: string
  client_phone?: string
  service_date: string
  service_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
  deposit_amount: number
  deposit_paid: boolean
  stripe_payment_intent_id?: string
  notes?: string
  created_at: string
}

export interface Subscription {
  id: string
  profile_id: string
  plan: 'free' | 'featured' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  starts_at: string
  ends_at?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface ProfileWithDetails extends Profile {
  services: Service[]
  photos: Photo[]
  reviews?: Review[]
  min_price?: number
  avg_rating?: number
  review_count?: number
}

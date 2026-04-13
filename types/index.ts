export type Specialty = 'nails' | 'coiffure' | 'cils' | 'maquillage' | 'sourcils'
export type Role = 'admin' | 'client' | 'provider'

export interface Profile {
  id: string
  full_name: string
  city: string
  description: string
  specialty: Specialty
  whatsapp: string
  is_active: boolean
  is_featured: boolean
  role: Role
  experience_years?: number
  home_service?: boolean
  home_service_radius?: number
  available?: boolean
  created_at: string
  is_verified?: boolean
  instagram_url?: string
  avatar_url?: string
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

export interface Availability {
  id: string
  profile_id: string
  date: string
  is_available: boolean
  note?: string
  created_at: string
}

export interface PageView {
  id: string
  path: string
  profile_id?: string
  visitor_id?: string
  created_at: string
}

export interface ProviderStats {
  totalReservations: number
  pendingReservations: number
  confirmedReservations: number
  completedReservations: number
  monthRevenue: number
  profileViews: number
  weeklyViews: number[]
  avgRating?: number
  reviewCount: number
}

export interface DailyCount {
  date: string
  count: number
}

export interface AdminStats {
  totalProviders: number
  activeProviders: number
  totalReservations: number
  monthReservations: number
  totalRevenue: number
  totalCommissions: number
  dailyViews: DailyCount[]
  topProfiles: { id: string; full_name: string; views: number; specialty: string }[]
}

export interface ProfileWithDetails extends Profile {
  services: Service[]
  photos: Photo[]
  reviews?: Review[]
  min_price?: number
  avg_rating?: number
  review_count?: number
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message?: string
  read: boolean
  link?: string
  created_at: string
}

export interface Favorite {
  id: string
  client_id: string
  profile_id: string
  created_at: string
}

import { createClient } from './supabase'
import { Profile, Service, Photo, ProfileWithDetails, Specialty, Review } from '@/types'

function getSupabase() { return createClient() }

export function getPhotoUrl(storagePath: string): string {
  const { data } = getSupabase().storage.from('photos').getPublicUrl(storagePath)
  return data.publicUrl
}

function computeRating(reviews: Review[]) {
  if (!reviews?.length) return { avg_rating: undefined, review_count: 0 }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  return { avg_rating: Math.round(avg * 10) / 10, review_count: reviews.length }
}

export async function searchProfiles(city?: string, specialty?: Specialty): Promise<ProfileWithDetails[]> {
  let query = getSupabase()
    .from('profiles')
    .select('*, services(*), photos(*), reviews(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (city) query = query.eq('city', city)
  if (specialty) query = query.eq('specialty', specialty)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(p => ({
    ...p,
    photos: (p.photos ?? []).sort((a: Photo, b: Photo) => a.position - b.position).map((ph: Photo) => ({ ...ph, url: getPhotoUrl(ph.storage_path) })),
    min_price: p.services?.length ? Math.min(...p.services.map((s: Service) => s.price)) : undefined,
    ...computeRating(p.reviews ?? []),
  }))
}

export async function getProfileById(id: string): Promise<ProfileWithDetails | null> {
  const { data, error } = await getSupabase()
    .from('profiles').select('*, services(*), photos(*), reviews(*)')
    .eq('id', id).eq('is_active', true).single()
  if (error) return null
  return {
    ...data,
    photos: (data.photos ?? []).sort((a: Photo, b: Photo) => a.position - b.position).map((p: Photo) => ({ ...p, url: getPhotoUrl(p.storage_path) })),
    min_price: data.services?.length ? Math.min(...data.services.map((s: Service) => s.price)) : undefined,
    ...computeRating(data.reviews ?? []),
  }
}

export async function addReview(review: { profile_id: string; reviewer_name: string; rating: number; comment: string }): Promise<void> {
  const { error } = await getSupabase().from('reviews').insert(review)
  if (error) throw error
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')
  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  if (error) throw error
}

export async function getMyServices(): Promise<Service[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('services').select('*').eq('profile_id', user.id).order('created_at')
  return data ?? []
}

export async function addService(s: { name: string; price: number; duration_min: number }): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')
  const { error } = await supabase.from('services').insert({ ...s, profile_id: user.id })
  if (error) throw error
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await getSupabase().from('services').delete().eq('id', id)
  if (error) throw error
}

export async function getMyPhotos(): Promise<Photo[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('photos').select('*').eq('profile_id', user.id).order('position')
  return (data ?? []).map(p => ({ ...p, url: getPhotoUrl(p.storage_path) }))
}

export async function uploadPhoto(file: File): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')
  const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
  if ((count ?? 0) >= 5) throw new Error('Maximum 5 photos atteint')
  const ext = file.name.split('.').pop()
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('photos').upload(path, file)
  if (upErr) throw upErr
  const { error: dbErr } = await supabase.from('photos').insert({ profile_id: user.id, storage_path: path, position: count ?? 0 })
  if (dbErr) throw dbErr
}

export async function deletePhoto(photo: Photo): Promise<void> {
  const supabase = getSupabase()
  await supabase.storage.from('photos').remove([photo.storage_path])
  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
}

export async function trackLead(profileId: string): Promise<void> {
  await getSupabase().from('leads').insert({ profile_id: profileId })
  // V2: Commission automatique Stripe Connect
}

export async function getAllProfiles(): Promise<ProfileWithDetails[]> {
  const { data, error } = await getSupabase().from('profiles').select('*, services(*), photos(*)').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(p => ({
    ...p,
    photos: (p.photos ?? []).map((ph: Photo) => ({ ...ph, url: getPhotoUrl(ph.storage_path) })),
    min_price: p.services?.length ? Math.min(...p.services.map((s: Service) => s.price)) : undefined,
  }))
}

export async function toggleProfileActive(id: string, is_active: boolean): Promise<void> {
  const { error } = await getSupabase().from('profiles').update({ is_active }).eq('id', id)
  if (error) throw error
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await getSupabase().from('profiles').delete().eq('id', id)
  if (error) throw error
}

import { createClient } from './supabase'
import { Profile, Service, Photo, ProfileWithDetails, Specialty, Review, ProviderStats, AdminStats, DailyCount } from '@/types'

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
    .order('is_featured', { ascending: false })
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
  await getSupabase().from('leads').insert({ profile_id: profileId }).maybeSingle()
}

export async function getAllProfiles(): Promise<ProfileWithDetails[]> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*, services(*), photos(*), reviews(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(p => ({
    ...p,
    photos: (p.photos ?? []).map((ph: Photo) => ({ ...ph, url: getPhotoUrl(ph.storage_path) })),
    min_price: p.services?.length ? Math.min(...p.services.map((s: Service) => s.price)) : undefined,
    ...computeRating(p.reviews ?? []),
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

// ── Availability ─────────────────────────────────────────────────────────────

export async function getAvailability(profileId: string): Promise<Record<string, boolean>> {
  const { data } = await getSupabase()
    .from('availability')
    .select('date, is_available')
    .eq('profile_id', profileId)
  const result: Record<string, boolean> = {}
  for (const row of data ?? []) result[row.date] = row.is_available
  return result
}

export async function setAvailability(date: string, isAvailable: boolean): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')
  const { error } = await supabase.from('availability').upsert(
    { profile_id: user.id, date, is_available: isAvailable },
    { onConflict: 'profile_id,date' }
  )
  if (error) throw error
}

export async function bulkSetAvailability(dates: string[], isAvailable: boolean): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')
  const rows = dates.map(date => ({ profile_id: user.id, date, is_available: isAvailable }))
  const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'profile_id,date' })
  if (error) throw error
}

// ── Provider Stats ────────────────────────────────────────────────────────────

export async function getProviderStats(): Promise<ProviderStats> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [{ data: reservations }, { data: reviews }, { data: views }] = await Promise.all([
    supabase.from('reservations').select('status, total_price, created_at').eq('profile_id', user.id),
    supabase.from('reviews').select('rating').eq('profile_id', user.id),
    supabase.from('page_views').select('created_at').eq('profile_id', user.id),
  ])

  const rs = reservations ?? []
  const rv = reviews ?? []
  const pv = views ?? []

  const monthRevenue = rs
    .filter(r => r.status === 'completed' && r.created_at >= monthStart)
    .reduce((sum: number, r: { total_price: number }) => sum + r.total_price, 0)

  // Last 7 days views
  const weeklyViews = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return pv.filter((v: { created_at: string }) => v.created_at.startsWith(dateStr)).length
  })

  return {
    totalReservations: rs.length,
    pendingReservations: rs.filter((r: { status: string }) => r.status === 'pending').length,
    confirmedReservations: rs.filter((r: { status: string }) => r.status === 'confirmed').length,
    completedReservations: rs.filter((r: { status: string }) => r.status === 'completed').length,
    monthRevenue,
    profileViews: pv.length,
    weeklyViews,
    avgRating: rv.length ? Math.round(rv.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / rv.length * 10) / 10 : undefined,
    reviewCount: rv.length,
  }
}

// ── Admin Stats ───────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabase()
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [{ data: providers }, { data: reservations }, { data: commissions }, { data: views }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, is_active, specialty'),
    supabase.from('reservations').select('status, total_price, created_at'),
    supabase.from('commissions').select('amount').maybeSingle(),
    supabase.from('page_views').select('created_at, profile_id'),
  ])

  const rs = reservations ?? []
  const pr = providers ?? []
  const pv = views ?? []

  // Daily views last 30 days
  const dailyViews: DailyCount[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().split('T')[0]
    return { date: dateStr, count: pv.filter((v: { created_at: string }) => v.created_at.startsWith(dateStr)).length }
  })

  // Top profiles by views
  const viewsByProfile: Record<string, number> = {}
  for (const v of pv) {
    if (v.profile_id) viewsByProfile[v.profile_id] = (viewsByProfile[v.profile_id] ?? 0) + 1
  }
  const topProfiles = pr
    .map((p: { id: string; full_name: string; specialty: string }) => ({ ...p, views: viewsByProfile[p.id] ?? 0 }))
    .sort((a: { views: number }, b: { views: number }) => b.views - a.views)
    .slice(0, 5)

  const commissionsList = Array.isArray(commissions) ? commissions : commissions ? [commissions] : []

  return {
    totalProviders: pr.length,
    activeProviders: pr.filter((p: { is_active: boolean }) => p.is_active).length,
    totalReservations: rs.length,
    monthReservations: rs.filter((r: { created_at: string }) => r.created_at >= monthStart).length,
    totalRevenue: rs.filter((r: { status: string; total_price: number }) => r.status === 'completed').reduce((s: number, r: { total_price: number }) => s + r.total_price, 0),
    totalCommissions: commissionsList.reduce((s: number, c: { amount: number }) => s + (c?.amount ?? 0), 0),
    dailyViews,
    topProfiles,
  }
}

// ── Client reservations ───────────────────────────────────────────────────────

export async function getMyClientReservations(email: string) {
  const { data } = await getSupabase()
    .from('reservations')
    .select('*')
    .eq('client_email', email)
    .order('service_date', { ascending: false })
  return data ?? []
}

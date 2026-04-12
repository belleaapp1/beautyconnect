import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { path, profile_id, visitor_id } = await req.json()
    const supabase = createServerSupabaseClient()
    await supabase.from('page_views').insert({
      path: path ?? '/',
      profile_id: profile_id ?? null,
      visitor_id: visitor_id ?? null,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

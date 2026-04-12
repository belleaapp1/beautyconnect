import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set(name, value)
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set(name, '')
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set(name, '', options as Parameters<typeof response.cookies.set>[2])
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  if (path.startsWith('/dashboard') && !user) return NextResponse.redirect(new URL('/auth/login', request.url))
  if (path.startsWith('/admin') && (!user || user.email !== process.env.ADMIN_EMAIL)) return NextResponse.redirect(new URL('/', request.url))
  if ((path === '/auth/login' || path === '/auth/register') && user) return NextResponse.redirect(new URL('/dashboard', request.url))
  return response
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'] }

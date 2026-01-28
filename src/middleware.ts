import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const redirectWithCookies = (to: URL) => {
    const redirectRes = NextResponse.redirect(to)
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
      redirectRes.headers.set('set-cookie', setCookie)
    }
    return redirectRes
  }

  // Refrescar la sesión si está expirada
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debug logs
  console.log('Session provider:', session?.user?.app_metadata?.provider)
  console.log('User email:', session?.user?.email)

  // Rutas protegidas (requieren autenticación)
  const protectedRoutes = ['/dashboard', '/perfil', '/reservas', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // Rutas que requieren rol admin
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    // Verificar autenticación
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/signin'
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return redirectWithCookies(redirectUrl)
    }

    // Verificar rol admin para rutas admin
    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const isAdmin = profile?.role === 'venue_admin' || profile?.role === 'super_admin'
      if (!isAdmin) {
        return redirectWithCookies(new URL('/', req.url))
      }
    }
  }

  // Redirigir a dashboard si está autenticado y en ruta de autenticación
  const authRoutes = ['/auth/signin', '/auth/signup']
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)
  const forceAuthRoute = req.nextUrl.searchParams.get('force') === '1'

  if (session && isAuthRoute && !forceAuthRoute) {
    return redirectWithCookies(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|auth/callback).*)'],
}

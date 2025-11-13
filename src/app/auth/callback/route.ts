import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: NextRequest) {
  console.log('[Auth Callback] Received request:', request.url)
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('[Auth Callback] Error received from provider:', { error, errorDescription })
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(url)
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Intercambiar el código por sesión usando la URL completa (recomendado por Supabase)
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(request.url)
  if (exchangeError) {
    console.error('[Auth Callback] CRITICAL: Error exchanging code for session:', exchangeError)
    // Devolver JSON para ver el error en el navegador durante el debug
    return NextResponse.json(
      {
        message: 'Error exchanging code for session',
        error: exchangeError,
        requestUrl: request.url,
      },
      { status: 500 }
    )
  }

  console.log('[Auth Callback] Successfully exchanged code for session. Redirecting to dashboard.')
  const redirectUrl = new URL('/dashboard', request.url)
  return NextResponse.redirect(redirectUrl)
}

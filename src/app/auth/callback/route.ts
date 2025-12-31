import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createAdminClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code:', error)
      return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`)
    }

    if (data.session) {
      console.log('[Auth Callback] Session created for user:', data.session.user.email)

      // Usar cliente admin para verificar y crear perfil (bypassa RLS)
      const adminClient = createAdminClient()

      // Verificar si el perfil ya existe
      const { data: existingProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single()

      if (!existingProfile) {
        console.log('[Auth Callback] Creating profile for user:', data.session.user.email)

        // Crear perfil usando cliente admin (bypassa RLS)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await adminClient.from('profiles').insert({
          id: data.session.user.id,
          email: data.session.user.email || '',
          full_name:
            data.session.user.user_metadata?.full_name ||
            data.session.user.user_metadata?.name ||
            '',
          avatar_url:
            data.session.user.user_metadata?.avatar_url ||
            data.session.user.user_metadata?.picture ||
            null,
          role: 'user',
          is_active: true,
        } as any)

        if (profileError) {
          console.error('[Auth Callback] Error creating profile:', profileError)
        } else {
          console.log('[Auth Callback] Profile created successfully')
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`)
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  const supabaseCookies = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith('sb-'))
    .map((c) => ({ name: c.name, value: c.value?.slice(0, 12) + '…' }))

  return NextResponse.json({
    session: sessionData?.session ? {
      user: {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
      },
      expires_at: sessionData.session.expires_at,
    } : null,
    sessionError: sessionError ? sessionError.message : null,
    user: userData?.user ? {
      id: userData.user.id,
      email: userData.user.email,
    } : null,
    userError: userError ? userError.message : null,
    cookies: supabaseCookies,
  })
}

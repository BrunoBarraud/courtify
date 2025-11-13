'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export default function SupabaseProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode
  initialSession?: Session | null
}) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  // Optional: force sign-out on load (useful in dev to avoid sticky sessions after restart)
  useEffect(() => {
    const shouldForce = process.env.NEXT_PUBLIC_FORCE_LOGOUT_ON_LOAD === 'true'
    if (!shouldForce) return

    // Avoid logging out on auth pages and avoid repeating within the same tab
    const isAuthRoute = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/auth')
    )
    const doneKey = 'courtify.forcedLogoutDone'
    const alreadyDone = typeof window !== 'undefined' && sessionStorage.getItem(doneKey) === '1'
    if (isAuthRoute || alreadyDone) return

    supabaseClient.auth
      .signOut()
      .catch(() => {})
      .finally(() => {
        try {
          sessionStorage.setItem(doneKey, '1')
        } catch {}
      })
    
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  )
}

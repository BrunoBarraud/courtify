/**
 * Supabase Client Configuration
 * Provides browser and server-side Supabase clients
 */

import {
  createClientComponentClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

/**
 * Browser client for use in Client Components
 */
export const createBrowserClient = () => {
  return createClientComponentClient<any>({
    options: {},
  })
}

/**
 * Server client for use in Server Components and API routes
 * Expects a function that returns the cookies store: () => cookies()
 */
export const createServerClient = (
  getCookies: () => ReturnType<(typeof import('next/headers'))['cookies']>
) => {
  return createServerComponentClient<any>({
    cookies: getCookies,
  })
}

/**
 * Admin client with service role key for privileged operations
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

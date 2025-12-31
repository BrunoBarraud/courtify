/**
 * Supabase Client Configuration
 * Provides browser and server-side Supabase clients
 */

import {
  createClientComponentClient,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Browser client for use in Client Components
 */
export const createBrowserClient = () => {
  return createClientComponentClient<Database>({
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    },
  })
}

/**
 * Server client for use in Server Components and API routes
 * Expects a function that returns the cookies store: () => cookies()
 */
export const createServerClient = (getCookies: () => any) => {
  return createServerComponentClient<Database>({
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

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

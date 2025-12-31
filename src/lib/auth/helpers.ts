import { createServerClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { isAdmin, isSuperAdmin } from './roles'
import type { UserRole } from './roles'

export async function requireAuth() {
  const supabase = createServerClient(() => cookies())
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { supabase, session: null, role: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return {
    supabase,
    session,
    role: profile?.role as UserRole | null,
    isAdmin: isAdmin(profile?.role),
    isSuperAdmin: isSuperAdmin(profile?.role),
  }
}

export async function requireAdmin() {
  const auth = await requireAuth()
  return {
    ...auth,
    isAllowed: auth.isAdmin,
  }
}

export async function requireSuperAdmin() {
  const auth = await requireAuth()
  return {
    ...auth,
    isAllowed: auth.isSuperAdmin,
  }
}

export async function checkVenueAccess(_venueId: string) {
  const auth = await requireAuth()
  if (!auth.session) return { ...auth, isAllowed: false }

  // En una sola sede, cualquier admin (super_admin o venue_admin) tiene acceso
  return {
    ...auth,
    isAllowed: auth.isAdmin || false,
  }
}

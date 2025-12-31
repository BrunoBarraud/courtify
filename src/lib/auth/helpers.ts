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

export async function checkVenueAccess(venueId: string) {
  const auth = await requireAuth()
  if (!auth.session) return { ...auth, isAllowed: false }

  // Super admin siempre tiene acceso
  if (auth.isSuperAdmin) return { ...auth, isAllowed: true }

  // Verificar si es admin de la sede
  const { data: venueAdmin } = await auth.supabase
    .from('venue_admins')
    .select('*')
    .eq('venue_id', venueId)
    .eq('user_id', auth.session.user.id)
    .single()

  return {
    ...auth,
    isAllowed: !!venueAdmin,
  }
}

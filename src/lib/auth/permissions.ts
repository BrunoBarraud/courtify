import { createAdminClient } from '@/lib/supabase/client'
import { VenueAdminPermissions, isSuperAdmin } from './roles'

type VenueAdminWithVenue = {
  venue: {
    id: string
    name: string
  } | null
}

export async function checkVenuePermission(
  userId: string,
  venueId: string,
  permission: keyof VenueAdminPermissions
): Promise<boolean> {
  const supabase = createAdminClient()

  // Verificar si es super_admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  if (isSuperAdmin(profile?.role)) return true

  // Verificar permisos específicos
  const { data: venueAdmin } = await supabase
    .from('venue_admins')
    .select('permissions')
    .eq('venue_id', venueId)
    .eq('user_id', userId)
    .single()

  return !!venueAdmin?.permissions?.[permission]
}

export async function getVenuePermissions(
  userId: string,
  venueId: string
): Promise<VenueAdminPermissions | null> {
  const supabase = createAdminClient()

  // Verificar si es super_admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  if (isSuperAdmin(profile?.role)) {
    // Super admin tiene todos los permisos
    return {
      can_manage_bookings: true,
      can_manage_courts: true,
      can_manage_staff: true,
      can_view_reports: true,
      can_manage_pricing: true,
      can_cancel_bookings: true,
    }
  }

  // Obtener permisos específicos
  const { data: venueAdmin } = await supabase
    .from('venue_admins')
    .select('permissions')
    .eq('venue_id', venueId)
    .eq('user_id', userId)
    .single()

  return venueAdmin?.permissions || null
}

export async function getUserVenues(userId: string): Promise<Array<{ id: string; name: string }>> {
  const supabase = createAdminClient()

  // Verificar si es super_admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  if (isSuperAdmin(profile?.role)) {
    // Super admin puede ver todas las sedes
    const { data: venues } = await supabase.from('venues').select('id, name').eq('is_active', true)

    return venues || []
  }

  // Obtener sedes asignadas
  const { data: assignments } = (await supabase
    .from('venue_admins')
    .select('venue:venues(id, name)')
    .eq('user_id', userId)) as { data: VenueAdminWithVenue[] | null }

  return (assignments || [])
    .map(a => ({
      id: a.venue?.id || '',
      name: a.venue?.name || '',
    }))
    .filter(v => v.id !== '')
}

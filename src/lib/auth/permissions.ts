import { createAdminClient } from '@/lib/supabase/client'
import { VenueAdminPermissions, isSuperAdmin, isVenueAdmin } from './roles'

// En una sola sede, simplificamos los permisos:
// - super_admin y venue_admin tienen todos los permisos
// - users normales no tienen permisos administrativos

export async function checkVenuePermission(
  userId: string,
  _venueId: string,
  _permission: keyof VenueAdminPermissions
): Promise<boolean> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single<{ role: string }>()

  // En una sola sede, tanto super_admin como venue_admin tienen todos los permisos
  return isSuperAdmin(profile?.role) || isVenueAdmin(profile?.role)
}

export async function getVenuePermissions(
  userId: string,
  _venueId: string
): Promise<VenueAdminPermissions | null> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single<{ role: string }>()

  // Si es admin (super_admin o venue_admin), tiene todos los permisos
  if (isSuperAdmin(profile?.role) || isVenueAdmin(profile?.role)) {
    return {
      can_manage_bookings: true,
      can_manage_courts: true,
      can_manage_staff: true,
      can_view_reports: true,
      can_manage_pricing: true,
      can_cancel_bookings: true,
    }
  }

  return null
}

export async function getUserVenues(userId: string): Promise<Array<{ id: string; name: string }>> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single<{ role: string }>()

  // En una sola sede, los admins pueden ver la única sede activa
  if (isSuperAdmin(profile?.role) || isVenueAdmin(profile?.role)) {
    const { data: venues } = await supabase.from('venues').select('id, name').eq('is_active', true)
    return venues || []
  }

  return []
}

export type UserRole = 'user' | 'venue_admin' | 'super_admin' | 'venue_staff'

export interface VenueAdminPermissions {
  can_manage_bookings: boolean
  can_manage_courts: boolean
  can_manage_staff: boolean
  can_view_reports: boolean
  can_manage_pricing: boolean
  can_cancel_bookings: boolean
}

export const DEFAULT_VENUE_ADMIN_PERMISSIONS: VenueAdminPermissions = {
  can_manage_bookings: true,
  can_manage_courts: true,
  can_manage_staff: true,
  can_view_reports: true,
  can_manage_pricing: true,
  can_cancel_bookings: true,
}

export const isAdmin = (role?: string | null) => role === 'venue_admin' || role === 'super_admin' || role === 'venue_staff'
export const isSuperAdmin = (role?: string | null) => role === 'super_admin'
export const isVenueAdmin = (role?: string | null) => role === 'venue_admin'
export const isStaff = (role?: string | null) => role === 'venue_staff'
export const isOwnerOrSuperAdmin = (role?: string | null) => role === 'venue_admin' || role === 'super_admin'

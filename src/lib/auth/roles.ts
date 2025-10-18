export type UserRole = 'customer' | 'venue_admin' | 'super_admin'

export const isAdmin = (role?: string | null) => role === 'venue_admin' || role === 'super_admin'
export const isSuperAdmin = (role?: string | null) => role === 'super_admin'

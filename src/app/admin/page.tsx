import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { isOwnerOrSuperAdmin } from '@/lib/auth/roles'
import { OwnerDashboard } from '@/components/admin/OwnerDashboard'
import { StaffDashboard } from '@/components/admin/StaffDashboard'

export default async function AdminHomePage() {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isOwner = isOwnerOrSuperAdmin(profile?.role)

  const [{ count: venuesCount }, { count: courtsCount }] = await Promise.all([
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('courts').select('*', { count: 'exact', head: true }),
  ])

  // Get today's bookings
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  
  const todayEnd = new Date()
  todayEnd.setHours(23,59,59,999)

  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('*, court:courts(name)')
    .gte('start_datetime', todayStart.toISOString())
    .lte('start_datetime', todayEnd.toISOString())
    .order('start_datetime', { ascending: true })

  // Calculate revenue (simplified sum from completed payments could go here)
  const totalRevenue = 0 // Placeholder until we sum from payments table

  return (
    <div className="animate-in fade-in duration-500">
      {isOwner ? (
        <OwnerDashboard 
           venuesCount={venuesCount} 
           courtsCount={courtsCount} 
           totalRevenue={totalRevenue} 
           activeBookings={todayBookings?.length || 0} 
        />
      ) : (
        <StaffDashboard 
           todayBookings={todayBookings || []} 
        />
      )}
    </div>
  )
}

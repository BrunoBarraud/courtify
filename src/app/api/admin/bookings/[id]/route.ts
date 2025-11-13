import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'
import { isAdmin, isSuperAdmin } from '@/lib/auth/roles'

type BookingDetailRow = {
  id: string
  booking_number: string
  status: string
  start_datetime: string
  end_datetime: string
  total_amount: number
  discount_amount: number
  final_amount: number
  notes: string | null
  metadata: Record<string, unknown> | null
  court?: {
    id: string
    name: string
    venue_id: string
    venue?: {
      id: string
      name: string | null
    } | null
  } | null
  user?: {
    id: string
    full_name: string | null
    email: string | null
    phone: string | null
  } | null
  payments?: Array<{
    id: string
    payment_number: string
    payment_status: string
    payment_method: string | null
    amount: number
    currency: string
    created_at: string
    metadata: Record<string, unknown> | null
  }> | null
  participants?: Array<{
    id: string
    name: string
    email: string | null
    phone: string | null
  }> | null
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile || !isAdmin(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    let allowedVenueIds: string[] = []

    if (isSuperAdmin(profile.role)) {
      const { data: venues, error } = await adminClient.from('venues').select('id').eq('is_active', true)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      allowedVenueIds = (venues ?? []).map(v => v.id)
    } else {
      const { data: assignments, error } = await adminClient
        .from('venue_admins')
        .select('venue_id')
        .eq('user_id', userId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      allowedVenueIds = (assignments ?? []).map(a => a.venue_id)
    }

    allowedVenueIds = Array.from(new Set(allowedVenueIds))

    if (allowedVenueIds.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select(
        `
        id,
        booking_number,
        status,
        start_datetime,
        end_datetime,
        total_amount,
        discount_amount,
        final_amount,
        notes,
        metadata,
        court:courts(id, name, venue_id, venue:venues(id, name)),
        user:profiles!bookings_user_id_fkey(id, full_name, email, phone),
        payments:payments(id, payment_number, payment_status, payment_method, amount, currency, created_at, metadata),
        participants:booking_participants(id, name, email, phone)
      `
      )
      .eq('id', params.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const row = booking as unknown as BookingDetailRow
    const venueId = row.court?.venue_id

    if (!venueId || !allowedVenueIds.includes(venueId)) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const payments = Array.isArray(row.payments) ? row.payments : []
    const participants = Array.isArray(row.participants) ? row.participants : []
    const latestPayment = payments
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null

    return NextResponse.json({
      booking: {
        id: row.id,
        bookingNumber: row.booking_number,
        status: row.status,
        startDatetime: row.start_datetime,
        endDatetime: row.end_datetime,
        totalAmount: row.total_amount,
        discountAmount: row.discount_amount,
        finalAmount: row.final_amount,
        notes: row.notes,
        metadata: row.metadata,
        venue: row.court?.venue
          ? {
              id: row.court.venue.id,
              name: row.court.venue.name,
            }
          : venueId
          ? { id: venueId, name: null }
          : null,
        court: row.court
          ? {
              id: row.court.id,
              name: row.court.name,
            }
          : null,
        customer: row.user
          ? {
              id: row.user.id,
              fullName: row.user.full_name,
              email: row.user.email,
              phone: row.user.phone,
            }
          : null,
        payments,
        participants,
        latestPayment,
      },
    })
  } catch (error) {
    console.error('Admin booking detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

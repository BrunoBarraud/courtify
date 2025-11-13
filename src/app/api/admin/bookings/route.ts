import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'
import { isAdmin, isSuperAdmin } from '@/lib/auth/roles'

const clampNumber = (value: number, { min, max }: { min?: number; max?: number }) => {
  let result = value
  if (typeof min === 'number') {
    result = Math.max(min, result)
  }
  if (typeof max === 'number') {
    result = Math.min(max, result)
  }
  return result
}

const parseNumberParam = (param: string | null, fallback: number, opts: { min?: number; max?: number } = {}) => {
  if (!param) return fallback
  const parsed = Number.parseInt(param, 10)
  if (Number.isNaN(parsed)) return fallback
  return clampNumber(parsed, opts)
}

type VenueRow = {
  id: string
  name: string | null
}

type CourtRow = {
  id: string
  venue_id: string
}

type RawBookingRow = {
  id: string
  booking_number: string
  status: string
  start_datetime: string
  end_datetime: string
  total_amount: number
  final_amount: number
  user?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  court?: {
    id: string
    name: string
    venue_id: string
    venue?: {
      id: string
      name: string | null
    } | null
  } | null
  payments?: Array<{
    id: string
    payment_status: string
    amount: number
    payment_method: string | null
    created_at: string
  }> | null
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseNumberParam(searchParams.get('limit'), 20, { min: 1, max: 100 })
    const offset = parseNumberParam(searchParams.get('offset'), 0, { min: 0 })
    const status = searchParams.get('status') ?? undefined
    const paymentStatus = searchParams.get('paymentStatus') ?? undefined
    const venueIdFilter = searchParams.get('venueId') ?? undefined
    const search = searchParams.get('search') ?? undefined

    const adminClient = createAdminClient()

    let allowedVenueIds: string[] = []

    if (isSuperAdmin(profile.role)) {
      if (venueIdFilter) {
        allowedVenueIds = [venueIdFilter]
      } else {
        const { data: venues, error: venuesError } = await adminClient
          .from('venues')
          .select('id')
          .eq('is_active', true)

        if (venuesError) {
          return NextResponse.json({ error: venuesError.message }, { status: 400 })
        }

        allowedVenueIds = (venues ?? []).map(v => v.id)
      }
    } else {
      const { data: assignments, error: assignmentsError } = await adminClient
        .from('venue_admins')
        .select('venue_id')
        .eq('user_id', userId)

      if (assignmentsError) {
        return NextResponse.json({ error: assignmentsError.message }, { status: 400 })
      }

      allowedVenueIds = (assignments ?? []).map(a => a.venue_id)

      if (venueIdFilter) {
        allowedVenueIds = allowedVenueIds.filter(id => id === venueIdFilter)
      }
    }

    allowedVenueIds = Array.from(new Set(allowedVenueIds))

    if (allowedVenueIds.length === 0) {
      return NextResponse.json({ bookings: [], total: 0, venues: [] })
    }

    const { data: courts, error: courtsError } = await adminClient
      .from('courts')
      .select('id, venue_id')
      .in('venue_id', allowedVenueIds)

    if (courtsError) {
      return NextResponse.json({ error: courtsError.message }, { status: 400 })
    }

    const courtIds = (courts as CourtRow[] | null)?.map(c => c.id) ?? []

    if (courtIds.length === 0) {
      return NextResponse.json({ bookings: [], total: 0, venues: [] })
    }

    let query = adminClient
      .from('bookings')
      .select(
        `
        id,
        booking_number,
        status,
        start_datetime,
        end_datetime,
        total_amount,
        final_amount,
        user:profiles!bookings_user_id_fkey(id, full_name, email),
        court:courts(id, name, venue_id, venue:venues(id, name)),
        payments:payments(id, payment_status, amount, payment_method, created_at)
      `,
        { count: 'exact' }
      )
      .in('court_id', courtIds)
      .order('start_datetime', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (paymentStatus) {
      query = query.eq('payments.payment_status', paymentStatus)
    }

    if (search) {
      query = query.ilike('booking_number', `%${search}%`)
    }

    const { data: bookings, error: bookingsError, count } = await query.range(offset, offset + limit - 1)

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 400 })
    }

    const rawRows = (bookings ?? []) as unknown as RawBookingRow[]

    const normalized = rawRows.map(row => {
      const payments = Array.isArray(row.payments) ? row.payments : []
      const latestPayment = payments
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null

      return {
        id: row.id,
        bookingNumber: row.booking_number,
        status: row.status,
        startDatetime: row.start_datetime,
        endDatetime: row.end_datetime,
        totalAmount: row.total_amount,
        finalAmount: row.final_amount,
        venueId: row.court?.venue_id ?? null,
        venueName: row.court?.venue?.name ?? null,
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
            }
          : null,
        payments,
        latestPayment,
      }
    }) ?? []

    const { data: venuesInfo } = await adminClient
      .from('venues')
      .select('id, name')
      .in('id', allowedVenueIds)

    return NextResponse.json({
      bookings: normalized,
      total: typeof count === 'number' ? count : normalized.length,
      venues: (venuesInfo as VenueRow[] | null)?.map(v => ({ id: v.id, name: v.name })) ?? [],
    })
  } catch (error) {
    console.error('Admin bookings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

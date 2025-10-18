/**
 * Bookings API Routes
 * POST /api/bookings - Create a new booking
 * GET /api/bookings - Get user bookings
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { bookingService } from '@/lib/services/BookingService'
import { createBookingSchema } from '@/lib/validations/booking'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createBookingSchema.parse(body)

    // Create booking
    const booking = await bookingService.createBooking({
      ...validatedData,
      userId: session.user.id,
    })

    const checkoutUrl = `/payments/checkout?bookingId=${booking.id}`
    return NextResponse.json({ booking, checkoutUrl }, { status: 201 })
  } catch (error) {
    console.error('Booking creation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    // Get bookings
    const bookings = await bookingService.getUserBookings(session.user.id, status)

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

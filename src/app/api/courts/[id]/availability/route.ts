/**
 * Court Availability API Route
 * GET /api/courts/[id]/availability - Check court availability
 */

import { NextRequest, NextResponse } from 'next/server'
import { bookingService } from '@/lib/services/BookingService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const availability = await bookingService.checkAvailability(params.id, date)

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Failed to check availability:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

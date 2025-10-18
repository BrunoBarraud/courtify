/**
 * Cancel Booking API Route
 * POST /api/bookings/[id]/cancel - Cancel a booking
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { bookingService } from '@/lib/services/BookingService'
import { paymentService } from '@/lib/services/payment/PaymentService'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Calculate refund amount
    const refundAmount = await paymentService.calculateRefundAmount(params.id)

    // Cancel booking
    await bookingService.cancelBooking(params.id, session.user.id, reason)

    // Process refund if applicable
    if (refundAmount > 0) {
      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', params.id)
        .eq('payment_status', 'completed')
        .single()

      if (payment) {
        await paymentService.refundPayment(
          payment.payment_method,
          payment.external_payment_id,
          refundAmount
        )
      }
    }

    return NextResponse.json({
      success: true,
      refundAmount,
      message: refundAmount > 0 
        ? `Booking cancelled. Refund of ${refundAmount} will be processed.`
        : 'Booking cancelled. No refund applicable.',
    })
  } catch (error) {
    console.error('Booking cancellation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

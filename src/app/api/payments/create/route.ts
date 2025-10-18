/**
 * Create Payment API Route
 * POST /api/payments/create - Create a payment intent
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { paymentService } from '@/lib/services/payment/PaymentService'
import { StripePaymentStrategy } from '@/lib/services/payment/StripePaymentStrategy'
import { MercadoPagoPaymentStrategy } from '@/lib/services/payment/MercadoPagoPaymentStrategy'

// Register payment strategies
paymentService.registerStrategy('stripe', new StripePaymentStrategy())
paymentService.registerStrategy('mercadopago', new MercadoPagoPaymentStrategy())

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, subscriptionId, paymentMethod, currency = 'ARS' } = body

    if (!bookingId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Either bookingId or subscriptionId is required' },
        { status: 400 }
      )
    }

    if (!['stripe', 'mercadopago'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Get amount from booking or subscription
    let amount = 0
    
    if (bookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('final_amount')
        .eq('id', bookingId)
        .single()

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      amount = booking.final_amount
    } else if (subscriptionId) {
      const { data: subscription } = await supabase
        .from('subscription_plans')
        .select('price')
        .eq('id', subscriptionId)
        .single()

      if (!subscription) {
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 404 }
        )
      }

      amount = subscription.price
    }

    // Create payment
    const result = await paymentService.createPayment(paymentMethod, {
      amount,
      currency,
      userId: session.user.id,
      bookingId,
      subscriptionId,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment creation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Payment creation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

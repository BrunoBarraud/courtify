/**
 * Create Payment API Route
 * POST /api/payments/create - Create a payment intent
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { paymentService } from '@/lib/services/payment/PaymentService'
import { MercadoPagoPaymentStrategy } from '@/lib/services/payment/MercadoPagoPaymentStrategy'
import { notificationService } from '@/lib/services/notification/NotificationService'

// Register payment strategies
paymentService.registerStrategy('mercadopago', new MercadoPagoPaymentStrategy())

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, subscriptionId, paymentMethod, currency = 'ARS' } = body

    // Read Idempotency-Key from header or body
    const idempotencyKey = request.headers.get('Idempotency-Key') || body.idempotencyKey

    if (!bookingId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Either bookingId or subscriptionId is required' },
        { status: 400 }
      )
    }

    if (!['mercadopago'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
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
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      amount = booking.final_amount
    } else if (subscriptionId) {
      const { data: subscription } = await supabase
        .from('subscription_plans')
        .select('price')
        .eq('id', subscriptionId)
        .single()

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 })
      }

      amount = subscription.price
    }

    // If idempotencyKey provided, check if a previous payment exists
    if (idempotencyKey) {
      const { data: existing } = await createServerClient(() => cookies())
        .from('payments')
        .select(
          'external_payment_id, payment_status, amount, currency, booking_id, subscription_id, payment_number, metadata'
        )
        .eq('user_id', session.user.id)
        .eq('metadata->>idempotencyKey', idempotencyKey)
        .order('created_at', { ascending: false })
        .limit(1)

      const existingPayment = existing?.[0]
      if (existingPayment) {
        return NextResponse.json({
          success: true,
          paymentId: existingPayment.external_payment_id,
          externalPaymentId: existingPayment.external_payment_id,
          status: existingPayment.payment_status,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          bookingId: existingPayment.booking_id,
          subscriptionId: existingPayment.subscription_id,
          paymentNumber: existingPayment.payment_number,
        })
      }
    }

    // Create payment
    const result = await paymentService.createPayment(paymentMethod, {
      amount,
      currency,
      userId: session.user.id,
      bookingId,
      subscriptionId,
      metadata: idempotencyKey ? { idempotencyKey } : undefined,
    })

    if (!result.success) {
      // Notificación de error de pago para el jugador
      await notificationService.sendPaymentError({
        userId: session.user.id,
        amount,
        currency,
        bookingNumber: undefined,
      })

      return NextResponse.json(
        { error: result.error || 'Payment creation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Payment creation error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

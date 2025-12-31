/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/client'
import { notificationService } from '@/lib/services/notification/NotificationService'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Deduplicate events (idempotency)
    const { error: insertError } = await supabase
      .from('payment_events')
      .insert({ provider: 'stripe', event_id: event.id })

    if (insertError) {
      // 23505 = unique_violation
      if ((insertError as any).code === '23505') {
        return NextResponse.json({ received: true, duplicate: true }, { status: 409 })
      }
      console.error('Failed to record webhook event:', insertError)
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status
        const { data: payment } = await supabase
          .from('payments')
          .update({ payment_status: 'completed' })
          .eq('external_payment_id', paymentIntent.id)
          .select()
          .single()

        if (payment) {
          // Update booking status if applicable
          if (payment.booking_id) {
            await supabase
              .from('bookings')
              .update({ status: 'confirmed' })
              .eq('id', payment.booking_id)

            // Get booking details for notification
            const { data: booking } = await supabase
              .from('bookings')
              .select(
                `
                *,
                court:courts(*, venue:venues(*))
              `
              )
              .eq('id', payment.booking_id)
              .single()

            if (booking) {
              // Send payment confirmation
              await notificationService.sendPaymentConfirmation({
                userId: payment.user_id,
                paymentNumber: payment.payment_number,
                amount: payment.amount,
                currency: payment.currency,
                bookingNumber: booking.booking_number,
              })
            }
          }

          // Update subscription status if applicable
          if (payment.subscription_id) {
            const { data: userSub } = await supabase
              .from('user_subscriptions')
              .update({ status: 'active' })
              .eq('id', payment.subscription_id)
              .select('id, user_id, plan_id')
              .single()

            if (userSub?.plan_id) {
              const { data: plan } = await supabase
                .from('subscription_plans')
                .select('name')
                .eq('id', userSub.plan_id)
                .single()

              await notificationService.sendSubscriptionUpdate({
                userId: userSub.user_id,
                action: 'purchased',
                planName: plan?.name || 'abono',
              })
            }
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status
        const { data: payment } = await supabase
          .from('payments')
          .update({
            payment_status: 'failed',
            external_payment_data: { error: paymentIntent.last_payment_error },
          })
          .eq('external_payment_id', paymentIntent.id)
          .select('user_id, amount, currency, booking_id')
          .single()

        if (payment) {
          await notificationService.sendPaymentError({
            userId: payment.user_id,
            amount: payment.amount,
            currency: payment.currency,
          })
        }

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        // Update payment status
        await supabase
          .from('payments')
          .update({
            payment_status: 'refunded',
            refund_amount: charge.amount_refunded / 100,
            refunded_at: new Date().toISOString(),
          })
          .eq('external_payment_id', charge.payment_intent as string)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

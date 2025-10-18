/**
 * Stripe Payment Strategy
 * Concrete implementation of PaymentStrategy for Stripe
 */

import Stripe from 'stripe'
import {
  PaymentStrategy,
  PaymentData,
  PaymentResult,
  PaymentStatus,
} from './PaymentService'

export class StripePaymentStrategy implements PaymentStrategy {
  private stripe: Stripe

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10',
    })
  }

  async createPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        metadata: {
          userId: data.userId,
          bookingId: data.bookingId || '',
          subscriptionId: data.subscriptionId || '',
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        paymentId: paymentIntent.id,
        externalPaymentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        clientSecret: paymentIntent.client_secret || undefined,
      }
    } catch (error) {
      console.error('Stripe payment creation failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId)

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        externalPaymentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
      }
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      })

      return {
        success: refund.status === 'succeeded',
        paymentId: refund.id,
        externalPaymentId: refund.payment_intent as string,
        status: refund.status === 'succeeded' ? 'refunded' : 'processing',
      }
    } catch (error) {
      console.error('Stripe refund failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId)
      return this.mapStripeStatus(paymentIntent.status)
    } catch (error) {
      console.error('Failed to get Stripe payment status:', error)
      return 'failed'
    }
  }

  /**
   * Map Stripe payment status to our internal status
   */
  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: 'pending',
      requires_confirmation: 'pending',
      requires_action: 'pending',
      processing: 'processing',
      succeeded: 'completed',
      canceled: 'failed',
    }

    return statusMap[stripeStatus] || 'failed'
  }

  /**
   * Create a checkout session (for redirect-based flow)
   */
  async createCheckoutSession(data: PaymentData & {
    successUrl: string
    cancelUrl: string
  }): Promise<PaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: 'Court Booking',
                description: `Booking ID: ${data.bookingId}`,
              },
              unit_amount: Math.round(data.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
          bookingId: data.bookingId || '',
          subscriptionId: data.subscriptionId || '',
        },
      })

      return {
        success: true,
        paymentId: session.id,
        externalPaymentId: session.id,
        status: 'pending',
        checkoutUrl: session.url || undefined,
      }
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

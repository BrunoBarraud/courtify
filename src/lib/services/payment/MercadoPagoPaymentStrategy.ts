/**
 * MercadoPago Payment Strategy
 * Concrete implementation of PaymentStrategy for MercadoPago
 */

import mercadopago from 'mercadopago'
import {
  PaymentStrategy,
  PaymentData,
  PaymentResult,
  PaymentStatus,
} from './PaymentService'

export class MercadoPagoPaymentStrategy implements PaymentStrategy {
  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured')
    }
    
    mercadopago.configure({
      access_token: accessToken,
    })
  }

  async createPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const preference = await mercadopago.preferences.create({
        items: [
          {
            title: 'Court Booking',
            description: `Booking ID: ${data.bookingId}`,
            quantity: 1,
            currency_id: data.currency,
            unit_price: data.amount,
          },
        ],
        metadata: {
          user_id: data.userId,
          booking_id: data.bookingId || '',
          subscription_id: data.subscriptionId || '',
          ...data.metadata,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
        },
        auto_return: 'approved',
      })

      return {
        success: true,
        paymentId: preference.body.id,
        externalPaymentId: preference.body.id,
        status: 'pending',
        checkoutUrl: preference.body.init_point,
      }
    } catch (error) {
      console.error('MercadoPago payment creation failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const payment = await mercadopago.payment.get(paymentId)

      return {
        success: payment.body.status === 'approved',
        paymentId: payment.body.id.toString(),
        externalPaymentId: payment.body.id.toString(),
        status: this.mapMercadoPagoStatus(payment.body.status),
      }
    } catch (error) {
      console.error('MercadoPago payment confirmation failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const refund = await mercadopago.refund.create({
        payment_id: parseInt(paymentId),
        amount: amount,
      })

      return {
        success: refund.status === 200,
        paymentId: refund.body.id.toString(),
        externalPaymentId: paymentId,
        status: 'refunded',
      }
    } catch (error) {
      console.error('MercadoPago refund failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const payment = await mercadopago.payment.get(paymentId)
      return this.mapMercadoPagoStatus(payment.body.status)
    } catch (error) {
      console.error('Failed to get MercadoPago payment status:', error)
      return 'failed'
    }
  }

  /**
   * Map MercadoPago payment status to our internal status
   */
  private mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: 'pending',
      approved: 'completed',
      authorized: 'completed',
      in_process: 'processing',
      in_mediation: 'processing',
      rejected: 'failed',
      cancelled: 'failed',
      refunded: 'refunded',
      charged_back: 'refunded',
    }

    return statusMap[mpStatus] || 'failed'
  }
}

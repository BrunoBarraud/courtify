/**
 * MercadoPago Payment Strategy
 * Concrete implementation of PaymentStrategy for MercadoPago
 */
import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago'
import {
  PaymentStrategy,
  PaymentData,
  PaymentResult,
  PaymentStatus,
} from './PaymentService'

export class MercadoPagoPaymentStrategy implements PaymentStrategy {
  constructor() {}

  private getClient(config?: Record<string, any>): MercadoPagoConfig | null {
    const accessToken = config?.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) return null
    return new MercadoPagoConfig({ accessToken })
  }

  async createPayment(data: PaymentData, config?: Record<string, any>): Promise<PaymentResult> {
    try {
      const client = this.getClient(config)
      if (!client) {
        return {
          success: false,
          status: 'failed',
          error: 'MercadoPago is not configured. Set MERCADOPAGO_ACCESS_TOKEN in .env.',
        }
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const isPublicAppUrl = /^https?:\/\//.test(appUrl) && !/localhost|127\.0\.0\.1/i.test(appUrl)
      const preference = new Preference(client)
      const prefRes: any = await preference.create({
        body: {
          items: [
            {
              id: String(data.bookingId || data.subscriptionId || 'court_booking'),
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
            ...(data.metadata || {}),
          },
          back_urls: {
            success: `${appUrl}/payments/success`,
            failure: `${appUrl}/payments/failure`,
            pending: `${appUrl}/payments/pending`,
          },
          ...(isPublicAppUrl ? { auto_return: 'approved' as const } : {}),
        },
      })

      const prefId = (prefRes?.id ?? prefRes?.body?.id) as string | undefined
      const initPoint = (prefRes?.init_point ?? prefRes?.sandbox_init_point ?? prefRes?.body?.init_point) as string | undefined

      return {
        success: true,
        paymentId: prefId || '',
        externalPaymentId: prefId || '',
        status: 'pending',
        checkoutUrl: initPoint || '',
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

  async confirmPayment(paymentId: string, config?: Record<string, any>): Promise<PaymentResult> {
    try {
      const client = this.getClient(config)
      if (!client) return { success: false, status: 'failed', error: 'MercadoPago is not configured.' }
      const paymentApi = new MPPayment(client)
      const payment = await paymentApi.get({ id: paymentId })

      return {
        success: payment.status === 'approved',
        paymentId: String(payment.id),
        externalPaymentId: String(payment.id),
        status: this.mapMercadoPagoStatus(payment.status ?? 'failed'),
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

  async refundPayment(paymentId: string, amount?: number, config?: Record<string, any>): Promise<PaymentResult> {
    try {
      const client = this.getClient(config)
      if (!client) return { success: false, status: 'failed', error: 'MercadoPago is not configured.' }
      const mod: any = await import('mercadopago')
      const refundApi = new mod.Refund(client as any)
      const refund: any = await refundApi.create({ payment_id: Number(paymentId), amount })

      return {
        success: true,
        paymentId: String(refund.id ?? paymentId),
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

  async getPaymentStatus(paymentId: string, config?: Record<string, any>): Promise<PaymentStatus> {
    try {
      const client = this.getClient(config)
      if (!client) return 'failed'
      const paymentApi = new MPPayment(client)
      const payment = await paymentApi.get({ id: paymentId })
      return this.mapMercadoPagoStatus(payment.status ?? 'failed')
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

/**
 * Payment Service - Strategy Pattern Implementation
 * Manages payment processing with multiple payment gateways
 */

import { createAdminClient } from '@/lib/supabase/client'

// Strategy Pattern: Payment strategy interface
export interface PaymentStrategy {
  createPayment(data: PaymentData): Promise<PaymentResult>
  confirmPayment(paymentId: string): Promise<PaymentResult>
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResult>
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>
}

// Payment data structure
export interface PaymentData {
  amount: number
  currency: string
  userId: string
  bookingId?: string
  subscriptionId?: string
  metadata?: Record<string, any>
}

// Payment result
export interface PaymentResult {
  success: boolean
  paymentId?: string
  externalPaymentId?: string
  status: PaymentStatus
  error?: string
  clientSecret?: string // For client-side confirmation
  checkoutUrl?: string // For redirect-based payments
}

// Payment status
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

// Strategy Pattern: Context
export class PaymentService {
  private strategies: Map<string, PaymentStrategy> = new Map()
  private supabase = createAdminClient()

  /**
   * Register a payment strategy
   */
  registerStrategy(name: string, strategy: PaymentStrategy): void {
    this.strategies.set(name, strategy)
  }

  /**
   * Create a payment using the specified strategy
   */
  async createPayment(
    method: string,
    data: PaymentData
  ): Promise<PaymentResult> {
    const strategy = this.strategies.get(method)
    
    if (!strategy) {
      throw new Error(`Payment method ${method} not supported`)
    }

    try {
      // Create payment through strategy
      const result = await strategy.createPayment(data)

      // Store payment in database
      if (result.success) {
        await this.storePayment({
          ...data,
          method,
          externalPaymentId: result.externalPaymentId,
          status: result.status,
        })
      }

      return result
    } catch (error) {
      console.error('Payment creation failed:', error)
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(
    method: string,
    paymentId: string
  ): Promise<PaymentResult> {
    const strategy = this.strategies.get(method)
    
    if (!strategy) {
      throw new Error(`Payment method ${method} not supported`)
    }

    const result = await strategy.confirmPayment(paymentId)

    // Update payment status in database
    if (result.success) {
      await this.updatePaymentStatus(paymentId, result.status)
    }

    return result
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    method: string,
    paymentId: string,
    amount?: number
  ): Promise<PaymentResult> {
    const strategy = this.strategies.get(method)
    
    if (!strategy) {
      throw new Error(`Payment method ${method} not supported`)
    }

    const result = await strategy.refundPayment(paymentId, amount)

    // Update payment in database
    if (result.success) {
      await this.supabase
        .from('payments')
        .update({
          payment_status: 'refunded',
          refund_amount: amount || 0,
          refunded_at: new Date().toISOString(),
        } as any)
        .eq('external_payment_id', paymentId)
    }

    return result
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    method: string,
    paymentId: string
  ): Promise<PaymentStatus> {
    const strategy = this.strategies.get(method)
    
    if (!strategy) {
      throw new Error(`Payment method ${method} not supported`)
    }

    return strategy.getPaymentStatus(paymentId)
  }

  /**
   * Store payment in database
   */
  private async storePayment(data: {
    amount: number
    currency: string
    userId: string
    bookingId?: string
    subscriptionId?: string
    method: string
    externalPaymentId?: string
    status: PaymentStatus
    metadata?: Record<string, any>
  }): Promise<void> {
    const { error } = await this.supabase.from('payments').insert({
      user_id: data.userId,
      booking_id: data.bookingId || null,
      subscription_id: data.subscriptionId || null,
      amount: data.amount,
      currency: data.currency,
      payment_method: data.method as any,
      payment_status: data.status as any,
      external_payment_id: data.externalPaymentId || null,
      metadata: data.metadata || {},
    } as any)

    if (error) {
      console.error('Failed to store payment:', error)
      throw error
    }
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(
    externalPaymentId: string,
    status: PaymentStatus
  ): Promise<void> {
    const { error } = await this.supabase
      .from('payments')
      .update({ payment_status: status as any } as any)
      .eq('external_payment_id', externalPaymentId)

    if (error) {
      console.error('Failed to update payment status:', error)
    }
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  async calculateRefundAmount(bookingId: string): Promise<number> {
    // Get booking details
    const { data: booking } = await this.supabase
      .from('bookings')
      .select(`
        *,
        court:courts(venue_id)
      `)
      .eq('id', bookingId)
      .single()

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Get venue's cancellation policy
    const { data: policy } = await this.supabase
      .from('cancellation_policies')
      .select('rules')
      .eq('venue_id', (booking as any).court.venue_id)
      .eq('is_default', true)
      .single()

    if (!policy) {
      return 0 // No refund if no policy
    }

    // Calculate hours until booking
    const now = new Date()
    const bookingStart = new Date((booking as any).start_datetime)
    const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Find applicable refund percentage
    const rules = (policy as any).rules as Array<{ hours_before: number; refund_percentage: number }>
    const sortedRules = rules.sort((a, b) => b.hours_before - a.hours_before)

    let refundPercentage = 0
    for (const rule of sortedRules) {
      if (hoursUntilBooking >= rule.hours_before) {
        refundPercentage = rule.refund_percentage
        break
      }
    }

    return ((booking as any).final_amount * refundPercentage) / 100
  }
}

// Singleton instance
export const paymentService = new PaymentService()

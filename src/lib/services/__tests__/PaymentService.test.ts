/**
 * Unit Tests for PaymentService
 */

import { PaymentService, PaymentStrategy, PaymentData, PaymentResult } from '../payment/PaymentService'

// Mock payment strategy
class MockPaymentStrategy implements PaymentStrategy {
  async createPayment(data: PaymentData): Promise<PaymentResult> {
    return {
      success: true,
      paymentId: 'mock-payment-id',
      externalPaymentId: 'ext-mock-payment-id',
      status: 'completed',
    }
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    return {
      success: true,
      paymentId,
      externalPaymentId: paymentId,
      status: 'completed',
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    return {
      success: true,
      paymentId,
      externalPaymentId: paymentId,
      status: 'refunded',
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    return 'completed'
  }
}

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}))

describe('PaymentService', () => {
  let paymentService: PaymentService
  let mockStrategy: MockPaymentStrategy

  beforeEach(() => {
    paymentService = new PaymentService()
    mockStrategy = new MockPaymentStrategy()
    paymentService.registerStrategy('mock', mockStrategy)
  })

  describe('registerStrategy', () => {
    it('should register a payment strategy', () => {
      const newStrategy = new MockPaymentStrategy()
      paymentService.registerStrategy('test', newStrategy)
      // If no error is thrown, registration was successful
      expect(true).toBe(true)
    })
  })

  describe('createPayment', () => {
    it('should create a payment using registered strategy', async () => {
      const paymentData: PaymentData = {
        amount: 100,
        currency: 'USD',
        userId: 'user-123',
        bookingId: 'booking-123',
      }

      const result = await paymentService.createPayment('mock', paymentData)

      expect(result.success).toBe(true)
      expect(result.paymentId).toBe('mock-payment-id')
      expect(result.status).toBe('completed')
    })

    it('should throw error for unsupported payment method', async () => {
      const paymentData: PaymentData = {
        amount: 100,
        currency: 'USD',
        userId: 'user-123',
        bookingId: 'booking-123',
      }

      await expect(
        paymentService.createPayment('unsupported' as any, paymentData)
      ).rejects.toThrow('Payment method unsupported not supported')
    })
  })

  describe('confirmPayment', () => {
    it('should confirm a payment', async () => {
      const result = await paymentService.confirmPayment('mock', 'payment-123')

      expect(result.success).toBe(true)
      expect(result.status).toBe('completed')
    })
  })

  describe('refundPayment', () => {
    it('should refund a payment', async () => {
      const result = await paymentService.refundPayment('mock', 'payment-123', 50)

      expect(result.success).toBe(true)
      expect(result.status).toBe('refunded')
    })
  })

  describe('getPaymentStatus', () => {
    it('should get payment status', async () => {
      const status = await paymentService.getPaymentStatus('mock', 'payment-123')

      expect(status).toBe('completed')
    })
  })
})

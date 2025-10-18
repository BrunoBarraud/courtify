/**
 * Unit Tests for BookingService
 */

import { BookingService } from '../BookingService'
import { createAdminClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createAdminClient: jest.fn(),
}))

// Mock notification service
jest.mock('../notification/NotificationService', () => ({
  notificationService: {
    sendBookingConfirmation: jest.fn(),
    sendCancellationNotification: jest.fn(),
    notify: jest.fn(),
  },
}))

describe('BookingService', () => {
  let bookingService: BookingService
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    ;(createAdminClient as jest.Mock).mockReturnValue(mockSupabase)
    bookingService = new BookingService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('checkAvailability', () => {
    it('should return availability for a given court and date', async () => {
      const courtId = 'test-court-id'
      const date = '2025-01-15'

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: courtId,
          name: 'Court 1',
          hourly_rate: 50,
          venue: { name: 'Test Venue' },
        },
        error: null,
      })

      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const result = await bookingService.checkAvailability(courtId, date)

      expect(result).toHaveProperty('available')
      expect(result).toHaveProperty('slots')
      expect(Array.isArray(result.slots)).toBe(true)
    })

    it('should throw error if court not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      await expect(
        bookingService.checkAvailability('invalid-id', '2025-01-15')
      ).rejects.toThrow('Court not found')
    })
  })

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        courtId: 'test-court-id',
        userId: 'test-user-id',
        startDatetime: '2025-01-15T10:00:00Z',
        endDatetime: '2025-01-15T11:00:00Z',
      }

      // Mock no conflicts
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Mock court data
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: bookingData.courtId,
          name: 'Court 1',
          hourly_rate: 50,
          court_type: 'tennis',
          venue: { name: 'Test Venue' },
        },
        error: null,
      })

      // Mock booking creation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'new-booking-id',
          booking_number: 'BK-20250115-000001',
          ...bookingData,
          total_amount: 50,
          discount_amount: 0,
          final_amount: 50,
          status: 'pending',
        },
        error: null,
      })

      const result = await bookingService.createBooking(bookingData)

      expect(result).toHaveProperty('id')
      expect(result.booking_number).toBe('BK-20250115-000001')
    })

    it('should throw error if time slot conflicts', async () => {
      const bookingData = {
        courtId: 'test-court-id',
        userId: 'test-user-id',
        startDatetime: '2025-01-15T10:00:00Z',
        endDatetime: '2025-01-15T11:00:00Z',
      }

      // Mock conflict
      mockSupabase.select.mockResolvedValueOnce({
        data: [{ id: 'existing-booking' }],
        error: null,
      })

      await expect(
        bookingService.createBooking(bookingData)
      ).rejects.toThrow('Time slot is no longer available')
    })
  })

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      const bookingId = 'test-booking-id'
      const userId = 'test-user-id'
      const reason = 'Changed plans'

      // Mock booking data
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: bookingId,
          user_id: userId,
          status: 'confirmed',
          booking_number: 'BK-20250115-000001',
          court: {
            id: 'court-id',
            name: 'Court 1',
            venue: { name: 'Test Venue' },
          },
        },
        error: null,
      })

      // Mock update
      mockSupabase.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Mock waitlist query
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const result = await bookingService.cancelBooking(bookingId, userId, reason)

      expect(result).toEqual({ success: true })
    })

    it('should throw error if booking not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      await expect(
        bookingService.cancelBooking('invalid-id', 'user-id', 'reason')
      ).rejects.toThrow('Booking not found')
    })

    it('should throw error if user is not authorized', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'booking-id',
          user_id: 'different-user-id',
          status: 'confirmed',
        },
        error: null,
      })

      await expect(
        bookingService.cancelBooking('booking-id', 'user-id', 'reason')
      ).rejects.toThrow('Unauthorized')
    })
  })
})

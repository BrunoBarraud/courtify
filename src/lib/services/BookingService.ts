/**
 * Booking Service
 * Handles all booking-related business logic
 */

import { createAdminClient } from '@/lib/supabase/client'
import { notificationService } from './notification/NotificationService'
import { calculateDurationHours } from '@/lib/utils'

export class BookingService {
  private supabase = createAdminClient()

  /**
   * Check court availability for a specific date
   */
  async checkAvailability(
    courtId: string,
    date: string
  ): Promise<{
    available: boolean
    slots: Array<{ start: string; end: string; available: boolean; price: number }>
  }> {
    // Get court details
    const { data: court } = await this.supabase
      .from('courts')
      .select('*, venue:venues(*)')
      .eq('id', courtId)
      .single()

    if (!court) {
      throw new Error('Court not found')
    }

    // Get availability rules for the day (map JS getDay to our enum)
    const jsDay = new Date(date).getDay() // 0=Sunday..6=Saturday
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayMap[jsDay]
    const { data: rules } = await this.supabase
      .from('court_availability_rules')
      .select('*')
      .eq('court_id', courtId)
      .eq('day_of_week', dayOfWeek)

    // Get existing bookings for the date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('start_datetime, end_datetime')
      .eq('court_id', courtId)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('start_datetime', endOfDay.toISOString())
      .neq('status', 'cancelled')

    // Get blocked periods
    const { data: blockedPeriods } = await this.supabase
      .from('court_blocked_periods')
      .select('start_datetime, end_datetime')
      .eq('court_id', courtId)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('end_datetime', endOfDay.toISOString())

    // Generate time slots
    const slots = this.generateTimeSlots(
      rules || [],
      bookings || [],
      blockedPeriods || [],
      date,
      court.hourly_rate
    )

    return {
      available: slots.some(slot => slot.available),
      slots,
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(data: {
    courtId: string
    userId: string
    startDatetime: string
    endDatetime: string
    participants?: Array<{ name: string; email?: string; phone?: string }>
    notes?: string
    promotionCode?: string
  }) {
    // Validate booking doesn't conflict
    const hasConflict = await this.checkBookingConflict(
      data.courtId,
      data.startDatetime,
      data.endDatetime
    )

    if (hasConflict) {
      throw new Error('Time slot is no longer available')
    }

    // Get court and calculate price
    const { data: court } = await this.supabase
      .from('courts')
      .select('*, venue:venues(*)')
      .eq('id', data.courtId)
      .single()

    if (!court) {
      throw new Error('Court not found')
    }

    const duration = calculateDurationHours(data.startDatetime, data.endDatetime)
    const totalAmount = court.hourly_rate * duration
    let discountAmount = 0

    // Apply promotion if provided
    if (data.promotionCode) {
      const discount = await this.applyPromotion(
        data.promotionCode,
        totalAmount,
        data.userId,
        court.court_type
      )
      discountAmount = discount
    }

    const finalAmount = totalAmount - discountAmount

    // Create booking
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({
        court_id: data.courtId,
        user_id: data.userId,
        start_datetime: data.startDatetime,
        end_datetime: data.endDatetime,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        notes: data.notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create booking: ${error.message}`)
    }

    // Add participants if provided
    if (data.participants && data.participants.length > 0) {
      await this.supabase.from('booking_participants').insert(
        data.participants.map(p => ({
          booking_id: booking.id,
          ...p,
        }))
      )
    }

    // Send confirmation notification
    await notificationService.sendBookingConfirmation({
      userId: data.userId,
      bookingNumber: booking.booking_number,
      courtName: court.name,
      venueName: court.venue.name,
      startDatetime: data.startDatetime,
      endDatetime: data.endDatetime,
      totalAmount: finalAmount,
    })

    // Notify venue admins (non-blocking)
    ;(async () => {
      try {
        // Get admins for the venue
        const { data: admins } = await this.supabase
          .from('venue_admins')
          .select('user_id')
          .eq('venue_id', court.venue.id)

        if (admins && admins.length > 0) {
          await Promise.allSettled(
            admins.map(a =>
              notificationService.sendAdminBookingCreated({
                adminId: a.user_id,
                bookingId: booking.id,
                bookingNumber: booking.booking_number,
                courtId: court.id,
                courtName: court.name,
                venueId: court.venue.id,
                venueName: court.venue.name,
                startDatetime: data.startDatetime,
                endDatetime: data.endDatetime,
                userId: data.userId,
                status: booking.status,
                finalAmount: booking.final_amount,
              })
            )
          )
        }
      } catch (e) {
        // Best-effort: log and continue
        console.error('Failed to notify venue admins:', e)
      }
    })()

    return booking
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, userId: string, reason: string) {
    // Get booking
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('*, court:courts(*, venue:venues(*))')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.user_id !== userId) {
      throw new Error('Unauthorized')
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking already cancelled')
    }

    // Update booking status
    const { error } = await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
      })
      .eq('id', bookingId)

    if (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`)
    }

    // Send cancellation notification
    await notificationService.sendCancellationNotification({
      userId,
      bookingNumber: booking.booking_number,
      courtName: booking.court.name,
      venueName: booking.court.venue.name,
      startDatetime: booking.start_datetime,
    })

    // Notify venue admins about cancellation (non-blocking)
    ;(async () => {
      try {
        const venueId = booking.court.venue.id
        const { data: admins } = await this.supabase
          .from('venue_admins')
          .select('user_id')
          .eq('venue_id', venueId)

        if (admins && admins.length > 0) {
          await Promise.allSettled(
            admins.map(a =>
              notificationService.sendAdminBookingCancelled({
                adminId: a.user_id,
                bookingId: booking.id,
                bookingNumber: booking.booking_number,
                courtId: booking.court.id,
                courtName: booking.court.name,
                venueId: booking.court.venue.id,
                venueName: booking.court.venue.name,
                startDatetime: booking.start_datetime,
                endDatetime: booking.end_datetime,
                userId,
                finalAmount: booking.final_amount,
                reason,
              })
            )
          )
        }
      } catch (e) {
        console.error('Failed to notify venue admins about cancellation:', e)
      }
    })()

    // Notify waitlist users
    await this.notifyWaitlist(booking.court_id, booking.start_datetime, booking.end_datetime)

    return { success: true }
  }

  /**
   * Add user to waitlist
   */
  async addToWaitlist(data: {
    courtId: string
    userId: string
    preferredDate: string
    preferredStartTime: string
    preferredEndTime: string
  }) {
    const { error } = await this.supabase.from('waitlist').insert({
      court_id: data.courtId,
      user_id: data.userId,
      preferred_date: data.preferredDate,
      preferred_start_time: data.preferredStartTime,
      preferred_end_time: data.preferredEndTime,
      status: 'active',
    })

    if (error) {
      throw new Error(`Failed to add to waitlist: ${error.message}`)
    }

    return { success: true }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId: string, status?: string) {
    let query = this.supabase
      .from('bookings')
      .select(
        `
        *,
        court:courts(*, venue:venues(*)),
        payment:payments(*)
      `
      )
      .eq('user_id', userId)
      .order('start_datetime', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`)
    }

    return data
  }

  /**
   * Check if booking conflicts with existing bookings
   */
  private async checkBookingConflict(
    courtId: string,
    startDatetime: string,
    endDatetime: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('bookings')
      .select('id')
      .eq('court_id', courtId)
      .neq('status', 'cancelled')
      // Overlap if existing.start < new.end AND existing.end > new.start
      .lt('start_datetime', endDatetime)
      .gt('end_datetime', startDatetime)

    return (data?.length || 0) > 0
  }

  /**
   * Apply promotion code
   */
  private async applyPromotion(
    code: string,
    amount: number,
    _userId: string,
    _courtType: string
  ): Promise<number> {
    const { data: promotion } = await this.supabase
      .from('promotions')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (!promotion) {
      throw new Error('Invalid promotion code')
    }

    // Check if promotion is valid
    const now = new Date()
    if (new Date(promotion.start_date) > now || new Date(promotion.end_date) < now) {
      throw new Error('Promotion code expired')
    }

    // Check usage limits
    if (promotion.usage_limit) {
      const { count } = await this.supabase
        .from('promotion_usage')
        .select('*', { count: 'exact', head: true })
        .eq('promotion_id', promotion.id)

      if (count && count >= promotion.usage_limit) {
        throw new Error('Promotion code usage limit reached')
      }
    }

    // Calculate discount
    let discount = 0
    if (promotion.discount_type === 'percentage') {
      discount = (amount * promotion.discount_value) / 100
    } else {
      discount = promotion.discount_value
    }

    if (promotion.max_discount_amount) {
      discount = Math.min(discount, promotion.max_discount_amount)
    }

    return discount
  }

  /**
   * Generate time slots for a day
   */
  private generateTimeSlots(
    rules: Array<{
      start_time: string
      end_time: string
      is_available?: boolean
      price_override?: number
    }>,
    bookings: Array<{ start_datetime: string; end_datetime: string }>,
    blockedPeriods: Array<{ start_datetime: string; end_datetime: string }>,
    date: string,
    basePrice: number
  ) {
    const slots: Array<{ start: string; end: string; available: boolean; price: number }> = []

    const pushSlot = (start: Date, end: Date, price: number) => {
      const isBooked = bookings.some(
        b => new Date(b.start_datetime) < end && new Date(b.end_datetime) > start
      )
      const isBlocked = blockedPeriods.some(
        bp => new Date(bp.start_datetime) < end && new Date(bp.end_datetime) > start
      )
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        available: !isBooked && !isBlocked,
        price,
      })
    }

    const now = new Date()
    const sameDate = (d: Date) =>
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()

    if (rules && rules.length > 0) {
      // Build slots based on rules windows (hourly steps)
      for (const r of rules) {
        if (r.is_available === false) continue
        // Parse times "HH:MM"
        const [sHour, sMin] = String(r.start_time)
          .split(':')
          .map((x: string) => parseInt(x, 10))
        const [eHour, eMin] = String(r.end_time)
          .split(':')
          .map((x: string) => parseInt(x, 10))
        const startWin = new Date(date)
        startWin.setHours(sHour || 0, sMin || 0, 0, 0)
        const endWin = new Date(date)
        endWin.setHours(eHour || 0, eMin || 0, 0, 0)

        // Safeguard
        if (endWin <= startWin) continue

        // Generate hourly slots inside window
        const price = r.price_override ?? basePrice
        for (let t = new Date(startWin); t < endWin; t = new Date(t.getTime() + 60 * 60 * 1000)) {
          const slotStart = new Date(t)
          const slotEnd = new Date(Math.min(endWin.getTime(), slotStart.getTime() + 60 * 60 * 1000))
          if (slotEnd <= slotStart) continue
          // Skip past slots if the date is today
          if (sameDate(slotStart) && slotEnd <= now) continue
          pushSlot(slotStart, slotEnd, price)
        }
      }
    } else {
      // Default to 08:00–22:00 when no rules
      for (let hour = 8; hour < 22; hour++) {
        const start = new Date(date)
        start.setHours(hour, 0, 0, 0)
        const end = new Date(date)
        end.setHours(hour + 1, 0, 0, 0)
        if (sameDate(start) && end <= now) continue
        pushSlot(start, end, basePrice)
      }
    }

    return slots
  }

  /**
   * Notify waitlist users when a slot becomes available
   */
  private async notifyWaitlist(courtId: string, startDatetime: string, _endDatetime: string) {
    const { data: waitlistUsers } = await this.supabase
      .from('waitlist')
      .select('*, user:profiles(*)')
      .eq('court_id', courtId)
      .eq('status', 'active')

    const { data: court } = await this.supabase
      .from('courts')
      .select('name, venue:venues(name)')
      .eq('id', courtId)
      .single<{ name: string; venue: { name: string }[] }>()

    // Notify relevant users
    for (const entry of waitlistUsers || []) {
      // Simple notification - in production, check time overlap
      if (court) {
        const courtName = court.name
        const venueName = court.venue[0]?.name ?? ''

        await notificationService.sendWaitlistSlotAvailable({
          userId: entry.user_id,
          courtName,
          venueName,
          startDatetime,
          expiresInMinutes: 10,
        })
      }
    }
  }
}

export const bookingService = new BookingService()

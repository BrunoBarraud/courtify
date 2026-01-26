/**
 * Booking Service
 * Handles all booking-related business logic
 */

import { createAdminClient } from '@/lib/supabase/client'
import { notificationService } from './notification/NotificationService'
import { calculateDurationHours } from '@/lib/utils'

export class BookingService {
  private supabase = createAdminClient() as any

  private getSlotConfig(courtType: string | null | undefined) {
    if (courtType === 'Pádel') {
      return {
        slotMinutes: 90,
        defaultStartHour: 13,
        defaultStartMinute: 0,
        defaultEndHour: 23,
        defaultEndMinute: 30,
      }
    }

    return {
      slotMinutes: 60,
      defaultStartHour: 8,
      defaultStartMinute: 0,
      defaultEndHour: 22,
      defaultEndMinute: 0,
    }
  }

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
    const slotConfig = this.getSlotConfig((court as { court_type?: string } | null)?.court_type)
    const slots = this.generateTimeSlots(
      rules || [],
      bookings || [],
      blockedPeriods || [],
      date,
      court.hourly_rate,
      slotConfig
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
    participants?: Array<{
      name: string
      email?: string
      phone?: string
      isMember?: boolean
      memberNumber?: string
    }>
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

    const { data: pricingRule } = await this.supabase
      .from('pricing_rules')
      .select('pricing_mode, member_price, non_member_price, allowed_player_counts')
      .eq('court_id', data.courtId)
      .maybeSingle()

    let totalAmount = 0
    const participants = data.participants ?? []

    if (
      pricingRule &&
      String((pricingRule as { pricing_mode?: string } | null)?.pricing_mode) === 'per_person'
    ) {
      if (participants.length === 0) {
        throw new Error('Debe cargar los participantes para calcular el precio')
      }

      for (const p of participants) {
        const isMember = Boolean(p.isMember)
        if (!isMember) {
          totalAmount += Number((pricingRule as any).non_member_price)
          continue
        }

        const memberNumber = String(p.memberNumber ?? '').trim()
        if (!memberNumber) {
          throw new Error('Falta número de socio en un participante')
        }

        const { data: member } = await this.supabase
          .from('club_members')
          .select('id, is_active, status, profile_id')
          .eq('member_number', memberNumber)
          .single()

        const typedMember = member as {
          id: string
          is_active?: boolean
          status?: string
          profile_id: string | null
        } | null

        if (!typedMember) {
          throw new Error(`Número de socio no encontrado: ${memberNumber}`)
        }

        const active = typedMember.is_active ?? typedMember.status === 'active'
        if (!active) {
          throw new Error(`Socio inactivo: ${memberNumber}`)
        }

        // Estricto: solo se considera socio si el número ya fue reclamado por una cuenta
        if (!typedMember.profile_id) {
          throw new Error(`El número de socio ${memberNumber} aún no está asociado a una cuenta`)
        }

        totalAmount += Number((pricingRule as any).member_price)
      }
    } else {
      // Fallback legacy: hourly_rate * duración
      const duration = calculateDurationHours(data.startDatetime, data.endDatetime)
      totalAmount = court.hourly_rate * duration
    }
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
    if (participants.length > 0) {
      if (pricingRule && String((pricingRule as any)?.pricing_mode) === 'per_person') {
        const rows = [] as Array<Record<string, unknown>>

        for (const p of participants) {
          const isMember = Boolean(p.isMember)
          let memberId: string | null = null
          let memberNumber: string | null = null
          const priceApplied = isMember
            ? Number((pricingRule as any).member_price)
            : Number((pricingRule as any).non_member_price)

          if (isMember) {
            memberNumber = String(p.memberNumber ?? '').trim() || null
            if (!memberNumber) {
              throw new Error('Falta número de socio en un participante')
            }

            const { data: member } = await this.supabase
              .from('club_members')
              .select('id, is_active, status, profile_id')
              .eq('member_number', memberNumber)
              .single()

            const typedMember = member as {
              id: string
              is_active?: boolean
              status?: string
              profile_id: string | null
            } | null

            if (!typedMember) {
              throw new Error(`Número de socio no encontrado: ${memberNumber}`)
            }
            const active = typedMember.is_active ?? typedMember.status === 'active'
            if (!active) {
              throw new Error(`Socio inactivo: ${memberNumber}`)
            }
            if (!typedMember.profile_id) {
              throw new Error(
                `El número de socio ${memberNumber} aún no está asociado a una cuenta`
              )
            }

            memberId = typedMember.id
          }

          rows.push({
            booking_id: booking.id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            is_member: isMember,
            member_number: memberNumber,
            member_id: memberId,
            price_applied: priceApplied,
          })
        }

        await this.supabase.from('booking_participants').insert(rows)
      } else {
        await this.supabase.from('booking_participants').insert(
          participants.map(p => ({
            booking_id: booking.id,
            name: p.name,
            email: p.email,
            phone: p.phone,
          }))
        )
      }
    }

    // Send confirmation notification to user
    await notificationService.sendBookingConfirmation({
      userId: data.userId,
      bookingNumber: booking.booking_number,
      courtName: court.name,
      venueName: court.venue.name,
      startDatetime: data.startDatetime,
      endDatetime: data.endDatetime,
      totalAmount: finalAmount,
    })

    // Send notification to all venue admins
    const { data: admins } = await this.supabase
      .from('profiles')
      .select('id')
      .in('role', ['venue_admin', 'super_admin'])
      .eq('is_active', true)

    if (admins && admins.length > 0) {
      // Enviar notificación a cada admin
      await Promise.allSettled(
        admins.map((admin: { id: string }) =>
          notificationService.sendAdminBookingCreated({
            adminId: admin.id,
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
            finalAmount: finalAmount,
          })
        )
      )
    }

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

    // TODO: En una sola sede, las notificaciones a admins se pueden manejar de forma diferente
    // Por ahora, se omiten las notificaciones automáticas a venue_admins

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
    basePrice: number,
    slotConfig: {
      slotMinutes: number
      defaultStartHour: number
      defaultStartMinute: number
      defaultEndHour: number
      defaultEndMinute: number
    }
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
      // Build slots based on rules windows (slotMinutes steps)
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

        // Generate slots inside window
        const price = r.price_override ?? basePrice
        for (
          let t = new Date(startWin);
          t < endWin;
          t = new Date(t.getTime() + slotConfig.slotMinutes * 60 * 1000)
        ) {
          const slotStart = new Date(t)
          const slotEnd = new Date(
            Math.min(endWin.getTime(), slotStart.getTime() + slotConfig.slotMinutes * 60 * 1000)
          )
          if (slotEnd <= slotStart) continue
          // Skip past slots if the date is today
          if (sameDate(slotStart) && slotEnd <= now) continue
          pushSlot(slotStart, slotEnd, price)
        }
      }
    } else {
      // Default window when no rules
      const startWin = new Date(date)
      startWin.setHours(slotConfig.defaultStartHour, slotConfig.defaultStartMinute, 0, 0)
      const endWin = new Date(date)
      endWin.setHours(slotConfig.defaultEndHour, slotConfig.defaultEndMinute, 0, 0)

      for (
        let t = new Date(startWin);
        t < endWin;
        t = new Date(t.getTime() + slotConfig.slotMinutes * 60 * 1000)
      ) {
        const slotStart = new Date(t)
        const slotEnd = new Date(
          Math.min(endWin.getTime(), slotStart.getTime() + slotConfig.slotMinutes * 60 * 1000)
        )
        if (slotEnd <= slotStart) continue
        if (sameDate(slotStart) && slotEnd <= now) continue
        pushSlot(slotStart, slotEnd, basePrice)
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
      .single()

    const typedCourt = court as { name: string; venue: { name: string }[] } | null

    // Notify relevant users
    for (const entry of waitlistUsers || []) {
      // Simple notification - in production, check time overlap
      if (typedCourt) {
        const courtName = typedCourt.name
        const venueName = typedCourt.venue[0]?.name ?? ''

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

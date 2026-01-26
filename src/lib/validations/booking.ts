/**
 * Booking Validation Schemas
 * Zod schemas for validating booking-related data
 */

import { z } from 'zod'

export const createBookingSchema = z
  .object({
    courtId: z.string().uuid('Invalid court ID'),
    startDatetime: z.string().datetime('Invalid start datetime'),
    endDatetime: z.string().datetime('Invalid end datetime'),
    participants: z
      .array(
        z.object({
          name: z.string().min(1, 'Name is required'),
          email: z.string().email('Invalid email').optional(),
          phone: z.string().optional(),
          isMember: z.boolean().optional(),
          memberNumber: z.string().optional(),
        })
      )
      .optional(),
    notes: z.string().max(500, 'Notes too long').optional(),
    promotionCode: z.string().optional(),
  })
  .refine(data => new Date(data.endDatetime) > new Date(data.startDatetime), {
    message: 'End time must be after start time',
    path: ['endDatetime'],
  })

export const updateBookingSchema = z.object({
  startDatetime: z.string().datetime().optional(),
  endDatetime: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
})

export const checkAvailabilitySchema = z.object({
  courtId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
})

export const addToWaitlistSchema = z.object({
  courtId: z.string().uuid(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  preferredEndTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>
export type AddToWaitlistInput = z.infer<typeof addToWaitlistSchema>

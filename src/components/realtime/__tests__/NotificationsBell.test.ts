import { resolveNotificationLink } from '../NotificationsBell'

describe('resolveNotificationLink', () => {
  it('routes admin booking notifications to admin bookings with highlight', () => {
    const link = resolveNotificationLink({
      notification_type: 'admin_booking_created',
      data: { bookingId: 'booking-123' },
    })

    expect(link).toBe('/admin/bookings?highlight=booking-123')
  })

  it('falls back to /admin when bookingId is missing', () => {
    const link = resolveNotificationLink({
      notification_type: 'admin_booking_created',
      data: {},
    })

    expect(link).toBe('/admin')
  })

  it('routes booking notifications to /bookings', () => {
    const link = resolveNotificationLink({
      notification_type: 'booking_confirmed',
    })

    expect(link).toBe('/bookings')
  })

  it('routes payment notifications to /payments', () => {
    const link = resolveNotificationLink({
      notification_type: 'payment_received',
    })

    expect(link).toBe('/payments')
  })

  it('routes other notifications to /notifications', () => {
    const link = resolveNotificationLink({
      notification_type: 'general',
    })

    expect(link).toBe('/notifications')
  })
})

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { notificationService } from '@/lib/services/notification/NotificationService'

type CourtRel = { name?: string } | { name?: string }[] | null
type BookingRow = {
  user_id: string
  booking_number: string
  start_datetime: string
  court: CourtRel
}

// POST /api/cron/reminders
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.headers.get('X-CRON-SECRET')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Hours ahead window for reminders
  const hoursAhead = Number(process.env.REMINDER_HOURS_AHEAD || 24)
  const now = new Date()
  const until = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

  try {
    // Fetch upcoming bookings within window, excluding cancelled
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, booking_number, user_id, start_datetime, court:courts(name)')
      .neq('status', 'cancelled')
      .gte('start_datetime', now.toISOString())
      .lte('start_datetime', until.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    await Promise.allSettled(
      (bookings as unknown as BookingRow[]).map(b => {
        const courtRel = b.court
        const courtName = Array.isArray(courtRel) ? courtRel[0]?.name : courtRel?.name
        return notificationService.sendBookingReminder({
          userId: b.user_id,
          bookingNumber: b.booking_number,
          courtName: courtName || 'Cancha',
          startDatetime: b.start_datetime,
        })
      })
    )

    return NextResponse.json({ ok: true, processed: bookings.length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

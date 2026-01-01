import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { notificationService } from '@/lib/services/notification/NotificationService'

// POST /api/cron/admin-daily-summary
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.headers.get('X-CRON-SECRET')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Optional ?date=YYYY-MM-DD, default today (local server time)
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date')
  const target = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date()
  const start = new Date(target)
  start.setHours(0, 0, 0, 0)
  const end = new Date(target)
  end.setHours(23, 59, 59, 999)

  try {
    // Get bookings for the day with venue relation
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, court:courts(venue:venues(id,name))')
      .gte('start_datetime', start.toISOString())
      .lte('start_datetime', end.toISOString())
      .neq('status', 'cancelled')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const countsByVenue = new Map<string, { name: string; count: number }>()

    for (const b of bookings || []) {
      const courtRel: any = (b as any).court
      const venueRel: any = Array.isArray(courtRel) ? courtRel[0]?.venue : courtRel?.venue
      const venueId: string | undefined = venueRel?.id
      const venueName: string = venueRel?.name || 'Sede'
      if (!venueId) continue
      const current = countsByVenue.get(venueId)
      countsByVenue.set(venueId, { name: venueName, count: (current?.count || 0) + 1 })
    }

    // For each venue, notify its admins
    // TODO: En una sola sede, implementar notificaciones a admins de forma diferente
    // Por ahora, las notificaciones diarias están deshabilitadas.

    return NextResponse.json({ ok: true, venues: countsByVenue.size })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

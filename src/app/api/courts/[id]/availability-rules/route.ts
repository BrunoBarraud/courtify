import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

async function assertVenueAdmin(supabase: ReturnType<typeof createServerClient>, userId: string, courtId: string) {
  // Get court to find its venue
  const { data: court } = await supabase
    .from('courts')
    .select('venue_id')
    .eq('id', courtId)
    .single()
  if (!court) return false

  // Check profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'super_admin') return true

  // Check venue_admins membership
  const { data: admin } = await supabase
    .from('venue_admins')
    .select('id')
    .eq('venue_id', court.venue_id)
    .eq('user_id', userId)
    .single()

  return !!admin
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    const { data: rules, error } = await supabase
      .from('court_availability_rules')
      .select('*')
      .eq('court_id', params.id)
      .order('day_of_week')
      .order('start_time')

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ rules })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check admin of venue owning this court
    // Reuse minimal check inline to avoid duplication
    const { data: court } = await supabase
      .from('courts')
      .select('venue_id')
      .eq('id', params.id)
      .single()
    if (!court) return NextResponse.json({ error: 'Court not found' }, { status: 404 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      const { data: admin } = await supabase
        .from('venue_admins')
        .select('id')
        .eq('venue_id', court.venue_id)
        .eq('user_id', user.id)
        .single()
      if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { day_of_week, start_time, end_time } = body || {}
    if (!day_of_week || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 })
    }

    const { error } = await supabase
      .from('court_availability_rules')
      .delete()
      .match({ court_id: params.id, day_of_week, start_time, end_time })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = await assertVenueAdmin(supabase, user.id, params.id)
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const payload = {
      court_id: params.id,
      day_of_week: body.day_of_week, // 'monday' | ...
      start_time: body.start_time,   // 'HH:MM'
      end_time: body.end_time,       // 'HH:MM'
      is_available: body.is_available ?? true,
      price_override: body.price_override ?? null,
    }

    // validations
    const daySet = new Set(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'])
    const timeRe = /^\d{2}:\d{2}$/
    if (!payload.day_of_week || !daySet.has(payload.day_of_week)) {
      return NextResponse.json({ error: 'Invalid day_of_week' }, { status: 400 })
    }
    if (!payload.start_time || !timeRe.test(payload.start_time)) {
      return NextResponse.json({ error: 'Invalid start_time' }, { status: 400 })
    }
    if (!payload.end_time || !timeRe.test(payload.end_time)) {
      return NextResponse.json({ error: 'Invalid end_time' }, { status: 400 })
    }
    if (payload.end_time <= payload.start_time) {
      return NextResponse.json({ error: 'end_time must be greater than start_time' }, { status: 400 })
    }

    // prevent overlapping rules on same day
    const { data: existing, error: overlapErr } = await supabase
      .from('court_availability_rules')
      .select('start_time,end_time')
      .eq('court_id', params.id)
      .eq('day_of_week', payload.day_of_week)
    if (overlapErr) {
      return NextResponse.json({ error: overlapErr.message }, { status: 400 })
    }
    const overlaps = (existing || []).some((r: any) => !(payload.end_time <= r.start_time || payload.start_time >= r.end_time))
    if (overlaps) {
      return NextResponse.json({ error: 'Overlapping rule exists for this day' }, { status: 409 })
    }

    const { data: rule, error } = await supabase
      .from('court_availability_rules')
      .insert(payload)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ rule }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

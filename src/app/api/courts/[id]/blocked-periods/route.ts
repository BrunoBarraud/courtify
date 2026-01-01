import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

async function assertVenueAdmin(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  courtId: string
) {
  const { data: court } = await supabase
    .from('courts')
    .select('venue_id')
    .eq('id', courtId)
    .single()
  if (!court) return false

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  // En una sola sede, super_admin y venue_admin tienen acceso
  return profile?.role === 'super_admin' || profile?.role === 'venue_admin'
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const { data, error } = await supabase
      .from('court_blocked_periods')
      .select('*')
      .eq('court_id', params.id)
      .order('start_datetime', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ blockedPeriods: data })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch blocked periods' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check admin rights for court's venue
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

    if (profile?.role !== 'super_admin' && profile?.role !== 'venue_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase
      .from('court_blocked_periods')
      .delete()
      .eq('id', id)
      .eq('court_id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete blocked period' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = await assertVenueAdmin(supabase, user.id, params.id)
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const startStr = body.start_datetime
    const endStr = body.end_datetime
    const reason = body.reason ?? null

    // Validations: ISO-ish strings and range
    const startD = new Date(startStr)
    const endD = new Date(endStr)
    if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
      return NextResponse.json({ error: 'Invalid datetime' }, { status: 400 })
    }
    if (endD <= startD) {
      return NextResponse.json(
        { error: 'end_datetime must be greater than start_datetime' },
        { status: 400 }
      )
    }

    // Prevent overlap with existing blocked periods for this court
    const { data: existing, error: ovErr } = await supabase
      .from('court_blocked_periods')
      .select('id, start_datetime, end_datetime')
      .eq('court_id', params.id)
    if (ovErr) return NextResponse.json({ error: ovErr.message }, { status: 400 })
    const overlaps = (existing || []).some(
      bp => new Date(bp.start_datetime) < endD && new Date(bp.end_datetime) > startD
    )
    if (overlaps) {
      return NextResponse.json(
        { error: 'Blocked period overlaps with an existing one' },
        { status: 409 }
      )
    }

    const payload = {
      court_id: params.id,
      start_datetime: startD.toISOString(),
      end_datetime: endD.toISOString(),
      reason,
      created_by: user.id,
    }

    const { data: inserted, error } = await supabase
      .from('court_blocked_periods')
      .insert(payload)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ blockedPeriod: inserted }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create blocked period' }, { status: 500 })
  }
}

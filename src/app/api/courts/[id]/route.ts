import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['venue_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const { member_price, non_member_price, allowed_player_counts, pricing_mode, ...courtPatch } =
      body || {}

    const admin = createAdminClient() as any

    const { data: court, error } = await admin
      .from('courts')
      .update(courtPatch)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const mp = member_price != null ? Number(member_price) : null
    const nmp = non_member_price != null ? Number(non_member_price) : null
    if (mp != null && nmp != null) {
      const apc = Array.isArray(allowed_player_counts) ? allowed_player_counts : []
      const { error: prError } = await admin.from('pricing_rules').upsert({
        court_id: court.id,
        pricing_mode: String(pricing_mode ?? 'per_person'),
        member_price: mp,
        non_member_price: nmp,
        allowed_player_counts: apc,
      })

      if (prError) {
        return NextResponse.json({ error: prError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ court })
  } catch (error) {
    console.error('Court update error:', error)
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['venue_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Usar admin client para bypasear RLS
    const admin = createAdminClient()

    const { data: anyBooking } = await (admin as any)
      .from('bookings')
      .select('id')
      .eq('court_id', params.id)
      .limit(1)

    if (anyBooking && anyBooking.length > 0) {
      const { error } = await (admin as any)
        .from('courts')
        .update({ is_active: false })
        .eq('id', params.id)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, softDeleted: true })
    }

    const { error } = await (admin as any).from('courts').delete().eq('id', params.id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Court deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 })
  }
}

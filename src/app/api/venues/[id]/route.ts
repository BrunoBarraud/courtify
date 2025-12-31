/**
 * Venue Details API Route
 * GET /api/venues/[id] - Get venue details
 * PUT /api/venues/[id] - Update venue (admin only)
 * DELETE /api/venues/[id] - Delete venue (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())

    const { data: venue, error } = await supabase
      .from('venues')
      .select(
        `
        *,
        courts(
          *,
          court_availability_rules(*)
        )
      `
      )
      .eq('id', params.id)
      .eq('is_active', true)
      .single()

    if (error || !venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error('Failed to fetch venue:', error)
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar rol y permisos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Si no es super_admin, verificar si es admin de la sede
    if (profile?.role !== 'super_admin') {
      const { data: venueAdmin } = await supabase
        .from('venue_admins')
        .select('*')
        .eq('venue_id', params.id)
        .eq('user_id', session.user.id)
        .single()

      if (!venueAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await request.json()

    // Update venue
    const { data: venue, error } = await supabase
      .from('venues')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error('Venue update error:', error)
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar rol y permisos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Si no es super_admin, verificar si es admin de la sede
    if (profile?.role !== 'super_admin') {
      const { data: venueAdmin } = await supabase
        .from('venue_admins')
        .select('*')
        .eq('venue_id', params.id)
        .eq('user_id', session.user.id)
        .single()

      if (!venueAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Soft delete (set is_active to false)
    const { error } = await supabase.from('venues').update({ is_active: false }).eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Venue deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 })
  }
}

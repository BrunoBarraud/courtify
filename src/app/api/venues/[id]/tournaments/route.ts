import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const admin = createAdminClient()

    // 1. Authenticate user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Authorize - Verify user is super_admin OR venue_admin for this venue
    const [profileRes, venueAdminRes] = await Promise.all([
      (admin as SupabaseClient).from('profiles').select('role').eq('id', session.user.id).single(),
      (admin as SupabaseClient)
        .from('venue_admins')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('venue_id', params.id)
        .single(),
    ])

    const isSuperAdmin = profileRes.data?.role === 'super_admin'
    const isVenueAdmin = !!venueAdminRes.data

    if (!isSuperAdmin && !isVenueAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Solo administradores pueden crear torneos.' },
        { status: 403 }
      )
    }

    // 3. Parse input
    const body = await request.json()
    const { name, description, start_date, end_date, max_teams, registration_fee, status } = body

    if (!name || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Nombre, fecha de inicio y fecha de fin son obligatorios.' },
        { status: 400 }
      )
    }

    // 4. Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { error: 'La fecha de fin no puede ser anterior a la de inicio.' },
        { status: 400 }
      )
    }

    // 5. Insert Tournament using admin client (to bypass potential RLS issues or just direct insert)
    const { data: tournament, error: insertError } = await admin
      .from('tournaments')
      .insert({
        venue_id: params.id,
        name,
        description,
        start_date,
        end_date,
        max_teams: max_teams || 16,
        registration_fee: registration_fee || 0,
        status: status || 'upcoming',
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ tournament }, { status: 201 })
  } catch (error) {
    console.error('Error creating tournament:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el torneo' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('venue_id', params.id)
      .order('start_date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ tournaments }, { status: 200 })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
  }
}

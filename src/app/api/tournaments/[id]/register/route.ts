import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const admin = createAdminClient()

    // 1. Check user auth
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Debés iniciar sesión para inscribir un equipo.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre del equipo es obligatorio.' }, { status: 400 })
    }

    // 2. Fetch tournament to check status and spots
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('status, max_teams')
      .eq('id', params.id)
      .single()

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado.' }, { status: 404 })
    }

    if (tournament.status !== 'registration_open') {
      return NextResponse.json(
        { error: 'Las inscripciones para este torneo están cerradas.' },
        { status: 400 }
      )
    }

    // 3. Prevent duplicate registrations for the same captain in the same tournament
    const { data: existingTeam } = await supabase
      .from('tournament_teams')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('captain_id', session.user.id)
      .single()

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Ya inscribiste un equipo en este torneo como capitán.' },
        { status: 400 }
      )
    }

    // 4. Check available spots
    const { count } = await supabase
      .from('tournament_teams')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', params.id)

    if (count !== null && count >= tournament.max_teams) {
      return NextResponse.json({ error: 'Cupos agotados.' }, { status: 400 })
    }

    // 5. Insert Team and self as member
    // Using admin client to safely bypass standard RLS constraints on team creation if needed,
    // although RLS should allow insert where captain_id = auth.uid()
    const { data: newTeam, error: insertError } = await (admin as SupabaseClient)
      .from('tournament_teams')
      .insert({
        tournament_id: params.id,
        name: name.trim(),
        captain_id: session.user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Insert captain as the first member
    await (admin as SupabaseClient).from('tournament_members').insert({
      team_id: newTeam.id,
      user_id: session.user.id,
    })

    return NextResponse.json({ team: newTeam }, { status: 201 })
  } catch (error) {
    console.error('Error registering team:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error interno de servidor al inscribir el equipo' },
      { status: 500 }
    )
  }
}

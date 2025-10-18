import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

async function requireSuperAdmin() {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { supabase, session: null, isSuper: false }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  return { supabase, session, isSuper: profile?.role === 'super_admin' }
}

export async function POST(request: NextRequest) {
  const { supabase, isSuper } = await requireSuperAdmin()
  if (!isSuper) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { userId, venueId } = body || {}
  if (!userId || !venueId) return NextResponse.json({ error: 'Missing userId/venueId' }, { status: 400 })

  const { error } = await supabase
    .from('venue_admins')
    .insert({ user_id: userId, venue_id: venueId })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  const { supabase, isSuper } = await requireSuperAdmin()
  if (!isSuper) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  let query = supabase
    .from('venue_admins')
    .select('user_id, venue:venues(id, name, slug)')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ assignments: data })
}

export async function DELETE(request: NextRequest) {
  const { supabase, isSuper } = await requireSuperAdmin()
  if (!isSuper) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { userId, venueId } = body || {}
  if (!userId || !venueId) return NextResponse.json({ error: 'Missing userId/venueId' }, { status: 400 })

  const { error } = await supabase
    .from('venue_admins')
    .delete()
    .match({ user_id: userId, venue_id: venueId })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

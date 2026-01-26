import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient, createServerClient } from '@/lib/supabase/client'

async function requireAdmin() {
  const supabase = createServerClient(() => cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, user: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const allowed = profile?.role === 'super_admin' || profile?.role === 'venue_admin'
  return { ok: allowed, user }
}

export async function GET(request: NextRequest) {
  const { ok } = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const searchParams = request.nextUrl.searchParams
  const q = (searchParams.get('q') ?? '').trim()

  const admin = createAdminClient() as any

  let query = admin
    .from('club_members')
    .select(
      'id, member_number, full_name, email, phone, is_active, status, profile_id, claimed_at, created_at'
    )
    .order('member_number', { ascending: true })
    .limit(500)

  if (q) {
    query = query.or(`member_number.ilike.%${q}%,full_name.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ members: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { ok } = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const memberNumber = String(body?.member_number ?? '').trim()
  const fullName = String(body?.full_name ?? '').trim()
  const email = body?.email ? String(body.email).trim() : null
  const phone = body?.phone ? String(body.phone).trim() : null
  const isActive = body?.is_active != null ? Boolean(body.is_active) : true

  if (!memberNumber || !fullName) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos: member_number, full_name' },
      { status: 400 }
    )
  }

  const admin = createAdminClient() as any
  const { data, error } = await admin
    .from('club_members')
    .insert({
      member_number: memberNumber,
      full_name: fullName,
      email,
      phone,
      is_active: isActive,
      status: isActive ? 'active' : 'inactive',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, id: data?.id }, { status: 201 })
}

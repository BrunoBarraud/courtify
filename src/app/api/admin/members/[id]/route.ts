import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient, createServerClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { ok } = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const memberId = params.id
  if (!memberId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const patch: Database['public']['Tables']['club_members']['Update'] = {}

  if (body?.member_number != null) patch.member_number = String(body.member_number).trim()
  if (body?.full_name != null) patch.full_name = String(body.full_name).trim()
  if ('email' in (body || {})) patch.email = body.email ? String(body.email).trim() : null
  if ('phone' in (body || {})) patch.phone = body.phone ? String(body.phone).trim() : null
  if (body?.is_active != null) {
    const isActive = Boolean(body.is_active)
    patch.is_active = isActive
    patch.status = isActive ? 'active' : 'inactive'
  }

  const admin = createAdminClient()
  const { error } = await admin.from('club_members').update(patch).eq('id', memberId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { ok } = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const memberId = params.id
  if (!memberId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('club_members').delete().eq('id', memberId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

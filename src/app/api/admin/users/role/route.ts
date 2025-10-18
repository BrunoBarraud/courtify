import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

async function requireSuperAdmin() {
  const supabase = createServerClient(() => cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, session: null, isSuper: false }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { supabase, session: { user }, isSuper: profile?.role === 'super_admin' }
}

export async function POST(request: NextRequest) {
  const { supabase, isSuper } = await requireSuperAdmin()
  if (!isSuper) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { userId, email, role } = body || {}
  if (!role || !['user','venue_admin','super_admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  let targetId = userId
  if (!targetId && email) {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single()
    targetId = data?.id
  }
  if (!targetId) return NextResponse.json({ error: 'Missing userId/email' }, { status: 400 })

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', targetId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

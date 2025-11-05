import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

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

export async function GET(request: NextRequest) {
  const { isSuper } = await requireSuperAdmin()
  if (!isSuper) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ users: data })
}

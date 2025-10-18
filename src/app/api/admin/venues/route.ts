import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
  if (profile?.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('venues')
    .select('id, name, slug')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ venues: data })
}

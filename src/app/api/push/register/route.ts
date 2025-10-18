import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    const admin = createAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token, device_type = 'web' } = await request.json()
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    // Remove existing record for this token (if any) to avoid ON CONFLICT requirement
    const { error: delErr } = await admin
      .from('push_tokens')
      .delete()
      .eq('token', token)
    if (delErr) console.warn('push_tokens delete warning:', delErr)

    // Insert fresh record
    const { error } = await admin
      .from('push_tokens')
      .insert({
        user_id: session.user.id,
        token,
        device_type,
        is_active: true,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Push register error:', e)
    return NextResponse.json({ error: e.message || 'Failed to register token' }, { status: 500 })
  }
}

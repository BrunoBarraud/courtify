import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

// POST /api/dev/notify-test  -> inserta una notificación para el usuario actual
export async function POST(_req: NextRequest) {
  const supabase = createServerClient(() => cookies())
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await admin.from('notifications').insert({
    user_id: user.id,
    notification_type: 'general',
    channel: 'email',
    title: 'Realtime Test',
    body: 'Si ves este toast sin recargar, Realtime está funcionando',
    data: {},
    sent_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

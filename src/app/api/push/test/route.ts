import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { notificationService } from '@/lib/services/notification/NotificationService'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await notificationService.notify({
      userId: session.user.id,
      type: 'general',
      title: 'Notificación de prueba',
      body: 'Este es un push de prueba desde Courtify.',
      data: { source: 'manual_test', sentAt: new Date().toISOString() },
      channels: ['push'],
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Push test error:', e)
    return NextResponse.json({ error: e.message || 'Failed to send test push' }, { status: 500 })
  }
}

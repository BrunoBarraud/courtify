import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

// GET /api/notifications?limit=20&offset=0
export async function GET(req: NextRequest) {
  const supabase = createServerClient(() => cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

  const { data, error, count } = await supabase
    .from('notifications')
    .select('id, title, body, notification_type, channel, data, sent_at, read_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const unread = (data || []).filter(n => !n.read_at).length
  return NextResponse.json({ notifications: data || [], total: count || 0, unread })
}

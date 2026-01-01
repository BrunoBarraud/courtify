import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

async function requireSuperAdmin() {
  const supabase = createServerClient(() => cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, session: null, isSuper: false }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { supabase, session: { user }, isSuper: profile?.role === 'super_admin' }
}

// DELETE /api/admin/users/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { isSuper } = await requireSuperAdmin()
  if (!isSuper) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const targetUserId = params.id
  if (!targetUserId) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

  const admin = createAdminClient()

  // Step 1: delete from Supabase Auth (source of truth for identity)
  let authDeleted = true
  try {
    await admin.auth.admin.deleteUser(targetUserId)
  } catch (err) {
    authDeleted = false
    // If user not found in auth, continue with DB cleanup
    // but report the error in the response payload
  }

  // Step 2: best-effort cleanup of related records (execute in parallel)
  const cleanupOps: Promise<void>[] = [
    (async () => {
      try {
        await admin.from('profiles').delete().eq('id', targetUserId)
      } catch {
        /* noop */
      }
    })(),
    (async () => {
      try {
        await admin.from('waitlist').delete().eq('user_id', targetUserId)
      } catch {
        /* noop */
      }
    })(),
    (async () => {
      try {
        await admin.from('notification_preferences').delete().eq('user_id', targetUserId)
      } catch {
        /* noop */
      }
    })(),
    (async () => {
      try {
        await admin.from('notifications').delete().eq('user_id', targetUserId)
      } catch {
        /* noop */
      }
    })(),
    // Optional domain tables (pueden no existir aún en el schema)
    (async () => {
      try {
        await admin.from('user_subscriptions').delete().eq('user_id', targetUserId)
      } catch {
        /* noop */
      }
    })(),
    (async () => {
      try {
        await admin.from('promotion_usage').delete().eq('user_id', targetUserId)
      } catch {
        /* noop */
      }
    })(),
  ]

  const cleanupResults = await Promise.allSettled(cleanupOps)
  const failures = cleanupResults.filter((r): r is PromiseRejectedResult => r.status === 'rejected')

  return NextResponse.json({
    ok: true,
    userId: targetUserId,
    authDeleted,
    cleanupErrors: failures.length,
  })
}

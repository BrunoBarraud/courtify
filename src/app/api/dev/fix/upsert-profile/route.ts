import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function POST(_req: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    const admin = createAdminClient()

    // Validate auth with auth.getUser() (server-authenticated)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get existing profile
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Create minimal profile
      const { error: insertError } = await admin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        }, { onConflict: 'id' })

      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Upsert profile error:', e)
    return NextResponse.json({ error: e.message || 'Failed to upsert profile' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { notificationService } from '@/lib/services/notification/NotificationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body as { email?: string }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Find user profile by email to get userId
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    // Always call Supabase to send reset email, even if profile is not found (auth may still know the user)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || ''
    const redirectTo = appUrl
      ? `${appUrl.startsWith('http') ? appUrl : `https://${appUrl}`}/auth/update-password`
      : `${request.nextUrl.origin}/auth/update-password`

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 400 })
    }

    // In-app notification only if we have a profile (thus a userId)
    if (profile?.id) {
      await notificationService.sendPasswordResetNotification({
        userId: profile.id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to request password reset' }, { status: 500 })
  }
}

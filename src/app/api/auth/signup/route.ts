/**
 * Sign Up API Route
 * POST /api/auth/signup - Register a new user
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { signUpSchema } from '@/lib/validations/auth'
import { notificationService } from '@/lib/services/notification/NotificationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signUpSchema.parse(body)

    const supabase = createServerClient(() => cookies())

    // Create user
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
          phone: validatedData.phone,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create profile
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: validatedData.email,
        full_name: validatedData.fullName,
        phone: validatedData.phone,
        role: 'user',
      })

      // Create default notification preferences
      await supabase.from('notification_preferences').insert({
        user_id: data.user.id,
      })

      // Send welcome notification
      await notificationService.sendAccountWelcome({
        userId: data.user.id,
        fullName: validatedData.fullName,
      })
    }

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        user: data.user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sign up error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

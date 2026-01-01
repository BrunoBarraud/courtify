/**
 * Venues API Routes
 * GET /api/venues - Get all venues
 * POST /api/venues - Create a new venue (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    const { searchParams } = new URL(request.url)

    // Query parameters
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const search = searchParams.get('search')

    let query = supabase.from('venues').select('*').eq('is_active', true).order('name')

    // Apply filters
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (country) {
      query = query.eq('country', country)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: venues, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ venues })
  } catch (error) {
    console.error('Failed to fetch venues:', error)
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['venue_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Create venue using admin client to bypass RLS
    const admin = createAdminClient()
    const { data: venue, error } = await admin
      .from('venues')
      .insert({
        ...body,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // En una sola sede, no necesitamos asignar venue_admins
    // Los admins tienen acceso a todas las sedes por defecto

    return NextResponse.json({ venue }, { status: 201 })
  } catch (error) {
    console.error('Venue creation error:', error)
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 })
  }
}

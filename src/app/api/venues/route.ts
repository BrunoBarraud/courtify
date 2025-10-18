/**
 * Venues API Routes
 * GET /api/venues - Get all venues
 * POST /api/venues - Create a new venue (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('venues')
      .select(`
        *,
        courts(count)
      `)
      .eq('is_active', true)
      .order('name')

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
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ venues })
  } catch (error) {
    console.error('Failed to fetch venues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
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

    // Create venue
    const { data: venue, error } = await supabase
      .from('venues')
      .insert({
        ...body,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Add user as venue admin
    await supabase.from('venue_admins').insert({
      venue_id: venue.id,
      user_id: session.user.id,
      permissions: {
        can_manage_bookings: true,
        can_manage_courts: true,
        can_manage_staff: true,
        can_view_reports: true,
      },
    })

    return NextResponse.json({ venue }, { status: 201 })
  } catch (error) {
    console.error('Venue creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    )
  }
}

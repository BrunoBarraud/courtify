/**
 * Venue Courts API Route
 * GET /api/venues/[id]/courts - Get all courts for a venue
 * POST /api/venues/[id]/courts - Create a new court (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    const { searchParams } = new URL(request.url)
    
    const courtType = searchParams.get('type')
    const isIndoor = searchParams.get('indoor')
    
    let query = supabase
      .from('courts')
      .select('*')
      .eq('venue_id', params.id)
      .eq('is_active', true)
      .order('display_order')

    if (courtType) {
      query = query.eq('court_type', courtType)
    }
    
    if (isIndoor !== null) {
      query = query.eq('is_indoor', isIndoor === 'true')
    }

    const { data: courts, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ courts })
  } catch (error) {
    console.error('Failed to fetch courts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is venue admin
    const { data: venueAdmin } = await supabase
      .from('venue_admins')
      .select('*')
      .eq('venue_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (!venueAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Create court
    const { data: court, error } = await supabase
      .from('courts')
      .insert({
        ...body,
        venue_id: params.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ court }, { status: 201 })
  } catch (error) {
    console.error('Court creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create court' },
      { status: 500 }
    )
  }
}

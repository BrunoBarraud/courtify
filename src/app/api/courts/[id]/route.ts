import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['venue_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // @ts-ignore - Tipos de Supabase desactualizados
    const { data: court, error } = await supabase
      .from('courts')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ court })
  } catch (error) {
    console.error('Court update error:', error)
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['venue_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Usar admin client para bypasear RLS
    const admin = createAdminClient()

    // Hard delete - eliminar completamente de la base de datos
    // @ts-ignore - Tipos de Supabase desactualizados
    const { error } = await admin.from('courts').delete().eq('id', params.id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Court deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { action } = await req.json()

    if (action === 'add') {
      const { error } = await supabase
        .from('user_favorite_venues')
        .insert({ user_id: session.user.id, venue_id: params.id })
      if (error && error.code !== '23505') throw error // 23505 is unique violation, ignore if already favorite
    } else if (action === 'remove') {
      const { error } = await supabase
        .from('user_favorite_venues')
        .delete()
        .match({ user_id: session.user.id, venue_id: params.id })
      if (error) throw error
    } else {
       return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in favorites route:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar favorito' },
      { status: 500 }
    )
  }
}

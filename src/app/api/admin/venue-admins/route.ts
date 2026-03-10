import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si el usuario que hace la solicitud es super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const { userId, venueId } = await req.json()

    if (!userId || !venueId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    // Verificar si el usuario existe y si es venue_admin (si no es super_admin hay que ascenderlo)
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Si el rol es 'user', ascendemos a 'venue_admin'
    if (targetUser.role === 'user') {
      await supabase
        .from('profiles')
        .update({ role: 'venue_admin' })
        .eq('id', userId)
    }

    // Asignar a la tabla venue_admins
    const { error: insertError } = await supabase
      .from('venue_admins')
      .upsert({ user_id: userId, venue_id: venueId }, { onConflict: 'user_id,venue_id' })

    if (insertError) {
      console.error('Error insertando venue_admin:', insertError)
      return NextResponse.json({ error: 'No se pudo asignar a la sede' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Usuario asignado a la sede' })
  } catch (error) {
    console.error('Error asignando sede:', error)
    return NextResponse.json(
      { error: (error as Error)?.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

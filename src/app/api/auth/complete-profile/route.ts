import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())

    // Obtener la sesión actual
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { fullName, phone, isMember, memberNumber } = await request.json()

    // Actualizar el perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        is_member: isMember,
        member_number: memberNumber || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (profileError) {
      throw profileError
    }

    // Si es socio y tiene número de socio válido, crear la relación
    if (isMember && memberNumber) {
      const { data: member } = await supabase
        .from('club_members')
        .select('id')
        .eq('member_number', memberNumber)
        .single()

      if (member) {
        // Actualizar la referencia al socio en el perfil
        await supabase
          .from('profiles')
          .update({
            member_id: member.id,
          })
          .eq('id', session.user.id)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
  }
}

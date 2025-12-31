import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(() => cookies())
    const { memberNumber } = await request.json()

    // Verificar el número de socio en la tabla de socios
    const { data: member, error } = await supabase
      .from('club_members')
      .select('id')
      .eq('member_number', memberNumber)
      .single()

    if (error || !member) {
      return NextResponse.json(
        { isValid: false, message: 'Número de socio no encontrado' },
        { status: 200 }
      )
    }

    return NextResponse.json({ isValid: true, memberId: member.id }, { status: 200 })
  } catch (error) {
    console.error('Error checking member:', error)
    return NextResponse.json({ error: 'Error al verificar el número de socio' }, { status: 500 })
  }
}

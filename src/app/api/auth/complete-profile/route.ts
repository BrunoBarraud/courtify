import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient, createServerClient } from '@/lib/supabase/client'

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
        is_member: Boolean(isMember),
        member_number: memberNumber || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (profileError) {
      throw profileError
    }

    // Si es socio, vincular estrictamente el número (1:1) contra el padrón
    if (isMember && memberNumber) {
      const admin = createAdminClient() as any

      const { data: member, error: memberError } = await admin
        .from('club_members')
        .select('id, is_active, status, profile_id')
        .eq('member_number', memberNumber)
        .single()

      const typedMember = member as {
        id: string
        is_active?: boolean
        status?: string
        profile_id: string | null
      } | null

      if (memberError || !typedMember) {
        return NextResponse.json({ error: 'Número de socio no encontrado' }, { status: 400 })
      }

      const active = typedMember.is_active ?? typedMember.status === 'active'
      if (!active) {
        return NextResponse.json({ error: 'Socio inactivo' }, { status: 400 })
      }

      if (typedMember.profile_id && typedMember.profile_id !== session.user.id) {
        return NextResponse.json(
          { error: 'Este número de socio ya está asociado a otra cuenta' },
          { status: 400 }
        )
      }

      const nowIso = new Date().toISOString()

      const { error: updateMemberError } = await admin
        .from('club_members')
        .update({ profile_id: session.user.id, claimed_at: nowIso })
        .eq('id', typedMember.id)
        .or(`profile_id.is.null,profile_id.eq.${session.user.id}`)

      if (updateMemberError) {
        return NextResponse.json({ error: updateMemberError.message }, { status: 400 })
      }

      const { error: updateProfileError } = await admin
        .from('profiles')
        .update({
          is_member: true,
          member_number: memberNumber,
          member_id: typedMember.id,
          updated_at: nowIso,
        })
        .eq('id', session.user.id)

      if (updateProfileError) {
        return NextResponse.json({ error: updateProfileError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
  }
}

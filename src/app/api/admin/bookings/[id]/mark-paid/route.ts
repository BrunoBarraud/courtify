import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { payment_method = 'cash' } = body

    const admin = createAdminClient()
    const bookingId = params.id

    // Obtener la reserva
    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, final_amount, user_id')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Buscar el pago pendiente
    const { data: existingPayment } = await admin
      .from('payments')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('payment_status', 'pending')
      .single()

    if (existingPayment) {
      // Actualizar el pago existente
      // @ts-ignore - Tipos de Supabase desactualizados
      const { error: updateError } = await admin
        .from('payments')
        .update({
          payment_status: 'completed',
          payment_method,
          paid_at: new Date().toISOString(),
        })
        .eq('id', existingPayment.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    } else {
      // Crear un nuevo pago
      // @ts-ignore - Tipos de Supabase desactualizados
      const { error: createError } = await admin.from('payments').insert({
        booking_id: bookingId,
        user_id: booking.user_id,
        amount: booking.final_amount,
        payment_status: 'completed',
        payment_method,
        paid_at: new Date().toISOString(),
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }
    }

    // Actualizar estado de la reserva a confirmed
    // @ts-ignore - Tipos de Supabase desactualizados
    await admin.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking booking as paid:', error)
    return NextResponse.json({ error: 'Failed to mark booking as paid' }, { status: 500 })
  }
}

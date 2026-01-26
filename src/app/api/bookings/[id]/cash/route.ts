import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(() => cookies())
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 })
    }

    const admin = createAdminClient() as any

    // Verificar que la reserva exista y pertenezca al usuario
    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, user_id, final_amount, status')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Booking is not pending' }, { status: 400 })
    }

    // Si ya existe un pago pending para esta reserva, no crear otro
    const { data: existingPending } = await admin
      .from('payments')
      .select('id, payment_method, payment_status')
      .eq('booking_id', bookingId)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingPending && existingPending.length > 0) {
      return NextResponse.json({ success: true, alreadyExists: true })
    }

    const { error: createError } = await admin.from('payments').insert({
      booking_id: bookingId,
      user_id: booking.user_id,
      amount: booking.final_amount,
      currency: 'ARS',
      payment_method: 'cash',
      payment_status: 'pending',
      metadata: { source: 'cash_selection' },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating cash payment:', error)
    return NextResponse.json({ error: 'Failed to create cash payment' }, { status: 500 })
  }
}

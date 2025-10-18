/**
 * Mercado Pago Webhook Handler
 * POST /api/webhooks/mercadopago - Maneja notificaciones de Mercado Pago
 */

import { NextRequest, NextResponse } from 'next/server'
import mercadopago from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' }, { status: 500 })
    }
    mercadopago.configure({ access_token: accessToken })

    // MP puede enviar datos como JSON o sólo query params
    const url = new URL(request.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const idParam = url.searchParams.get('id') || url.searchParams.get('data.id')

    let paymentId: string | null = null

    // Si viene JSON con data
    try {
      const body = await request.json().catch(() => null as any)
      if (body?.data?.id) {
        paymentId = String(body.data.id)
      }
    } catch {
      // ignorar
    }

    if (!paymentId && idParam) paymentId = String(idParam)

    if (!paymentId) {
      return NextResponse.json({ received: true, note: 'sin paymentId' })
    }

    // Obtener estado del pago en MP
    const payment = await mercadopago.payment.get(paymentId)
    const status = payment.body.status as string

    const supabase = createAdminClient()

    // Actualizar tabla de payments por external_payment_id (en nuestra estrategia guardamos preference/payment id)
    const { data: updatedPayments } = await supabase
      .from('payments')
      .update({
        payment_status:
          status === 'approved' ? 'completed' :
          status === 'refunded' ? 'refunded' :
          status === 'rejected' ? 'failed' :
          status === 'cancelled' ? 'failed' :
          status === 'in_process' ? 'processing' : 'pending',
        external_payment_data: payment.body,
      })
      .eq('external_payment_id', paymentId)
      .select()

    const paymentRow = updatedPayments?.[0]

    // Si es una reserva, confirmar booking al aprobarse
    if (paymentRow?.booking_id && (status === 'approved')) {
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', paymentRow.booking_id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MercadoPago webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

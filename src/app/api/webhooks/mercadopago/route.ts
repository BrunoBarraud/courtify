/**
 * Mercado Pago Webhook Handler
 * POST /api/webhooks/mercadopago - Maneja notificaciones de Mercado Pago
 */

import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment as MercadoPagoPayment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' }, { status: 500 })
    }
    const mercadoPagoClient = new MercadoPagoConfig({ accessToken })
    const paymentApi = new MercadoPagoPayment(mercadoPagoClient)

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

    // Deduplicación de eventos por paymentId cuando lo tenemos
    const supabase = createAdminClient()

    if (paymentId) {
      const { error: insertError } = await supabase
        .from('payment_events')
        .insert({ provider: 'mercadopago', event_id: paymentId })

      if (insertError) {
        if ((insertError as { code?: string }).code === '23505') {
          return NextResponse.json({ received: true, duplicate: true }, { status: 409 })
        }
        console.error('Failed to record MP webhook event:', insertError)
        return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
      }
    }

    // Obtener estado del pago en MP
    const payment = await paymentApi.get({ id: paymentId })
    const status = payment.status as string

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
        external_payment_data: payment,
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

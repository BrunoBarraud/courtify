import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrencyARS, formatDateTimeAR } from '@/lib/i18n/format'
import CancelSection from './CancelSection'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient(() => cookies())

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      `
      *,
      court:courts(*, venue:venues(*))
    `
    )
    .eq('id', params.id)
    .single()

  if (!booking) return notFound()
  const isConfirmed = booking.status === 'confirmed'

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Reserva #{booking.booking_number || booking.id}</CardTitle>
          <CardDescription>Estado: {booking.status}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Cancha</h3>
              <p>{booking.court?.name}</p>
              <p className="text-sm text-muted-foreground">Sede: {booking.court?.venue?.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fecha y horario</h3>
              <p>
                {formatDateTimeAR(booking.start_datetime)} —{' '}
                {formatDateTimeAR(booking.end_datetime)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Importe</h3>
              <p className="text-lg">{formatCurrencyARS(booking.final_amount)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Acciones</h3>
              <div className="flex flex-wrap gap-2">
                <Link href={`/payments/start?bookingId=${booking.id}&method=mercadopago`}>
                  <Button variant="secondary" disabled={isConfirmed}>
                    Pagar MP
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <CancelSection bookingId={booking.id} disabled={isConfirmed} />

          <div>
            <Link href="/dashboard">
              <Button variant="outline">Volver al panel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

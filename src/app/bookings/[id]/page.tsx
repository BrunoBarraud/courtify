import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Clock, CreditCard, ChevronLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8">
      <div className="container max-w-3xl mx-auto px-4 md:px-8">
        
        <Link href="/bookings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
           <ChevronLeft className="mr-1 h-4 w-4" />
           Volver a mis reservas
        </Link>

        <Card className="border border-border/60 shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-muted/40 border-b pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Reserva #{booking.booking_number || booking.id.split('-')[0]}</CardTitle>
                <CardDescription className="text-base mt-1">Detalles de tu turno</CardDescription>
              </div>
              <div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                    booking.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                    'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                  {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'cancelled' ? 'Cancelado' : 'Pendiente Pago'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cancha</h3>
                    <p className="font-bold text-lg">{booking.court?.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.court?.venue?.name}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/10 p-2 rounded-lg text-blue-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fecha y Horario</h3>
                    <p className="font-bold text-lg">{formatDateTimeAR(booking.start_datetime)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Termina {new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(booking.end_datetime))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-8" />

            <div className="grid md:grid-cols-2 gap-8 items-center bg-muted/20 p-6 rounded-xl border border-border/40">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Importe Final</h3>
                <p className="text-3xl font-black text-foreground">{formatCurrencyARS(booking.final_amount)}</p>
              </div>
              <div>
                <div className="flex flex-col gap-3">
                  {(booking.status !== 'confirmed' && booking.status !== 'cancelled') && (
                     <Link href={`/payments/start?bookingId=${booking.id}&method=mercadopago`}>
                      <Button className="w-full h-12 shadow-md hover:scale-[1.02] transition-transform text-base gap-2" variant="default">
                        <CreditCard className="h-5 w-5" />
                        Pagar con Mercado Pago
                      </Button>
                    </Link>
                  )}
                  {booking.status === 'confirmed' && (
                     <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-3 rounded-lg text-center font-semibold text-sm border border-green-500/20">
                       Esta reserva ya está pagada y confirmada. ¡A jugar!
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Volver al panel</Button>
              </Link>
              <CancelSection bookingId={booking.id} disabled={isConfirmed || booking.status === 'cancelled'} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

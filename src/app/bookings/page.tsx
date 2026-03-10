import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronRight } from 'lucide-react'
import { formatCurrencyARS, formatDateTimeAR } from '@/lib/i18n/format'
import { redirect } from 'next/navigation'

export default async function MyBookingsPage() {
  const supabase = createServerClient(() => cookies())
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      court:courts(*, venue:venues(*))
    `
    )
    .eq('user_id', session.user.id)
    .order('start_datetime', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 animate-in fade-in duration-500">
        <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Mis Reservas</h1>
        <p className="text-muted-foreground text-lg">Historial completo y turnos próximos.</p>
      </div>
      
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {!bookings || bookings.length === 0 ? (
              <div className="py-16 px-4 text-center flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  <Calendar className="h-10 w-10 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Sin Historial</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-sm">
                  Todavía no tenés agendado ningún turno.
                </p>
                <Link href="/venues">
                  <Button size="lg" className="rounded-full px-8 py-6 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Agendar mi primer partido
                  </Button>
                </Link>
              </div>
          ) : (
            <div className="divide-y divide-border/60">
              {bookings.map((b: Record<string, any>) => (
                <div key={b.id as string} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-muted/20 transition-colors">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{b.court?.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                          b.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                          b.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                        {b.status === 'confirmed' ? 'Confirmado' : b.status === 'cancelled' ? 'Cancelado' : 'Pendiente Pago'}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                       {b.court?.venue?.name}
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {formatDateTimeAR(b.start_datetime)} — {new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(b.end_datetime))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="bg-secondary/50 px-4 py-2 rounded-lg text-lg font-bold">
                        {formatCurrencyARS(b.final_amount)}
                      </div>
                      <div className="flex w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                        <Link href={`/bookings/${b.id}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" className="w-full gap-1">
                            Detalles <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                          <Link href={`/payments/start?bookingId=${b.id}&method=mercadopago`} className="flex-1 sm:flex-none">
                            <Button className="w-full shadow-md shadow-primary/20">Abonar</Button>
                          </Link>
                        )}
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

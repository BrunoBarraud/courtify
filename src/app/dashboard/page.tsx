/**
 * Dashboard Page
 * Main dashboard for authenticated users
 */

import { createServerClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CreditCard, Trophy } from 'lucide-react'
import Link from 'next/link'
import { formatCurrencyARS, formatDateTimeAR } from '@/lib/i18n/format'

export default async function DashboardPage() {
  const supabase = createServerClient(() => cookies())
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Próximas reservas
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      court:courts(*, venue:venues(*))
    `)
    .eq('user_id', session.user.id)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(5)

  // Estadísticas de reservas
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('status', 'confirmed')
    .gte('start_datetime', new Date().toISOString())

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 container py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ¡Bienvenido/a, {profile?.full_name || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground">
            Esto es lo que está pasando con tus reservas
          </p>
          {/* Notificaciones temporariamente deshabilitadas */}
        </div>

        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas activas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Próximas reservas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reservas totales
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Historial total de reservas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Abonos
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Abonos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Torneos
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Torneos registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Próximas reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas reservas</CardTitle>
            <CardDescription>
              Tus próximas reservas de cancha programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{booking.court.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.court.venue.name}
                      </p>
                      <p className="text-sm mt-1">
                        {formatDateTimeAR(booking.start_datetime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrencyARS(booking.final_amount)}
                      </span>
                      <Link href={`/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline">Ver</Button>
                      </Link>
                      <Link href={`/payments/checkout?bookingId=${booking.id}`}>
                        <Button size="sm">Pagar Stripe</Button>
                      </Link>
                      <Link href={`/payments/start?bookingId=${booking.id}&method=mercadopago`}>
                        <Button size="sm" variant="secondary">Pagar MP</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">Panel</h2>
                  <p className="text-muted-foreground">Resumen de tu actividad y próximas reservas</p>
                </div>
                <Link href="/venues">
                  <Button>Reservar una cancha</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardDescription>
                Encontrá y reservá tu próxima cancha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/venues">
                <Button className="w-full">Ver sedes</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unirse a torneo</CardTitle>
              <CardDescription>
                Competí en próximos torneos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tournaments">
                <Button className="w-full" variant="outline">
                  Ver torneos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Obtener abono</CardTitle>
              <CardDescription>
                Ahorrá con planes de membresía
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/subscriptions">
                <Button className="w-full" variant="outline">
                  Ver planes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

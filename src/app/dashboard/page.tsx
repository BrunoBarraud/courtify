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

  const {
    data: { session },
  } = await supabase.auth.getSession()

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
    .select(
      `
      *,
      court:courts(*, venue:venues(*))
    `
    )
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                ¡Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}! 👋
              </h1>
              <p className="text-muted-foreground">Esto es lo que está pasando con tus reservas</p>
            </div>
            <Link href="/bookings/new">
              <Button size="lg" className="gap-2">
                <Calendar className="h-4 w-4" />
                Nueva reserva
              </Button>
            </Link>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas activas</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBookings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Próximas confirmadas</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total reservas</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Historial completo</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonos</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Próximamente</p>
            </CardContent>
          </Card>
        </div>

        {/* Próximas reservas */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Próximas reservas</CardTitle>
                <CardDescription className="mt-1">
                  Tus próximas reservas de cancha programadas
                </CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{booking.court.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.court.venue.name}</p>
                      <p className="text-sm mt-1 font-medium">
                        {formatDateTimeAR(booking.start_datetime)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-4">
                      <span className="text-lg font-bold whitespace-nowrap">
                        {formatCurrencyARS(booking.final_amount)}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/bookings/${booking.id}`}>
                          <Button size="sm" variant="outline">
                            Ver
                          </Button>
                        </Link>
                        {booking.status !== 'confirmed' && (
                          <Link href={`/payments/start?bookingId=${booking.id}&method=mercadopago`}>
                            <Button size="sm">Pagar</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tenés reservas próximas</h3>
                <p className="text-muted-foreground mb-6">
                  Reservá una cancha para empezar a jugar
                </p>
                <Link href="/venues">
                  <Button size="lg" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Reservar una cancha
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {profile && (profile as { role?: string }).role === 'super_admin' && (
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                  <Trophy className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Panel de Admin</CardTitle>
                <CardDescription>Gestioná usuarios y configuración</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users">
                  <Button className="w-full" variant="secondary">
                    Ir a Administración
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Ver Club</CardTitle>
              <CardDescription>
                Consultá las canchas disponibles, ubicación y toda la info de nuestro club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/venues">
                <Button className="w-full">Ver club</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

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
import { isAdmin } from '@/lib/auth/roles'

export default async function DashboardPage() {
  const supabase = createServerClient(() => cookies())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Perfil del usuario
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Próximas reservas
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      court:courts(*, venue:venues(*))
    `
    )
    .eq('user_id', user.id)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(5)

  // Estadísticas de reservas
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: activeBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .gte('start_datetime', new Date().toISOString())

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Bienvenida */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                ¡Hola, {profile?.full_name?.split(' ')[0] || 'Jugador'}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Resumen de tu actividad en CanchaLibreApp.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full md:w-auto gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-200"
            >
              <Link href="/venues" className="w-full md:w-auto">
                <Calendar className="h-5 w-5" />
                Nueva reserva
              </Link>
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Card className="border-2 border-primary/20 hover:border-primary transition-colors overflow-hidden group relative shadow-sm">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Reservas activas</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black tracking-tight">{activeBookings || 0}</div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Próximas a jugar</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 hover:border-blue-500/50 transition-colors overflow-hidden group relative shadow-sm">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total histórico</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black tracking-tight">{totalBookings || 0}</div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Desde que te uniste</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 hover:border-green-500/50 transition-colors overflow-hidden group relative shadow-sm">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Estado de Socio</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-xl font-bold mt-2 text-foreground">Básico</div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Mejorar plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Próximas reservas */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Card className="border border-border/60 shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Próximas reservas</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Revisá tus turnos confirmados o pendientes de pago.
                  </CardDescription>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto font-medium">
                  <Link href="/bookings">Ver historial completo</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingBookings && upcomingBookings.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {upcomingBookings.map((booking: any) => (
                    <div
                      key={booking.id as string}
                      className="flex flex-wrap items-center justify-between p-4 sm:p-6 hover:bg-muted/40 transition-colors gap-4"
                    >
                      <div className="flex-1 min-w-[280px]">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{booking.court.name}</h3>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-md font-semibold ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}
                          >
                            {booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente Pago'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 truncate">
                          {booking.court.venue.name}
                        </p>
                        <p className="text-base mt-2 font-bold text-foreground">
                          {formatDateTimeAR(booking.start_datetime)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 shrink-0 w-full sm:w-auto">
                        <div className="bg-secondary/50 px-4 py-2 rounded-lg text-lg font-bold border border-border/50 shrink-0">
                          {formatCurrencyARS(booking.final_amount)}
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto gap-2">
                          <Button asChild variant="outline" className="flex-1 sm:flex-none">
                            <Link href={`/bookings/${booking.id}`}>Detalles</Link>
                          </Button>
                          {booking.status !== 'confirmed' && (
                            <Button
                              asChild
                              className="flex-1 sm:flex-none shadow-md shadow-primary/20"
                            >
                              <Link
                                href={`/payments/start?bookingId=${booking.id}&method=mercadopago`}
                              >
                                Abonar
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 px-4 text-center flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                    <Calendar className="h-10 w-10 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Cancha Libre</h3>
                  <p className="text-muted-foreground text-lg mb-8 max-w-sm">
                    Actualmente no tenés ningún turno pendiente o futuro. ¿Sale un partido esta
                    semana?
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Link href="/venues">Buscar Canchas y Horarios</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {profile && isAdmin(profile.role) && (
            <Card className="border border-border/50 hover:border-primary/50 transition-colors shadow-sm">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 border border-orange-500/20">
                  <Trophy className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Panel de Administración</CardTitle>
                <CardDescription>Gestioná tu sede, canchas y facturación.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin">Ir a Administración</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          <Card className="border border-border/50 hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Ver Sedes</CardTitle>
              <CardDescription>
                Consultá las canchas disponibles, ubicación y toda la info de nuestras sedes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/venues">Ver sedes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

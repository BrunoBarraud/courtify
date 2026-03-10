import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, MapPin, Users, Coins, ArrowLeft, Send } from 'lucide-react'
import { formatCurrencyARS } from '@/lib/i18n/format'

export default async function PublicTournamentPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient(() => cookies())

  // Get current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Fetch tournament + venue info
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(
      `
       *,
       venue:venues(id, name, city, address)
    `
    )
    .eq('id', params.id)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Count registered teams
  const { count: registeredCount } = await supabase
    .from('tournament_teams')
    .select('id', { count: 'exact', head: true })
    .eq('tournament_id', tournament.id)

  const spotsLeft = tournament.max_teams - (registeredCount || 0)

  // Verify if current user is captain of any team in THIS tournament
  const { data: userTeam } = session
    ? await supabase
        .from('tournament_teams')
        .select('id, name, status')
        .eq('tournament_id', tournament.id)
        .eq('captain_id', session.user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4 md:px-8 animate-in fade-in duration-500">
        <Link
          href={`/venues/${tournament.venue?.id}`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver a {tournament.venue?.name}
        </Link>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-none bg-transparent">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    tournament.status === 'upcoming'
                      ? 'bg-secondary text-secondary-foreground'
                      : tournament.status === 'registration_open'
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 animate-pulse'
                        : tournament.status === 'in_progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tournament.status === 'registration_open'
                    ? 'Inscripciones Abiertas'
                    : tournament.status === 'upcoming'
                      ? 'Próximamente'
                      : tournament.status === 'in_progress'
                        ? 'En Curso'
                        : 'Finalizado'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground/90">
                {tournament.name}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground text-sm font-medium mb-8">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <Link
                    href={`/venues/${tournament.venue?.id}`}
                    className="hover:underline text-foreground"
                  >
                    {tournament.venue?.name}
                  </Link>{' '}
                  — {tournament.venue?.city}
                </div>
                <div className="hidden sm:block text-border">•</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  {new Date(tournament.start_date).toLocaleDateString('es-AR')} al{' '}
                  {new Date(tournament.end_date).toLocaleDateString('es-AR')}
                </div>
              </div>

              <div className="prose dark:prose-invert prose-p:leading-relaxed prose-p:text-muted-foreground max-w-none whitespace-pre-line bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground mb-4">
                  <Trophy className="h-5 w-5 text-yellow-500" /> Reglas y Formato
                </h3>
                {tournament.description ||
                  'El organizador aún no ha detallado las reglas del torneo.'}
              </div>
            </Card>
          </div>

          {/* Sidebar Sticky Card */}
          <div className="md:col-span-1">
            <Card className="sticky top-24 border-border/60 shadow-lg overflow-hidden translate-y-2">
              <div className="bg-primary/5 h-2 w-full" />
              <CardHeader className="bg-card">
                <CardTitle className="text-xl">Inscripción</CardTitle>
                <CardDescription>Anotá a tu equipo para participar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4 bg-muted/20 pb-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" /> Cupos Disponibles
                    </span>
                    <span className="font-bold text-lg">
                      {spotsLeft} / {tournament.max_teams}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Coins className="h-4 w-4" /> Costo por Equipo
                    </span>
                    <span className="font-bold text-xl text-primary">
                      {formatCurrencyARS(tournament.registration_fee)}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  {tournament.status !== 'registration_open' ? (
                    <div className="bg-background border border-border/60 rounded-xl p-4 text-center text-sm font-medium text-muted-foreground">
                      Las inscripciones no están disponibles en este momento.
                    </div>
                  ) : !session ? (
                    <Link href={`/auth/signin?next=/tournaments/${tournament.id}`}>
                      <Button className="w-full h-12 text-base font-bold shadow-md">
                        Iniciar Sesión para Inscribirse
                      </Button>
                    </Link>
                  ) : userTeam ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl text-center space-y-2">
                      <h4 className="font-bold text-base">¡Equipo Inscripto!</h4>
                      <p className="text-sm">
                        Vos sos el capitán de <strong>{userTeam.name}</strong>. Estado:{' '}
                        {userTeam.status === 'pending'
                          ? 'Pendiente'
                          : userTeam.status === 'approved'
                            ? 'Aprobado'
                            : 'Rechazado'}
                      </p>
                    </div>
                  ) : spotsLeft <= 0 ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center font-bold">
                      Cupos Agotados
                    </div>
                  ) : (
                    <Link href={`/tournaments/${tournament.id}/register`}>
                      <Button className="w-full h-12 text-base font-bold shadow-md gap-2" size="lg">
                        <Send className="h-4 w-4" /> Registrar mi Equipo
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

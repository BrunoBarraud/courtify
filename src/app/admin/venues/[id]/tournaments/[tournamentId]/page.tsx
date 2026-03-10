import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Coins, ArrowLeft, Trophy } from 'lucide-react'
import { formatCurrencyARS } from '@/lib/i18n/format'

export default async function VenueTournamentDetailsPage({
  params,
}: {
  params: { id: string; tournamentId: string }
}) {
  const supabase = createServerClient(() => cookies())

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  // Fetch tournament and confirm ownership implicitly via joined venue query
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*, venue:venues(id, name)')
    .eq('id', params.tournamentId)
    .single()

  if (!tournament || tournament.venue_id !== params.id) notFound()

  // Fetch teams registered
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select(
      `
       *,
       captain:profiles(full_name, email, phone)
    `
    )
    .eq('tournament_id', tournament.id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/venues/${params.id}/tournaments`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
            <span
              className={`px-2 py-0.5 rounded textxs font-bold uppercase tracking-wider ${
                tournament.status === 'upcoming'
                  ? 'bg-secondary text-secondary-foreground'
                  : tournament.status === 'registration_open'
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : tournament.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      : tournament.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                        : 'bg-muted text-muted-foreground' // completed
              }`}
            >
              {tournament.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-muted-foreground">Sede: {tournament.venue.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-1 shadow-sm h-fit">
          <CardHeader className="bg-muted/40 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" /> Datos Principales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {tournament.description || 'Sin descripción'}
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Inicio
                </span>
                <span className="font-medium">
                  {new Date(tournament.start_date).toLocaleDateString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Fin
                </span>
                <span className="font-medium">
                  {new Date(tournament.end_date).toLocaleDateString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" /> Equipos
                </span>
                <span className="font-medium">
                  {(teams || []).length} / {tournament.max_teams}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4" /> Inscripción
                </span>
                <span className="font-medium text-primary">
                  {formatCurrencyARS(tournament.registration_fee)}
                </span>
              </div>
            </div>

            {tournament.status === 'upcoming' && (
              <div className="pt-4 mt-2 border-t text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Para recibir equipos, debe abrir inscripciones.
                </p>
                {/* We will leave buttons as UI stubs without mutation for simplicity scope of UI fixes right now */}
                <Button className="w-full h-9">Abrir Inscripciones</Button>
              </div>
            )}
            {tournament.status === 'registration_open' && (
              <div className="pt-4 mt-2 border-t text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Una vez llenos los cupos, podés sortear cuadros e iniciar.
                </p>
                <Button className="w-full h-9" variant="default">
                  Comenzar Torneo
                </Button>
              </div>
            )}
            {tournament.status === 'in_progress' && (
              <div className="pt-4 mt-2 border-t text-center">
                <Button className="w-full h-9" variant="secondary">
                  Ver Cuadro y Resultados
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams List */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Equipos Inscriptos</CardTitle>
            <CardDescription>
              Aprobá las solicitudes pendientes y gestioná los capitanes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!teams || teams.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                Aún no hay equipos inscriptos para este torneo.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {teams.map((team: Record<string, any>, i: number) => (
                  <div
                    key={team.id}
                    className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{team.name}</h4>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          Capt: {team.captain?.full_name || 'Desconocido'} •{' '}
                          {team.captain?.phone || team.captain?.email || 'Sin contacto'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          team.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                            : team.status === 'approved'
                              ? 'bg-green-500/20 text-green-700 border border-green-500/30'
                              : 'bg-red-500/20 text-red-700 border border-red-500/30'
                        }`}
                      >
                        {team.status === 'pending'
                          ? 'Pendiente'
                          : team.status === 'approved'
                            ? 'Aprobado'
                            : 'Rechazado'}
                      </span>
                      {team.status === 'pending' && tournament.status === 'registration_open' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" className="h-8">
                            Aprobar
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8">
                            Rechazar
                          </Button>
                        </div>
                      )}
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

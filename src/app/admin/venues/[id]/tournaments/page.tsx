import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, ArrowLeft, Users, Calendar } from 'lucide-react'
import { formatCurrencyARS } from '@/lib/i18n/format'

export default async function VenueTournamentsPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient(() => cookies())

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/auth/signin')

  // Verify venue and permissions
  const { data: venue } = await supabase
    .from('venues')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (!venue) notFound()

  // Fetch tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('venue_id', venue.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/venues/${venue.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Torneos - {venue.name}</h1>
          <p className="text-muted-foreground">Administrá los torneos y sus fases en tu sede.</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Historial de Torneos
        </h2>
        <Link href={`/admin/venues/${venue.id}/tournaments/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Torneo
          </Button>
        </Link>
      </div>

      {!tournaments || tournaments.length === 0 ? (
        <Card className="border-dashed h-48 flex items-center justify-center">
          <CardContent className="flex flex-col items-center text-center p-6 space-y-2">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-lg">No hay torneos creados</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Animate a crear campeonatos atractivos para incentivar a jugar en tu sede.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t: Record<string, any>) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="line-clamp-1" title={t.name}>
                    {t.name}
                  </CardTitle>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      t.status === 'upcoming'
                        ? 'bg-secondary text-secondary-foreground'
                        : t.status === 'registration_open'
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                          : t.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                            : t.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                              : 'bg-muted text-muted-foreground' // completed
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 min-h-10">
                  {t.description || 'Sin descripción'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Ini: {new Date(t.start_date).toLocaleDateString('es-AR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Equipos máx: {t.max_teams}</span>
                </div>
                {t.registration_fee > 0 && (
                  <div className="inline-block mt-2 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-semibold">
                    Inscripción: {formatCurrencyARS(t.registration_fee)}
                  </div>
                )}
                <div className="pt-4 mt-2 border-t border-border/40">
                  <Link href={`/admin/venues/${venue.id}/tournaments/${t.id}`}>
                    <Button variant="outline" className="w-full h-9">
                      Administrar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

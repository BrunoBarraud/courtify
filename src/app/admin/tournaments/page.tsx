import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createServerClient, createAdminClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, MapPin, Users } from 'lucide-react'
import { SupabaseClient } from '@supabase/supabase-js'

type TournamentWithVenue = {
  id: string
  name: string
  status: string
  start_date: string
  end_date: string
  max_teams: number
  venue: { id: string; name: string } | null
}

export const dynamic = 'force-dynamic'

export default async function SuperAdminTournamentsPage() {
  const supabase = createServerClient(() => cookies())
  const admin = createAdminClient()

  // Verify super admin
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  const { data: profile } = await (admin as SupabaseClient)
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return notFound()
  }

  // Get all tournaments with venue names
  const { data: tournaments } = await (admin as SupabaseClient)
    .from('tournaments')
    .select(
      `
       *,
       venue:venues(id, name)
    `
    )
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Torneos Globales</h1>
          <p className="text-muted-foreground">
            Monitoreá los torneos organizados por todas las sedes de la red.
          </p>
        </div>
      </div>

      {!tournaments || tournaments.length === 0 ? (
        <Card className="border-dashed h-48 flex items-center justify-center">
          <CardContent className="flex flex-col items-center text-center p-6 space-y-2">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-lg">No hay torneos activos</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Las sedes (Venue Admins) todavía no han registrado ningún evento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments?.map((t: TournamentWithVenue) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="line-clamp-1 flex-1 pr-2" title={t.name}>
                    {t.name}
                  </CardTitle>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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
                <CardDescription className="text-primary font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {t.venue?.name || 'Sede borrada o no asignada'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(t.start_date).toLocaleDateString('es-AR')} -{' '}
                    {new Date(t.end_date).toLocaleDateString('es-AR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Max: {t.max_teams} Equipos</span>
                </div>

                <div className="pt-4 mt-2 border-t border-border/40">
                  {t.venue?.id ? (
                    <Link href={`/admin/venues/${t.venue.id}/tournaments/${t.id}`}>
                      <Button variant="outline" className="w-full h-9">
                        Supervisar en la Sede
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full h-9" disabled>
                      Sede Indisponible
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

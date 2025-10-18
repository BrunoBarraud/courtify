import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export default async function VenueDetailPage({ params }: Props) {
  const supabase = createServerClient(() => cookies())

  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !venue) {
    notFound()
  }

  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('venue_id', venue.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
        <p className="text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" /> {venue.address}, {venue.city}{venue.state ? `, ${venue.state}` : ''}, {venue.country}
        </p>
      </div>

      {venue.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={venue.cover_image_url} alt={venue.name} className="mb-8 h-64 w-full rounded-lg object-cover" />
      ) : null}

      {venue.description ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
            <CardDescription>Conocé más sobre la sede</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{venue.description}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Canchas disponibles</CardTitle>
          <CardDescription>Elegí una cancha para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          {courts && courts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((c: any) => (
                <div key={c.id} className="p-4 border rounded-lg">
                  <div className="font-semibold mb-1">{c.name}</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Tipo: {c.court_type} • {c.is_indoor ? 'Techada' : 'Al aire libre'}
                  </div>
                  <div className="text-sm font-medium mb-3">${'{'}c.hourly_rate{'}'} por hora</div>
                  <Link href={`/bookings/new?venueId=${'{'}venue.id{'}'}&courtId=${'{'}c.id{'}'}`}>
                    <Button className="w-full">Reservar</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No hay canchas activas.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

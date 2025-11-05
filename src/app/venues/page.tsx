import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VenuesPage() {
  const supabase = createServerClient(() => cookies())

  const { data: venues, error } = await supabase
    .from('venues')
    .select('id, name, slug, city, country, description, cover_image_url')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-[720px]">
          <Card>
            <CardHeader>
              <CardTitle>Error al cargar sedes</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intentá recargar la página más tarde.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sedes disponibles</h1>
        <p className="mt-2 text-muted-foreground">
          Encontrá y reservá en tu sede favorita
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(venues ?? []).map((v) => (
          <Card key={v.id} className="overflow-hidden">
            {v.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.cover_image_url}
                alt={v.name}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 w-full bg-muted" />
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{v.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {v.city}, {v.country}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground mb-4">
                {v.description ?? 'Sin descripción'}
              </p>
              <Link href={`/venues/${v.slug}`}>
                <Button className="w-full">Reservar</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!venues || venues.length === 0) && (
        <div className="mx-auto mt-12 max-w-[720px] text-center text-muted-foreground">
          No hay sedes activas disponibles por el momento.
        </div>
      )}
    </div>
  )
}

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
type VenueTournament = {
  id: string
  name: string
  status: string
  description: string
  start_date: string
  max_teams: number
  registration_fee: number
}
import { MapPin, Phone, Mail, Clock, Wifi, Car, Users, Coffee, Trophy } from 'lucide-react'

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

  type Court = {
    id: string
    name: string
    court_type: string
    is_indoor: boolean
    hourly_rate: number
  }

  const getPlayersLabel = (courtType: string) => {
    if (courtType === 'Fútbol 5') return '5 vs 5'
    if (courtType === 'Fútbol 7') return '7 vs 7'
    if (courtType === 'Fútbol 11') return '11 vs 11'
    return null
  }

  // Fetch upcoming/active tournaments for this venue
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('venue_id', venue.id)
    .in('status', ['upcoming', 'registration_open', 'in_progress'])
    .order('start_date', { ascending: true })

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* --- ESTRUCTURA TIPO FACEBOOK --- */}
      <div className="bg-background mb-8 shadow-sm">
        {/* 1. LA FOTO DE PORTADA (Banner) */}
        {/* Ya no tiene texto encima, así que no necesita un overlay oscuro fuerte */}
        <div className="relative h-[220px] md:h-[400px] w-full bg-muted overflow-hidden">
          {venue.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.cover_image_url}
              alt="Portada"
              className="h-full w-full object-contain md:object-cover bg-black"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center">
              <MapPin className="h-20 w-20 text-primary/20" />
            </div>
          )}
        </div>

        {/* 2. CONTENEDOR DE INFO (Avatar + Texto + Acciones) */}
        {/* Este contenedor está sobre el fondo blanco */}
        <div className="container px-4 md:px-8 pb-6 relative">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            {/* A. EL AVATAR (Foto de Perfil) */}
            {/* Usamos margen negativo superior (-mt) para subirlo y que pise el banner */}
            <div className="-mt-24 md:-mt-32 relative z-10 flex-shrink-0 mx-auto md:mx-0">
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-2xl ring-4 ring-background bg-card">
                {venue.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={venue.profile_image_url}
                    alt="Perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center border border-border/50">
                    <MapPin className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* B. LA INFORMACIÓN Y ACCIONES */}
            {/* Texto oscuro sobre fondo blanco */}
            <div className="flex-1 pt-2 md:pt-6 text-center md:text-left w-full">
              {/* Título y Ubicación */}
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2 line-clamp-2 md:line-clamp-1">
                {venue.name}
              </h1>

              {/* C. BARRA DE ACCIONES (Botones tipo FB) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {venue.phone && (
                  <Button
                    variant="secondary"
                    asChild
                    className="gap-2 font-semibold text-foreground"
                  >
                    <a href={`tel:${venue.phone}`}>
                      <Phone className="h-4 w-4" />
                      Llamar
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Opcional: Una línea divisoria tipo pestañas de navegación de FB */}
          <div className="mt-8 border-t pt-4 hidden md:flex gap-6 text-sm font-semibold text-muted-foreground">
            <div className="text-primary border-b-2 border-primary pb-2 px-1 cursor-pointer">
              Canchas y Servicios
            </div>
            <div className="hover:text-foreground pb-2 px-1 cursor-pointer">Información</div>
            <div className="hover:text-foreground pb-2 px-1 cursor-pointer">Fotos</div>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* Descripción */}
        {venue.description && (
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {venue.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Novedades / Torneos */}
        {tournaments && tournaments.length > 0 && (
          <div id="torneos" className="animate-in fade-in duration-500">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Novedades y Torneos
                </h2>
                <p className="text-muted-foreground">Competí y demostrá tu nivel</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((tournament: VenueTournament) => (
                <Card
                  key={tournament.id}
                  className="overflow-hidden border-border/60 hover:shadow-md transition-all"
                >
                  <CardHeader className="bg-muted/40 pb-4 border-b">
                    <CardTitle className="line-clamp-1">{tournament.name}</CardTitle>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {tournament.status === 'upcoming'
                        ? 'Próximamente'
                        : tournament.status === 'registration_open'
                          ? 'Inscripciones Abiertas'
                          : 'En Curso'}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4 flex flex-col justify-between h-full">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {tournament.description || 'Torneo organizado por la sede.'}
                    </p>

                    <Link href={`/tournaments/${tournament.id}`} className="w-full mt-auto">
                      <Button
                        variant={tournament.status === 'registration_open' ? 'default' : 'outline'}
                        className="w-full hover:scale-[1.02] transition-transform"
                      >
                        Ver Detalles
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Canchas Disponibles */}
        <div id="canchas">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Canchas Disponibles</h2>
              <p className="text-muted-foreground">Elegí donde jugar</p>
            </div>
          </div>

          {courts && courts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((c: Court) => (
                <Card
                  key={c.id}
                  className="overflow-hidden shadow-sm hover:shadow-md border-border/60 transition-all duration-300 group flex flex-col"
                >
                  {/* Imagen de la cancha */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {/* (Acá iría la foto real de la cancha si tuvieras) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>

                    <div className="absolute bottom-4 left-4 z-20">
                      <h3 className="text-white font-bold text-xl">{c.name}</h3>
                      <p className="text-white/80 text-sm">{c.court_type}</p>
                    </div>

                    {/* Badge techada */}
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-white uppercase tracking-wider z-20">
                      {c.is_indoor ? 'Techada' : 'Aire libre'}
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {getPlayersLabel(c.court_type) ?? ''}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${c.hourly_rate}{' '}
                        <span className="text-xs font-normal text-muted-foreground">/h</span>
                      </div>
                    </div>

                    <Link
                      href={`/bookings/new?venueId=${venue.id}&courtId=${c.id}`}
                      className="w-full block mt-2"
                    >
                      <Button className="w-full gap-2" variant="default">
                        Reservar Turno
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed bg-muted/30">
              <p className="text-muted-foreground">No hay canchas habilitadas.</p>
            </Card>
          )}
        </div>

        {/* Servicios e Instalaciones (Grid más simple tipo FB) */}
        <div>
          <h2 className="text-xl font-bold mb-4">Servicios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Podrías hacer esto dinámico si tenés los datos en la DB */}
            {[
              { icon: Car, label: 'Estacionamiento' },
              { icon: Users, label: 'Vestuarios' },
              { icon: Coffee, label: 'Bufet' },
              { icon: Wifi, label: 'WiFi' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start mb-8">
          {/* Mapa ocupa 2 columnas */}
          <Card className="md:col-span-2 overflow-hidden">
            <div className="aspect-[16/9] w-full bg-muted relative">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  }&q=${encodeURIComponent(venue.address + ', ' + venue.city)}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              )}
            </div>
          </Card>

          {/* Info de contacto ocupa 1 columna */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{venue.address}</p>
                  <p className="text-sm text-muted-foreground">{venue.city}</p>
                </div>
              </div>
              {venue.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                  <a href={`tel:${venue.phone}`} className="hover:underline">
                    {venue.phone}
                  </a>
                </div>
              )}
              {venue.email && (
                <div className="flex items-center gap-3 break-all">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${venue.email}`} className="hover:underline">
                    {venue.email}
                  </a>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Horarios
                </h4>
                <p className="text-sm text-muted-foreground">Lun a Vie: 08:00 - 23:00</p>
                <p className="text-sm text-muted-foreground">Sáb y Dom: 09:00 - 00:00</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

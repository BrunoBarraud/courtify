import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import VenuesList from '@/components/venues/VenuesList'

export const dynamic = 'force-dynamic'

export default async function VenuesPage() {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()

  // Obtener todas las sedes activas
  const { data: venues } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    
  let favorites: string[] = []

  // Si hay sesión, cargar los favoritos de este usuario
  if (session) {
    const { data: favs } = await supabase
      .from('user_favorite_venues')
      .select('venue_id')
      .eq('user_id', session.user.id)
    
    if (favs) {
      favorites = favs.map(f => f.venue_id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Buscá tu sede ideal
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explorá nuestras distintas sedes, marcá tus favoritas y agendá tu próximo partido en el momento.
          </p>
        </div>

        <VenuesList 
          initialVenues={venues || []} 
          initialFavorites={favorites} 
        />
      </div>
    </div>
  )
}

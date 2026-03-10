'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Heart } from 'lucide-react'

// Basic venue type interface
interface Venue {
  id: string
  name: string
  slug?: string
  city?: string
  address?: string
  cover_image_url?: string
}

type VenueListProps = {
  initialVenues: Venue[]
  initialFavorites: string[]
}

export default function VenuesList({ initialVenues, initialFavorites }: VenueListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [venues] = useState(initialVenues)
  const [favorites, setFavorites] = useState<Set<string>>(new Set(initialFavorites))

  const toggleFavorite = async (venueId: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    const isFav = favorites.has(venueId)
    
    // Optistic update
    const newFavs = new Set(favorites)
    if (isFav) {
      newFavs.delete(venueId)
    } else {
      newFavs.add(venueId)
    }
    setFavorites(newFavs)

    // API Call
    try {
      await fetch(`/api/venues/${venueId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: isFav ? 'remove' : 'add' }),
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revert if failed (simple version, not strictly necessary for this demo)
    }
  }

  // Filter venues
  const filteredVenues = venues.filter((v: Venue) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort: Favorites first
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    const aFav = favorites.has(a.id)
    const bFav = favorites.has(b.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Buscar por nombre, ciudad o dirección..."
          className="pl-10 h-12 rounded-full text-base shadow-sm border-border/60 focus-visible:ring-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {sortedVenues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No se encontraron sedes con esa búsqueda.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedVenues.map((venue) => {
            const isFav = favorites.has(venue.id)
            return (
              <Link href={`/venues/${venue.slug || venue.id}`} key={venue.id}>
                <Card className="group overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col bg-card/50 backdrop-blur-sm cursor-pointer relative">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {venue.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={venue.cover_image_url}
                        alt={`Portada de ${venue.name}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-primary/10 flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    
                    {/* Botón Favorito Absoluto sobre la imagen */}
                    <button 
                      onClick={(e) => toggleFavorite(venue.id, e)}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50 hover:bg-background transition-colors"
                      aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                      <Heart className={`h-5 w-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                        {venue.name}
                      </h3>
                    </div>
                    
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-auto pt-4">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{venue.address}{venue.city && `, ${venue.city}`}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

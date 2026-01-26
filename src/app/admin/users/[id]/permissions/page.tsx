'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { VenueAdminPermissions, DEFAULT_VENUE_ADMIN_PERMISSIONS } from '@/lib/auth/roles'

interface Venue {
  id: string
  name: string
  permissions: VenueAdminPermissions
}

export default function UserPermissionsPage({ params }: { params: { id: string } }) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadVenuePermissions = async () => {
      // Cargar sedes y permisos del usuario
      const { data: venueAdmins } = await supabase
        .from('venue_admins')
        .select(
          `
          venue:venues(id, name),
          permissions
        `
        )
        .eq('user_id', params.id)

      if (venueAdmins) {
        const formattedVenues = venueAdmins
          .map(va => ({
            id: va.venue?.[0]?.id || '',
            name: va.venue?.[0]?.name || '',
            permissions: va.permissions || DEFAULT_VENUE_ADMIN_PERMISSIONS,
          }))
          .filter(v => v.id !== '')

        setVenues(formattedVenues)
      }

      setLoading(false)
    }

    loadVenuePermissions()
  }, [supabase, params.id])

  const updatePermissions = async (venueId: string, permission: keyof VenueAdminPermissions) => {
    setSaving(venueId)
    try {
      const venue = venues.find(v => v.id === venueId)
      if (!venue) return

      const updatedPermissions = {
        ...venue.permissions,
        [permission]: !venue.permissions[permission],
      }

      const { error } = await supabase
        .from('venue_admins')
        .update({ permissions: updatedPermissions })
        .eq('user_id', params.id)
        .eq('venue_id', venueId)

      if (error) throw error

      setVenues(venues.map(v => (v.id === venueId ? { ...v, permissions: updatedPermissions } : v)))

      toast.success('Permisos actualizados')
    } catch (error) {
      toast.error('Error al actualizar permisos')
      console.error('Error updating permissions:', error)
    } finally {
      setSaving(null)
    }
  }

  const permissionLabels: Record<keyof VenueAdminPermissions, string> = {
    can_manage_bookings: 'Gestionar Reservas',
    can_manage_courts: 'Gestionar Canchas',
    can_manage_staff: 'Gestionar Personal',
    can_view_reports: 'Ver Reportes',
    can_manage_pricing: 'Gestionar Precios',
    can_cancel_bookings: 'Cancelar Reservas',
  }

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Permisos</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <div className="grid gap-6">
        {venues.map(venue => (
          <Card key={venue.id}>
            <CardHeader>
              <CardTitle>{venue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {(Object.keys(permissionLabels) as Array<keyof VenueAdminPermissions>).map(
                  permission => (
                    <div key={permission} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{permissionLabels[permission]}</p>
                      </div>
                      <Switch
                        checked={venue.permissions[permission]}
                        onCheckedChange={() => updatePermissions(venue.id, permission)}
                        disabled={saving === venue.id}
                      />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

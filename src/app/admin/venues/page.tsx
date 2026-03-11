'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Venue {
  id: string
  name: string
  address: string
  city: string
  country: string
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create venue form state
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [openTime, setOpenTime] = useState('08:00')
  const [closeTime, setCloseTime] = useState('23:00')
  const [saving, setSaving] = useState(false)

  const loadVenues = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/venues')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las sedes')
      setVenues(data.venues || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando sedes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVenues()
  }, [])

  const onCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          city,
          country,
          open_time: openTime,
          close_time: closeTime,
          is_active: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo crear la sede')
      setName('')
      setAddress('')
      setCity('')
      setCountry('')
      setOpenTime('08:00')
      setCloseTime('23:00')
      await loadVenues()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error creando sede')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sedes</h1>
        <Button variant="outline" onClick={loadVenues} disabled={loading}>
          Recargar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Sede</CardTitle>
          <CardDescription>Añadí una nueva sede a la red de tu club</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={onCreateVenue} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openTime">Horario de Apertura</Label>
              <Input
                id="openTime"
                type="time"
                value={openTime}
                onChange={e => setOpenTime(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Horario de Cierre</Label>
              <Input
                id="closeTime"
                type="time"
                value={closeTime}
                onChange={e => setCloseTime(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="submit" disabled={saving} className="shadow-sm">
                {saving ? 'Creando...' : 'Crear Sede'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Tus sedes activas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : venues.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay sedes aún.</div>
          ) : (
            <div className="grid gap-3">
              {venues.map(v => (
                <div
                  key={v.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-md overflow-hidden"
                >
                  <div className="min-w-0 flex-1 w-full overflow-hidden">
                    <div className="font-semibold truncate">{v.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {v.address} • {v.city}, {v.country}
                    </div>
                  </div>
                  <Link href={`/admin/venues/${v.id}`} className="shrink-0 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      Gestionar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

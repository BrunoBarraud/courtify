'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const venueIdParam = searchParams.get('venueId') || ''
  const presetCourtId = searchParams.get('courtId') || ''

  const [selectedVenueId, setSelectedVenueId] = useState(venueIdParam)
  const [courtId, setCourtId] = useState('')
  const [startDatetime, setStartDatetime] = useState('')
  const [endDatetime, setEndDatetime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  type VenueLite = { id: string; name: string; city: string; country: string }
  type CourtLite = { id: string; name: string; court_type: string; is_indoor: boolean }
  const [venues, setVenues] = useState<VenueLite[]>([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [courts, setCourts] = useState<CourtLite[]>([])
  const [loadingCourts, setLoadingCourts] = useState(false)
  const [date, setDate] = useState<string>('')
  const [slots, setSlots] = useState<Array<{ start: string; end: string; available: boolean; price: number }>>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)

  useEffect(() => {
    // Prefill date with today by default
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm}-${dd}`)
  }, [])

  useEffect(() => {
    // Load venues if none preselected
    const fetchVenues = async () => {
      if (selectedVenueId) return
      setLoadingVenues(true)
      try {
        const res = await fetch(`/api/venues`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las sedes')
        setVenues(data.venues || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando sedes')
      } finally {
        setLoadingVenues(false)
      }
    }
    fetchVenues()
  }, [selectedVenueId])

  useEffect(() => {
    const fetchCourts = async () => {
      if (!selectedVenueId) return
      setLoadingCourts(true)
      try {
        const res = await fetch(`/api/venues/${selectedVenueId}/courts`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las canchas')
        const list = data.courts || []
        setCourts(list)
        if (!presetCourtId && list.length === 1) {
          setCourtId(list[0].id)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando canchas')
      } finally {
        setLoadingCourts(false)
      }
    }
    fetchCourts()
  }, [selectedVenueId, presetCourtId])

  useEffect(() => {
    if (presetCourtId) setCourtId(presetCourtId)
  }, [presetCourtId])

  const onChangeStart = (val: string) => {
    setStartDatetime(val)
    if (!val) return
    const start = new Date(val)
    if (isNaN(start.getTime())) return
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const iso = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setEndDatetime(iso)
  }

  // Load availability slots when court and date are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!courtId || !date) return
      setLoadingSlots(true)
      try {
        const res = await fetch(`/api/courts/${courtId}/availability?date=${date}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'No se pudo obtener disponibilidad')
        setSlots(data.slots || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error obteniendo disponibilidad')
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchAvailability()
  }, [courtId, date])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId,
          startDatetime: new Date(startDatetime).toISOString(),
          endDatetime: new Date(endDatetime).toISOString(),
          notes: notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo crear la reserva')
        return
      }
      const bookingId = data.booking?.id
      if (!bookingId) {
        setError('Reserva creada pero falta el identificador de la reserva')
        return
      }
      // Ofrecer opciones de pago
      setCreatedBookingId(bookingId)
    } catch {
      setError('Ocurrió un error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Nueva reserva</CardTitle>
          <CardDescription>Completá los datos para generar tu reserva y continuar al pago.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
            )}

            {selectedVenueId ? (
              <div className="space-y-2">
                <Label htmlFor="courtSelect">Cancha</Label>
                <select
                  id="courtSelect"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={courtId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCourtId(e.target.value)}
                  disabled={loadingCourts || loading}
                  required
                >
                  <option value="" disabled>
                    {loadingCourts ? 'Cargando canchas...' : 'Seleccioná una cancha'}
                  </option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} • {c.court_type} {c.is_indoor ? '• Techada' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="venueSelect">Sede</Label>
                <select
                  id="venueSelect"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedVenueId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setSelectedVenueId(e.target.value)
                    setCourtId('')
                  }}
                  disabled={loadingVenues || loading}
                  required
                >
                  <option value="" disabled>
                    {loadingVenues ? 'Cargando sedes...' : 'Seleccioná una sede'}
                  </option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} • {v.city}, {v.country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Inicio</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={startDatetime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeStart(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Fin</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={endDatetime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDatetime(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Availability by date */}
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                disabled={loading}
              />
              {date && courtId && (
                <div className="mt-3">
                  <div className="mb-2 text-sm text-muted-foreground">
                    {loadingSlots ? 'Cargando horarios...' : 'Horarios disponibles'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slots.filter(s => s.available).length === 0 && !loadingSlots ? (
                      <span className="text-sm text-muted-foreground">No hay horarios disponibles.</span>
                    ) : (
                      slots.filter(s => s.available).map((s) => {
                        const startLocal = new Date(s.start)
                        const endLocal = new Date(s.end)
                        const label = `${startLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        return (
                          <Button
                            key={s.start}
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Set start/end fields from slot (convert to local input value format)
                              const toInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                              setStartDatetime(toInput(startLocal))
                              setEndDatetime(toInput(endLocal))
                            }}
                          >
                            {label}
                          </Button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Ej: Traer pelotas"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creando...' : 'Crear reserva'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/venues')}>
                Ver sedes
              </Button>
            </div>

            {createdBookingId && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="text-sm text-muted-foreground">Elegí un método de pago</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="button" onClick={() => router.push(`/payments/start?bookingId=${createdBookingId}&method=mercadopago`)} className="flex-1">
                    Pagar con Mercado Pago
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => router.push(`/payments/checkout?bookingId=${createdBookingId}`)} className="flex-1">
                    Pagar con Stripe
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

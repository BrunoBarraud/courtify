'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Banknote, CreditCard, Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  type CourtLite = { id: string; name: string; court_type: string; is_indoor: boolean }
  const [courts, setCourts] = useState<CourtLite[]>([])
  const [loadingCourts, setLoadingCourts] = useState(false)
  const [date, setDate] = useState<string>('')
  const [slots, setSlots] = useState<
    Array<{ start: string; end: string; available: boolean; price: number }>
  >([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [showCashDialog, setShowCashDialog] = useState(false)

  useEffect(() => {
    // Prefill date with today by default
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm}-${dd}`)
  }, [])

  useEffect(() => {
    // Auto-load la única sede disponible
    const fetchDefaultVenue = async () => {
      if (selectedVenueId) return
      try {
        const res = await fetch(`/api/venues`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las sedes')
        const venues = data.venues || []

        // Cargar la primera (y única) sede
        if (venues.length > 0) {
          setSelectedVenueId(venues[0].id)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando sede')
      }
    }
    fetchDefaultVenue()
  }, [])

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
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Nueva reserva</CardTitle>
          <CardDescription>
            Completá los datos para generar tu reserva y continuar al pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="courtSelect" className="text-base font-semibold">
                Cancha
              </Label>
              <select
                id="courtSelect"
                className="w-full rounded-md border-2 border-input bg-background px-3 py-2.5 text-sm focus:border-primary transition-colors"
                value={courtId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCourtId(e.target.value)}
                disabled={loadingCourts || loading}
                required
              >
                <option value="" disabled>
                  {loadingCourts ? 'Cargando canchas...' : 'Seleccioná una cancha'}
                </option>
                {courts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.court_type} {c.is_indoor ? '• Techada' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-base font-semibold">
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                disabled={loading}
                className="border-2"
              />
            </div>

            {date && courtId && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  {loadingSlots ? 'Cargando horarios...' : 'Horarios disponibles'}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {slots.filter(s => s.available).length === 0 && !loadingSlots ? (
                    <div className="w-full p-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-md">
                      No hay horarios disponibles para esta fecha.
                    </div>
                  ) : (
                    slots
                      .filter(s => s.available)
                      .map(s => {
                        const startLocal = new Date(s.start)
                        const endLocal = new Date(s.end)
                        const label = `${startLocal.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - ${endLocal.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                        const isSelected =
                          startDatetime &&
                          new Date(startDatetime).getTime() === startLocal.getTime()
                        return (
                          <Button
                            key={s.start}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            className="border-2"
                            onClick={() => {
                              const toInput = (d: Date) =>
                                new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)
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

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Notas (opcional)
              </Label>
              <Input
                id="notes"
                placeholder="Ej: Traer pelotas"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                disabled={loading}
                className="border-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !startDatetime}
                className="flex-1"
                size="lg"
              >
                {loading ? 'Creando...' : 'Crear reserva'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/venues')}
                size="lg"
              >
                Cancelar
              </Button>
            </div>

            {createdBookingId && (
              <div className="mt-6 space-y-4 border-t-2 pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">¡Reserva creada!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Elegí un método de pago para confirmar
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/payments/start?bookingId=${createdBookingId}&method=mercadopago`
                      )
                    }
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Wallet className="h-4 w-4" />
                    Mercado Pago
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(`/payments/checkout?bookingId=${createdBookingId}`)}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4" />
                    Stripe
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCashDialog(true)}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Banknote className="h-4 w-4" />
                    Efectivo
                  </Button>
                </div>
              </div>
            )}

            {/* Dialog para pago en efectivo */}
            <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-primary" />
                    Pago en Efectivo
                  </DialogTitle>
                  <DialogDescription className="space-y-4 pt-4">
                    <div className="rounded-lg bg-primary/10 p-4 border-2 border-primary/20">
                      <p className="text-foreground font-medium mb-2">
                        Tu reserva ha sido creada exitosamente.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Para confirmarla, deberás realizar el pago en efectivo en:
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Secretaría del complejo</p>
                          <p className="text-sm text-muted-foreground">
                            Horario: Lunes a Viernes 9:00 - 18:00hs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Pórtico de entrada</p>
                          <p className="text-sm text-muted-foreground">Al momento de tu reserva</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-yellow-500/10 p-4 border border-yellow-500/20">
                      <p className="text-sm text-foreground">
                        <strong>Importante:</strong> Tu reserva quedará en estado &quot;Pendiente de
                        pago&quot; hasta que se confirme el pago en efectivo.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCashDialog(false)}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCashDialog(false)
                      router.push('/bookings')
                    }}
                    className="flex-1"
                  >
                    Entendido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

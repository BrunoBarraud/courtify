'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const BOOKING_STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
const PAYMENT_STATUS_OPTIONS = ['pending', 'processing', 'completed', 'failed', 'refunded']

type PaymentRow = {
  id: string
  payment_status: string
  amount: number
  payment_method: string | null
  created_at: string
}

type BookingRow = {
  id: string
  bookingNumber: string
  status: string
  startDatetime: string
  endDatetime: string
  totalAmount: number
  finalAmount: number
  venueId: string | null
  venueName: string | null
  court: {
    id: string
    name: string
  } | null
  customer: {
    id: string
    fullName: string | null
    email: string | null
  } | null
  payments: PaymentRow[]
  latestPayment: PaymentRow | null
}

type ApiResponse = {
  bookings: BookingRow[]
  total: number
  venues: Array<{ id: string; name: string | null }>
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const highlightParam = searchParams.get('highlight')

  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [venues, setVenues] = useState<Array<{ id: string; name: string | null }>>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [venueFilter, setVenueFilter] = useState('')
  const [search, setSearch] = useState('')

  const [autoHighlightedId, setAutoHighlightedId] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: '50' })
    if (statusFilter) params.set('status', statusFilter)
    if (paymentFilter) params.set('paymentStatus', paymentFilter)
    if (venueFilter) params.set('venueId', venueFilter)
    if (search.trim()) params.set('search', search.trim())
    return params.toString()
  }, [statusFilter, paymentFilter, venueFilter, search])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings?${queryString}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        const errorMessage =
          typeof json === 'object' && json && 'error' in json && typeof (json as { error?: unknown }).error === 'string'
            ? (json as { error: string }).error
            : 'No se pudieron cargar las reservas'
        throw new Error(errorMessage)
      }

      const data = json as ApiResponse
      setBookings(data.bookings)
      setTotal(data.total)
      setVenues(data.venues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString])

  useEffect(() => {
    if (!highlightParam) return
    setAutoHighlightedId(highlightParam)
    const timeout = setTimeout(() => setAutoHighlightedId(null), 4000)
    return () => clearTimeout(timeout)
  }, [highlightParam])

  const clearFilters = () => {
    setStatusFilter('')
    setPaymentFilter('')
    setVenueFilter('')
    setSearch('')
    router.replace('/admin/bookings')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Reservas de la sede</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            Recargar
          </Button>
          <Button variant="ghost" onClick={clearFilters} disabled={loading && !statusFilter && !paymentFilter && !venueFilter && !search}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Buscar reserva</label>
              <Input
                placeholder="Número de reserva..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Estado reserva</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value)}
                disabled={loading}
              >
                <option value="">Todos</option>
                {BOOKING_STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Estado pago</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={paymentFilter}
                onChange={event => setPaymentFilter(event.target.value)}
                disabled={loading}
              >
                <option value="">Todos</option>
                {PAYMENT_STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Sede</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={venueFilter}
                onChange={event => setVenueFilter(event.target.value)}
                disabled={loading}
              >
                <option value="">Todas</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Total resultados</label>
              <div className="text-lg font-semibold">{loading ? '...' : total}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="p-3 rounded-md border border-destructive text-destructive bg-destructive/10 text-sm">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Reservas recientes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando reservas...</div>
          ) : bookings.length === 0 ? (
            <div className="text-sm text-muted-foreground">No se encontraron reservas con los filtros seleccionados.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Reserva</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Sede / Cancha</th>
                  <th className="py-2 pr-3">Horario</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3">Pago</th>
                  <th className="py-2 pr-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => {
                  const highlight = autoHighlightedId === booking.id
                  const latestPayment = booking.latestPayment
                  return (
                    <tr
                      key={booking.id}
                      id={`booking-${booking.id}`}
                      className={cn('border-b last:border-b-0 transition-colors', highlight && 'bg-primary/10 animate-pulse')}
                    >
                      <td className="py-3 pr-3 align-top">
                        <div className="font-semibold">
                          <Link href={`/admin/bookings/${booking.id}`} className="underline decoration-dotted underline-offset-4">
                            {booking.bookingNumber}
                          </Link>
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {booking.id}</div>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <div className="font-medium">{booking.customer?.fullName || 'Sin nombre'}</div>
                        <div className="text-xs text-muted-foreground">{booking.customer?.email || 'Sin email'}</div>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <div>{booking.venueName || 'Sede desconocida'}</div>
                        <div className="text-xs text-muted-foreground">{booking.court?.name || 'Sin cancha'}</div>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <div>{new Date(booking.startDatetime).toLocaleString('es-AR')}</div>
                        <div className="text-xs text-muted-foreground">
                          Fin: {new Date(booking.endDatetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <div className="capitalize">{booking.status}</div>
                        {highlight && <div className="text-xs text-primary font-medium">Nuevo</div>}
                      </td>
                      <td className="py-3 pr-3 align-top">
                        {latestPayment ? (
                          <div>
                            <div className="capitalize">{latestPayment.payment_status}</div>
                            <div className="text-xs text-muted-foreground">{latestPayment.payment_method || 'Sin método'}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Sin pagos</div>
                        )}
                      </td>
                      <td className="py-3 pr-3 align-top text-right">
                        <div className="font-semibold">${booking.finalAmount.toLocaleString('es-AR')}</div>
                        {booking.totalAmount !== booking.finalAmount && (
                          <div className="text-xs text-muted-foreground">Total: ${booking.totalAmount.toLocaleString('es-AR')}</div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

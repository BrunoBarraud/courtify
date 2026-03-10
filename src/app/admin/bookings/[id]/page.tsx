'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentRow {
  id: string
  payment_number: string
  payment_status: string
  payment_method: string | null
  amount: number
  currency: string
  created_at: string
  metadata: Record<string, unknown> | null
}

interface ParticipantRow {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface BookingDetail {
  id: string
  bookingNumber: string
  status: string
  startDatetime: string
  endDatetime: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  notes: string | null
  metadata: Record<string, unknown> | null
  venue: { id: string; name: string | null } | null
  court: { id: string; name: string } | null
  customer: { id: string; fullName: string | null; email: string | null; phone: string | null } | null
  payments: PaymentRow[]
  participants: ParticipantRow[]
  latestPayment: PaymentRow | null
}

type ApiResponse = {
  booking: BookingDetail
}

type Props = {
  params: {
    id: string
  }
}

export default function AdminBookingDetailPage({ params }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/bookings/${params.id}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) {
          const message =
            typeof json === 'object' && json && 'error' in json && typeof (json as { error?: unknown }).error === 'string'
              ? (json as { error: string }).error
              : 'No se pudo cargar la reserva'
          throw new Error(message)
        }
        const data = json as ApiResponse
        setBooking(data.booking)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [params.id])

  useEffect(() => {
    const highlightId = searchParams.get('highlight')
    if (!highlightId) return
    const target = document.getElementById(highlightId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [searchParams, booking])

  const onBack = () => {
    const highlight = searchParams.get('highlight')
    if (highlight) {
      router.push(`/admin/bookings?highlight=${highlight}`)
    } else {
      router.push('/admin/bookings')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Detalle de reserva</h1>
          <p className="text-sm text-muted-foreground">ID: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Volver</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando información...</div>
      ) : error ? (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md max-w-xl">{error}</div>
      ) : booking ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="block text-muted-foreground text-xs uppercase">Reserva</span>
                  <span className="font-semibold">{booking.bookingNumber}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground text-xs uppercase">Estado</span>
                  <span className="font-semibold capitalize">{booking.status}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground text-xs uppercase">Inicio</span>
                  <span>{new Date(booking.startDatetime).toLocaleString('es-AR')}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground text-xs uppercase">Fin</span>
                  <span>{new Date(booking.endDatetime).toLocaleString('es-AR')}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground text-xs uppercase">Monto final</span>
                  <span className="font-semibold">${booking.finalAmount.toLocaleString('es-AR')}</span>
                </div>
                {booking.totalAmount !== booking.finalAmount && (
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase">Importe original</span>
                    <span>${booking.totalAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="block text-muted-foreground text-xs uppercase">Cliente</span>
                  {booking.customer ? (
                    <div>
                      <div className="font-medium">{booking.customer.fullName || 'Sin nombre'}</div>
                      <div>{booking.customer.email || 'Sin email'}</div>
                      <div>{booking.customer.phone || 'Sin teléfono'}</div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Sin datos</div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="block text-muted-foreground text-xs uppercase">Sede y cancha</span>
                  <div>
                    <div>{booking.venue?.name || 'Sede desconocida'}</div>
                    <div className="text-muted-foreground text-sm">{booking.court?.name || 'Sin cancha'}</div>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="space-y-1 text-sm">
                  <span className="block text-muted-foreground text-xs uppercase">Notas</span>
                  <p className="whitespace-pre-line">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.payments.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sin pagos registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-3">Pago</th>
                        <th className="py-2 pr-3">Estado</th>
                        <th className="py-2 pr-3">Método</th>
                        <th className="py-2 pr-3">Importe</th>
                        <th className="py-2 pr-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.payments.map(payment => {
                        const isLatest = booking.latestPayment?.id === payment.id
                        return (
                          <tr key={payment.id} id={isLatest ? 'latest-payment' : undefined} className="border-b last:border-b-0">
                            <td className="py-2 pr-3">
                              <div className="font-medium">{payment.payment_number}</div>
                              <div className="text-xs text-muted-foreground">ID: {payment.id}</div>
                            </td>
                            <td className="py-2 pr-3 capitalize">{payment.payment_status}</td>
                            <td className="py-2 pr-3">{payment.payment_method || 'Sin método'}</td>
                            <td className="py-2 pr-3">{`${payment.amount.toLocaleString('es-AR')} ${payment.currency}`}</td>
                            <td className="py-2 pr-3">{new Date(payment.created_at).toLocaleString('es-AR')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.participants.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sin participantes agregados.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {booking.participants.map(participant => (
                    <li key={participant.id} className="border rounded-md p-3">
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-muted-foreground text-xs">{participant.email || 'Sin email'}</div>
                      <div className="text-muted-foreground text-xs">{participant.phone || 'Sin teléfono'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Reserva no encontrada.</div>
      )}
    </div>
  )
}

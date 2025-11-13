"use client"

import { ChangeEvent, useState } from 'react'
import { Button } from '@/components/ui/button'

interface CancelSectionProps {
  bookingId: string
  disabled?: boolean
}

export default function CancelSection({ bookingId, disabled }: CancelSectionProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Cancelar reserva' }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cancelar la reserva')
      }

      setMessage(data.message || 'Reserva cancelada correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <textarea
          placeholder="Contanos el motivo de la cancelación"
          value={reason}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
          disabled={disabled || loading}
          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        variant="destructive"
        onClick={handleCancel}
        disabled={disabled || loading || !reason.trim()}
      >
        {loading ? 'Cancelando...' : 'Cancelar reserva'}
      </Button>
    </div>
  )
}

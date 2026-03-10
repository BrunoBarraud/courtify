'use client'

import { ChangeEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CancelQuickButtonProps {
  bookingId: string
  disabled?: boolean
}

export default function CancelQuickButton({ bookingId, disabled }: CancelQuickButtonProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason || 'Cancelar reserva generada por el usuario (desde Mis Reservas)',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cancelar la reserva')
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Reserva</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés cancelar este turno? Escribinos brevemente el motivo de la
            cancelación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <textarea
            placeholder="Motivo de cancelación (opcional)"
            value={reason}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setReason(event.target.value)}
            disabled={loading}
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

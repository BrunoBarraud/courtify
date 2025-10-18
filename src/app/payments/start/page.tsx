'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentStartPage() {
  const search = useSearchParams()
  const router = useRouter()
  const bookingId = search.get('bookingId')
  const subscriptionId = search.get('subscriptionId')
  const method = (search.get('method') || 'mercadopago').toLowerCase()

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = async () => {
      setError(null)
      if (!bookingId && !subscriptionId) {
        setError('Falta el identificador de la reserva o del abono')
        setLoading(false)
        return
      }
      if (!['mercadopago', 'stripe'].includes(method)) {
        setError('Método de pago inválido')
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingId || undefined,
            subscriptionId: subscriptionId || undefined,
            paymentMethod: method,
            currency: 'ARS',
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'No se pudo iniciar el pago')
          setLoading(false)
          return
        }

        if (method === 'mercadopago') {
          if (!data.checkoutUrl) {
            setError('No se recibió la URL de Mercado Pago')
            setLoading(false)
            return
          }
          window.location.href = data.checkoutUrl
          return
        }

        // Stripe → redirigir a nuestro checkout con clientSecret asociado al booking
        router.replace(`/payments/checkout?${bookingId ? `bookingId=${bookingId}` : `subscriptionId=${subscriptionId}`}`)
      } catch (err) {
        setError('Error al iniciar el pago')
        setLoading(false)
      }
    }
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container py-10 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Iniciando pago</CardTitle>
          <CardDescription>
            Te estamos redirigiendo al proveedor de pago seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div>
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">{error}</div>
              <Button onClick={() => router.back()} variant="outline">Volver</Button>
            </div>
          ) : (
            <div>{loading ? 'Preparando...' : 'Listo'}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

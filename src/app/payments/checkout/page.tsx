'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!stripe || !elements) return

    setLoading(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Opcional: páginas de redirección si hiciera falta
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setError(error.message || 'No se pudo confirmar el pago')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Ocurrió un error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}
      <Button type="submit" disabled={!stripe || !elements || loading} className="w-full">
        {loading ? 'Procesando...' : 'Pagar'}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const search = useSearchParams()
  const router = useRouter()
  const bookingId = search.get('bookingId')
  const subscriptionId = search.get('subscriptionId')

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const options: StripeElementsOptions | undefined = useMemo(() => {
    if (!clientSecret) return undefined
    return {
      clientSecret,
      appearance: {
        theme: 'stripe',
        labels: 'floating',
      },
      locale: 'es',
    }
  }, [clientSecret])

  useEffect(() => {
    const init = async () => {
      setError(null)
      if (!bookingId && !subscriptionId) {
        setError('Falta el identificador de la reserva o del abono')
        return
      }
      try {
        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: bookingId || undefined,
            subscriptionId: subscriptionId || undefined,
            paymentMethod: 'stripe',
            currency: 'ARS',
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'No se pudo iniciar el pago')
          return
        }
        if (!data.clientSecret) {
          setError('No se obtuvo clientSecret para el pago')
          return
        }
        setClientSecret(data.clientSecret)
      } catch (err) {
        setError('Error al iniciar el proceso de pago')
      }
    }
    init()
  }, [bookingId, subscriptionId])

  if (!publishableKey) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Configuración requerida</CardTitle>
            <CardDescription>
              Falta definir NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tu entorno.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>
            Completá el pago con tarjeta u otros métodos disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">{error}</div>
          )}
          {clientSecret && stripePromise && options ? (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm />
            </Elements>
          ) : (
            <div>Cargando pago...</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

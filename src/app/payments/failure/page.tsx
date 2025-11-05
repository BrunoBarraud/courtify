import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentFailurePage() {
  return (
    <div className="container py-10 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Pago rechazado</CardTitle>
          <CardDescription>
            No pudimos procesar tu pago. Podés intentar nuevamente o elegir otro método.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/payments">Reintentar</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Volver al dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

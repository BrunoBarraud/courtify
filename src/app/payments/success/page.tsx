import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessPage() {
  return (
    <div className="container py-10 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Pago aprobado</CardTitle>
          <CardDescription>
            Tu pago fue procesado correctamente. Gracias por tu compra.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/payments">Ver pagos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentPendingPage() {
  return (
    <div className="container py-10 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Pago pendiente</CardTitle>
          <CardDescription>
            Tu pago está en revisión o pendiente de confirmación. Te avisaremos cuando se complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/payments">Ver pagos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

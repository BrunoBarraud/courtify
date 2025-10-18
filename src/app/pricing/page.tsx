import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Precios | Courtify',
}

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mes',
    description: 'Ideal para comenzar y probar la plataforma',
    features: [
      'Hasta 1 sede',
      'Reservas online',
      'Notificaciones por email',
      'Soporte por email',
    ],
    cta: 'Comenzar gratis',
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mes',
    description: 'Para clubes con operación en crecimiento',
    features: [
      'Hasta 3 sedes',
      'Pagos online (Stripe/Mercado Pago)',
      'Abonos y membresías',
      'Recordatorios y confirmaciones',
      'Soporte prioritario',
    ],
    highlighted: true,
    cta: 'Comenzar prueba',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Para cadenas y operación a gran escala',
    features: [
      'Sedes ilimitadas',
      'Onboarding dedicado',
      'Integraciones a medida',
      'SLA y soporte 24/7',
    ],
    cta: 'Contactar ventas',
  },
]

export default function PricingPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[980px] text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Precios</h1>
        <p className="mt-2 text-muted-foreground">Planes simples para acompañar el crecimiento de tu club</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={p.highlighted ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {p.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              {p.name === 'Enterprise' ? (
                <Link href="/contact"><Button className="w-full">{p.cta}</Button></Link>
              ) : (
                <Link href="/auth/signup"><Button className="w-full">{p.cta}</Button></Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

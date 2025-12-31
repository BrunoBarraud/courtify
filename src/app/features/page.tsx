import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Users, Trophy, Bell, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Características | MatchUp',
}

const features = [
  {
    icon: Calendar,
    title: 'Reservas online',
    desc: 'Disponibilidad en tiempo real y confirmación inmediata',
    points: [
      'Disponibilidad por fecha y horario',
      'Reservas múltiples',
      'Detección de conflictos',
      'Listas de espera',
    ],
  },
  {
    icon: CreditCard,
    title: 'Pagos',
    desc: 'Integraciones con Stripe y Mercado Pago',
    points: ['Facturación automática', 'Reembolsos', 'Comprobantes'],
  },
  {
    icon: Users,
    title: 'Abonos',
    desc: 'Membresías y suscripciones flexibles',
    points: ['Planes y créditos', 'Renovación automática', 'Seguimiento de uso'],
  },
  {
    icon: Trophy,
    title: 'Torneos',
    desc: 'Organización y gestión de eventos',
    points: ['Inscripciones', 'Llaves y programación', 'Resultados'],
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    desc: 'Emails y push automáticos',
    points: ['Recordatorios', 'Confirmaciones de pago', 'Promociones'],
  },
  {
    icon: MapPin,
    title: 'Multi-sede',
    desc: 'Gestioná múltiples sedes desde una plataforma',
    points: ['Búsqueda por ubicación', 'Analíticas por sede', 'Reglas por sede'],
  },
]

export default function FeaturesPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[980px] text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Características</h1>
        <p className="mt-2 text-muted-foreground">
          Todo lo que necesitás para gestionar tus canchas
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(f => (
          <Card key={f.title}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <f.icon className="h-6 w-6 text-primary" />
                <CardTitle>{f.title}</CardTitle>
              </div>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {f.points.map(p => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

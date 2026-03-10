import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Acerca de | MatchUp',
}

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[900px] space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Acerca de MatchUp</h1>
          <p className="mt-2 text-muted-foreground">
            Tu plataforma de gestión de canchas deportivas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>La solución para tus sedes deportivas</CardTitle>
            <CardDescription>Sistema integral de reservas y gestión deportiva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              MatchUp es un sistema integral diseñado específicamente para sedes y complejos deportivos que
              buscan digitalizar y optimizar su gestión de canchas. Ofrecemos una plataforma
              completa donde tus clientes pueden reservar canchas de manera sencilla mientras vos
              mantenés el control total de tu operación.
            </p>
            <ul className="list-disc pl-6">
              <li>Sistema de reservas en tiempo real</li>
              <li>Gestión de pagos y facturación</li>
              <li>Control de abonos y membresías</li>
              <li>Organización de torneos</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desarrollador</CardTitle>
            <CardDescription>Conocé al creador detrás de MatchUp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Bruno Ariel Barraud</h3>
              <p className="text-muted-foreground">
                Analista de Sistemas, 23 años. Especializado en el desarrollo de soluciones
                tecnológicas para el sector deportivo.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Contacto</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>📧 brunobarraud.contacto@gmail.com</li>
                <li>📱 (3537) 325109</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

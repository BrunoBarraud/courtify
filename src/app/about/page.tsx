import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Acerca de | Courtify',
}

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[900px] space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Acerca de Courtify</h1>
          <p className="mt-2 text-muted-foreground">Nuestra misión y cómo te ayudamos a gestionar tus canchas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>La plataforma integral para clubes</CardTitle>
            <CardDescription>
              Reservas, pagos, abonos y torneos en un solo lugar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Courtify nace para digitalizar la operación de clubes y complejos deportivos. 
              Reducí tareas manuales, evitá dobles reservas y brindá una experiencia moderna a tus clientes.
            </p>
            <ul className="list-disc pl-6">
              <li>Calendario con disponibilidad en tiempo real</li>
              <li>Pagos en línea y facturación automática</li>
              <li>Abonos y membresías</li>
              <li>Gestión de torneos y comunicaciones</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuestros valores</CardTitle>
            <CardDescription>Orientados a producto, simples y confiables</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-1">Simplicidad</h3>
              <p className="text-sm text-muted-foreground">Interfaz clara para tu equipo y tus clientes.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Confiabilidad</h3>
              <p className="text-sm text-muted-foreground">Disponibilidad y seguridad de primer nivel.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Evolución</h3>
              <p className="text-sm text-muted-foreground">Actualizaciones continuas basadas en feedback.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

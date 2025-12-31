/**
 * Landing Page
 * Main entry point for the MatchUp application
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Trophy, Bell, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Reservá canchas
            <br />
            <span className="text-primary">en tus clubes favoritos</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Encontrá disponibilidad, reservá y pagá tus canchas deportivas en línea. ¡Simple, rápido
            y seguro!
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/auth/signin">
              <Button size="lg">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/50">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Todo lo que necesitás para tus reservas deportivas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Una experiencia simple y completa para vos
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Reservas fáciles</CardTitle>
                <CardDescription>Encontrá y reservá tu cancha en segundos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Buscá por fecha y horario</li>
                  <li>• Visualizá la disponibilidad en tiempo real</li>
                  <li>• Reservá para vos o tu grupo</li>
                  <li>• Confirmación instantánea</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Pagos seguros</CardTitle>
                <CardDescription>Pagá como prefieras</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mercado Pago y tarjetas</li>
                  <li>• Pagos seguros</li>
                  <li>• Comprobantes automáticos</li>
                  <li>• Historial de pagos</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Tu perfil deportivo</CardTitle>
                <CardDescription>Todo en un solo lugar</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Historial de reservas</li>
                  <li>• Tus clubes favoritos</li>
                  <li>• Estado de abonos</li>
                  <li>• Preferencias personales</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Torneos</CardTitle>
                <CardDescription>Participá en competencias</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Inscripción online</li>
                  <li>• Fixture digital</li>
                  <li>• Resultados en vivo</li>
                  <li>• Notificaciones de partidos</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>No te pierdas ningún partido</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Recordatorios de reservas</li>
                  <li>• Confirmaciones</li>
                  <li>• Cambios de horario</li>
                  <li>• Novedades de tus clubes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-[980px] text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            ¿Listo para empezar a jugar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Unite a la comunidad deportiva más grande
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Crear cuenta gratis</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">MatchUp</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                La forma más fácil de reservar canchas deportivas en tus clubes favoritos.
              </p>
              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg border">
                <p className="font-medium mb-2">¿Sos dueño de un club deportivo?</p>
                <p className="mb-3">Digitalizá la gestión de tus canchas con MatchUp</p>
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  Contactanos para más información →
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ayuda</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help/reservations">Cómo reservar</Link>
                </li>
                <li>
                  <Link href="/help/payments">Pagos</Link>
                </li>
                <li>
                  <Link href="/help/faq">Preguntas frecuentes</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy">Política de privacidad</Link>
                </li>
                <li>
                  <Link href="/terms">Términos de servicio</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} MatchUp. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

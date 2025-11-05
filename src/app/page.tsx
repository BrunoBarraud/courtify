/**
 * Landing Page
 * Main entry point for the Courtify application
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Trophy, Bell, MapPin, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Reservá tu cancha ideal
            <br />
            <span className="text-primary">En cualquier momento y lugar</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            La plataforma completa para reservar canchas deportivas para clubes y complejos.
            Gestioná reservas, abonos, torneos y pagos en un solo lugar.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/venues">
              <Button size="lg">Ver sedes</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">Crear cuenta</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 bg-muted/50">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Todo lo que necesitás para gestionar tus canchas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Funcionalidades potentes para clubes y sus clientes
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Reservas online</CardTitle>
                <CardDescription>
                  Disponibilidad en tiempo real y confirmación al instante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Disponibilidad por fecha y horario</li>
                  <li>• Reservá múltiples canchas a la vez</li>
                  <li>• Detección automática de conflictos</li>
                  <li>• Listas de espera</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Pagos</CardTitle>
                <CardDescription>
                  Pagos seguros con múltiples pasarelas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Integración Stripe y Mercado Pago</li>
                  <li>• Facturación automática</li>
                  <li>• Gestión de reembolsos</li>
                  <li>• Comprobantes de pago</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Abonos</CardTitle>
                <CardDescription>
                  Planes de membresía y suscripción flexibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Planes mensuales, trimestrales, anuales</li>
                  <li>• Reservas por crédito</li>
                  <li>• Renovación automática</li>
                  <li>• Seguimiento de uso</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Torneos</CardTitle>
                <CardDescription>
                  Organizá y gestioná torneos deportivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Inscripción a torneos</li>
                  <li>• Gestión de llaves</li>
                  <li>• Programación de partidos</li>
                  <li>• Seguimiento de resultados</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  Mantenete informado con notificaciones automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Emails y push notifications</li>
                  <li>• Recordatorios de reservas</li>
                  <li>• Confirmaciones de pago</li>
                  <li>• Alertas promocionales</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-sede</CardTitle>
                <CardDescription>
                  Gestioná múltiples sedes desde una sola plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Gestión centralizada</li>
                  <li>• Búsqueda por ubicación</li>
                  <li>• Reglas por sede</li>
                  <li>• Analíticas por ubicación</li>
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
            ¿Listo para transformar la gestión de tus canchas?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sumate a los clubes que ya optimizan su operación con Courtify
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Crear cuenta</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">Contactar ventas</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Courtify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma completa para reservar y gestionar canchas deportivas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features">Características</Link></li>
                <li><Link href="/pricing">Precios</Link></li>
                <li><Link href="/demo">Solicitar demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Compañía</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">Acerca de</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Política de privacidad</Link></li>
                <li><Link href="/terms">Términos de servicio</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Courtify. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

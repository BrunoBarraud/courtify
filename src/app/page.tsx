/**
 * Landing Page
 * Main entry point for the MatchUp application
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Trophy, Bell, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />
        <div className="container relative flex flex-col items-center justify-center gap-8 py-24 md:py-32 lg:py-40">
          <div className="flex max-w-[980px] flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <Trophy className="mr-2 h-4 w-4 text-primary" />
              <span>La plataforma #1 para reservas deportivas</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
              Reservá canchas
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                en segundos
              </span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Encontrá disponibilidad, reservá y pagá tus canchas deportivas en línea.
              <span className="font-semibold text-foreground"> Simple, rápido y seguro.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  Crear cuenta gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/venues">
                <Button size="lg" variant="outline" className="gap-2">
                  Ver canchas disponibles
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sin comisiones ocultas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Confirmación instantánea</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Pago 100% seguro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Todo lo que necesitás para tus reservas deportivas
            </h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Una experiencia simple y completa diseñada para que disfrutes del deporte
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Reservas fáciles</CardTitle>
                <CardDescription>Encontrá y reservá tu cancha en segundos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Disponibilidad en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Confirmación instantánea</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Reservá para vos o tu grupo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Pagos seguros</CardTitle>
                <CardDescription>Múltiples métodos de pago</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Mercado Pago y tarjetas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Comprobantes automáticos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Historial completo</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Notificaciones</CardTitle>
                <CardDescription>Mantente siempre informado</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Recordatorios de reservas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Confirmaciones instantáneas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Actualizaciones importantes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container py-24">
          <div className="mx-auto max-w-[980px] text-center">
            <div className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm mb-6">
              <Trophy className="mr-2 h-4 w-4 text-primary" />
              <span>Comenzá hoy mismo</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
              ¿Listo para empezar a jugar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-[600px] mx-auto">
              Unite a miles de jugadores que ya reservan sus canchas de forma simple y rápida
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  Crear cuenta gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="gap-2">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
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

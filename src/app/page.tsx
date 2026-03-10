/**
 * Landing Page
 * Main entry point for the Sede Deportiva App
 */

import Link from 'next/link'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Bell, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/client'

export default async function HomePage() {
  const supabase = createServerClient(() => cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthed = !!user

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
        <div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/15" />
        <div className="container relative flex flex-col items-center justify-center gap-8 py-24 md:py-32 lg:py-40">
          <div className="flex max-w-[980px] flex-col items-center gap-6 text-center">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
              Reservá tu cancha
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                en segundos
              </span>
            </h2>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Sistema de reservas online
              <br />
              <span className="font-semibold text-foreground">Simple, rápido y seguro.</span>
            </p>
            {isAuthed ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/bookings/new">
                    Nueva reserva
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/dashboard">Ir al dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/auth/signup">
                    Registrate ahora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/auth/signin">Iniciar sesión</Link>
                </Button>
              </div>
            )}
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
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Reservá online</h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Accedé a todas nuestras canchas de forma simple y rápida
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Reservas fáciles</CardTitle>
                <CardDescription>Reservá tu cancha en segundos</CardDescription>
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

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <span className="flex items-baseline gap-1 leading-none">
                  <span className="text-[24px] font-extrabold tracking-tight leading-none">
                    CanchaLibre
                  </span>
                  <span className="text-[18px] font-semibold italic text-primary leading-none">
                    App
                  </span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 max-w-[300px]">
                La plataforma integral de gestión y reservas para tu sede deportiva. Digitalizá tu
                sede y aumentá tus ganancias hoy.
              </p>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-4 text-foreground">Producto</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Solución Multi-Sede
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Casos de Éxito
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-semibold mb-4 text-foreground">Recursos</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Blog de Gestión
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Guías para Administradores
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    API para Desarrolladores
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h3 className="font-semibold mb-4 text-foreground">Contacto Comercial</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="mailto:brunobarraud.contacto@gmail.com"
                  >
                    brunobarraud.contacto@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="https://instagram.com/brunoobarraud"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @brunoobarraud
                  </a>
                </li>
                <li>
                  <span>+54 9 3537 325109</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} CanchaLibreApp. Todos los derechos reservados.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Términos de Servicio
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Política de Privacidad
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <span>Desarrollado por</span>
              <a
                href="https://instagram.com/brunoobarraud"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                Bruno Barraud
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

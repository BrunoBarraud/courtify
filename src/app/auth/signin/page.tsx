/**
 * Sign In Page
 * Implementa un formulario de inicio de sesión con validación mejorada
 * y manejo de errores.
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const [isLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Efecto para manejar redirección después de autenticación exitosa
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isRedirecting])

  useEffect(() => {
    const err = searchParams.get('error')
    if (!err) return

    if (err === 'rate_limited') {
      toast.error('Demasiados intentos seguidos', {
        description: 'Esperá un minuto y volvé a intentar iniciar sesión.',
      })
      return
    }

    if (err === 'auth_callback_error') {
      toast.error('Error al iniciar sesión', {
        description: 'No se pudo completar el inicio de sesión. Intentá nuevamente.',
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
            <svg
              className="h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Bienvenido de vuelta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿No tenés una cuenta?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              Registrate acá
            </Link>
          </p>
        </div>

        <Card className="border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
            <CardDescription className="text-muted-foreground">
              Accedé con tu cuenta de Google para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <GoogleSignInButton disabled={isLoading || isRedirecting} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Al continuar, aceptás nuestros{' '}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Términos de servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

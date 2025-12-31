/**
 * Sign In Page
 * Implementa un formulario de inicio de sesión con validación mejorada
 * y manejo de errores.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Services
import { authService } from '@/lib/services/auth.service'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

// Schema de validación
const signInSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true)

      const { data: authData, error } = await authService.signInWithEmail(data.email, data.password)

      if (error) {
        const errorMessage = error.message.includes('Invalid login credentials')
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : error.message.includes('Email not confirmed')
          ? 'Por favor, verifica tu correo electrónico antes de iniciar sesión.'
          : 'Ocurrió un error al iniciar sesión. Intenta nuevamente.'

        toast.error('Error de autenticación', {
          description: errorMessage,
        })
        return
      }

      if (authData?.session) {
        // Mostrar mensaje de éxito
        toast.success('¡Bienvenido de vuelta!')

        // Redirigir a la página anterior o al dashboard
        const redirectTo = searchParams.get('redirectedFrom') || '/dashboard'
        setIsRedirecting(true)
        router.push(redirectTo)
        router.refresh()
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      toast.error('Error', {
        description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Efecto para manejar redirección después de autenticación exitosa
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isRedirecting])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 p-2 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Bienvenido de vuelta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tenés una cuenta?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Registrate acá
            </Link>
          </p>
        </div>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
            <CardDescription className="text-gray-600">
              Ingresá tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={isLoading || isRedirecting}
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading || isRedirecting}
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : isRedirecting ? (
                  'Redirigiendo...'
                ) : (
                  'Iniciar sesión'
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">O continuá con</span>
                </div>
              </div>

              <GoogleSignInButton disabled={isLoading || isRedirecting} />
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-500">
          Al continuar, aceptás nuestros{' '}
          <Link href="/terms" className="underline hover:text-gray-700">
            Términos de servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

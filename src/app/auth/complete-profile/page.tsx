'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
// Schema de validación
const profileSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  isMember: z.boolean(),
  memberNumber: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const email = searchParams.get('email')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      isMember: false,
      memberNumber: '',
    },
  })

  const isMember = watch('isMember')

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      // Verificar número de socio si es necesario
      if (data.isMember && data.memberNumber) {
        const memberCheckResponse = await fetch('/api/auth/check-member', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            memberNumber: data.memberNumber,
          }),
        })

        const memberCheckResult = await memberCheckResponse.json()

        if (!memberCheckResult.isValid) {
          toast.error('Número de socio no encontrado', {
            description:
              'El número ingresado no coincide con nuestros registros. Podrás usar la app como usuario no socio.',
          })
          // Continuar con el registro pero marcar como no socio
          data.isMember = false
          data.memberNumber = undefined
        }
      }

      // Guardar el perfil
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          email,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar el perfil')
      }

      toast.success('¡Perfil completado!', {
        description: 'Ya podés empezar a usar MatchUp',
      })

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch {
      toast.error('Error', {
        description: 'No se pudo completar el registro. Por favor, intentá nuevamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Si no hay email en los params, redirigir al inicio
  useEffect(() => {
    if (!email) {
      router.push('/auth/signin')
    }
  }, [email, router])

  if (!email) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:px-6 lg:px-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Completá tu perfil
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Necesitamos algunos datos más para finalizar tu registro
          </p>
        </div>

        <Card className="border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-6 hidden">
             {/* Hidden because header is in root */}
            <CardTitle>Completá tu perfil</CardTitle>
            <CardDescription>
              Necesitamos algunos datos más para finalizar tu registro
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 pt-8">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre y apellido</Label>
                <Input 
                  id="fullName" 
                  {...register('fullName')} 
                  disabled={loading} 
                  className={`h-11 ${errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+54 9 11 1234-5678"
                  disabled={loading}
                  className={`h-11 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label htmlFor="isMember" className="text-base font-medium">¿Sos socio de la sede?</Label>
                    <p className="text-sm text-muted-foreground">
                      Obtené mejores precios al reservar
                    </p>
                  </div>
                  <Switch
                    id="isMember"
                    checked={isMember}
                    onCheckedChange={checked => setValue('isMember', checked)}
                    disabled={loading}
                  />
                </div>
              </div>

              {isMember && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label htmlFor="memberNumber">Número de socio</Label>
                  <Input
                    id="memberNumber"
                    {...register('memberNumber')}
                    placeholder="Ej: 12345"
                    disabled={loading}
                    className={`h-11 ${errors.memberNumber ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.memberNumber && (
                    <p className="text-sm text-destructive">{errors.memberNumber.message}</p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2 pb-8">
              <Button type="submit" className="w-full h-11 text-base font-medium shadow-md transition-transform hover:scale-[1.02]" disabled={loading}>
                {loading ? 'Guardando...' : 'Completar registro'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

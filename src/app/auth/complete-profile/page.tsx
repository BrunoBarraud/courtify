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
import { Trophy } from 'lucide-react'

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">MatchUp</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completá tu perfil</CardTitle>
            <CardDescription>
              Necesitamos algunos datos más para finalizar tu registro
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre y apellido</Label>
                <Input id="fullName" {...register('fullName')} disabled={loading} />
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
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isMember">¿Sos socio del club?</Label>
                  <Switch
                    id="isMember"
                    checked={isMember}
                    onCheckedChange={checked => setValue('isMember', checked)}
                    disabled={loading}
                  />
                </div>
              </div>

              {isMember && (
                <div className="space-y-2">
                  <Label htmlFor="memberNumber">Número de socio</Label>
                  <Input
                    id="memberNumber"
                    {...register('memberNumber')}
                    placeholder="Ej: 12345"
                    disabled={loading}
                  />
                  {errors.memberNumber && (
                    <p className="text-sm text-destructive">{errors.memberNumber.message}</p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Guardando...' : 'Completar registro'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

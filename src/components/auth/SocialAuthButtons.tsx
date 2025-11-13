'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/lib/services/auth.service'

type OAuthProvider = 'google' | 'github' // Solo soportamos estos dos por ahora

interface SocialAuthButtonProps {
  provider: OAuthProvider
  icon: React.ReactNode
  text: string
  loading?: boolean
}

const SocialAuthButton = ({ 
  provider, 
  icon, 
  text, 
  loading = false 
}: SocialAuthButtonProps) => {
  const handleSignIn = async () => {
    try {
      // Mostrar indicador de carga
      const loadingToast = toast.loading(`Iniciando sesión con ${provider}...`)
      
      const result = await authService.signInWithOAuth(provider)
      
      // Cerrar el toast de carga
      toast.dismiss(loadingToast)
      
      if ('error' in result) {
        toast.error('Error de autenticación', {
          description: `No se pudo iniciar sesión con ${provider}. ${result.error.message || 'Intenta de nuevo.'}`
        })
        return
      }
      
      // No hacemos redirect manual. Supabase redirige a la URL de OAuth y luego vuelve a /auth/callback
      toast.success('Redirigiendo a proveedor...', {
        description: `Continuando con ${provider}...`
      })
      
    } catch (error: unknown) {
      console.error(`Error signing in with ${provider}:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al intentar iniciar sesión.'
      toast.error('Error inesperado', {
        description: errorMessage
      })
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={loading}
      onClick={handleSignIn}
      className="w-full flex items-center justify-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>{icon}</>
      )}
      {text}
    </Button>
  )
}

export default SocialAuthButton

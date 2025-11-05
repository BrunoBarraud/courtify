'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClientComponentClient()
      
      try {
        // Verificar si hay un error en la URL
        if (error) {
          console.error('Error en la autenticación:', error, errorDescription)
          router.push(`/auth/signin?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // Obtener la sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error al obtener la sesión:', sessionError)
          throw sessionError
        }

        if (session) {
          // Redirigir al dashboard después de iniciar sesión exitosamente
          router.push('/dashboard')
        } else {
          // Si no hay sesión, redirigir al inicio de sesión
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Error en el callback de autenticación:', error)
        router.push('/auth/signin?error=Ocurrió un error inesperado')
      }
    }

    handleAuth()
  }, [router, error, errorDescription])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando autenticación</h2>
        <p className="text-gray-600">Por favor espera mientras te redirigimos...</p>
        {error && (
          <div className="mt-4">
            <a
              href="/auth/signin"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Volver al inicio de sesión
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

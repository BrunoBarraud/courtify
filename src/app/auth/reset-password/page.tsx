'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const supabase = createBrowserClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/update-password`,
      })
      if (error) throw error
      setMessage('Te enviamos un email para restablecer tu contraseña.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el email de recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>
              Ingresá tu correo y te enviaremos un enlace para restablecerla
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {message && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{message}</div>
              )}
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}

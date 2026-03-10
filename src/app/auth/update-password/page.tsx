'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function UpdatePasswordPage() {
  const supabase = createBrowserClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })
      if (error) throw error
      setMessage('Tu contraseña fue actualizada correctamente. Ya podés ingresar con la nueva contraseña.')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:px-6 lg:px-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Seguridad
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Protegé tu cuenta
          </p>
        </div>

        <Card className="border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Actualizar contraseña</CardTitle>
            <CardDescription className="text-muted-foreground">
              Elegí una nueva contraseña para tu cuenta.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
               {message && (
                <div className="p-4 text-sm font-medium text-green-700 bg-green-50 rounded-lg border border-green-200">
                  {message}
                </div>
              )}
              {error && (
                <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 flex items-center gap-2">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Debe tener al menos 8 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11"
                />
              </div>
            </CardContent>

            <div className="px-6 pb-6 pt-4">
              <Button type="submit" className="w-full h-11 text-base font-medium shadow-md transition-transform hover:scale-[1.02]" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Acciones extra */}
        {message && (
          <div className="mt-8 text-center text-xs text-muted-foreground animate-in fade-in">
            <a href="/dashboard" className="hover:text-foreground underline underline-offset-4 transition-colors font-semibold text-primary">
              Ir al panel principal →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

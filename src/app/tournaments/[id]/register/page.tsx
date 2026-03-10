'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Users } from 'lucide-react'

export default function RegisterTeamPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const tournamentId = params?.id as string

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo completar la inscripción')

      // Redirect back to tournament profile (where they'll see their team pending)
      router.push(`/tournaments/${tournamentId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="max-w-xl mx-auto px-4">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Cancelar y volver atrás
        </Link>

        <Card className="border-border/60 shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-blue-600 flex items-center justify-center relative">
            <Users className="h-12 w-12 text-white/50" />
          </div>
          <CardHeader className="-mt-8 bg-card pt-8 pb-4 relative z-10 rounded-t-3xl border-b border-border/50">
            <CardTitle className="text-2xl text-center">Inscripción de Equipo</CardTitle>
            <CardDescription className="text-center">
              Serás registrado como el capitán del equipo para este campeonato.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm text-center font-medium border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">
                  Nombre de tu Equipo
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Los Vengadores FC"
                  required
                  disabled={saving}
                  className="h-12 text-lg px-4"
                  maxLength={50}
                />
              </div>

              <div className="bg-muted/40 p-4 rounded-xl text-sm text-muted-foreground mt-8 border border-border/40">
                <p className="mb-2">
                  <strong>Nota:</strong> Al registrar tu equipo, tu solicitud quedará en estado{' '}
                  <em>Pendiente</em> hasta que el organizador confirme el pago o valide el registro.
                </p>
                <p>
                  Por ahora vos quedarás como único integrante (Capitán). Otras herramientas de
                  armado de escuadra pueden requerirse el día del evento.
                </p>
              </div>

              <Button
                type="submit"
                disabled={saving || !name.trim()}
                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
              >
                {saving ? 'Procesando...' : 'Confirmar Inscripción'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

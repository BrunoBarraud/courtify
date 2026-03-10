'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'

export default function NewTournamentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const venueId = params?.id as string

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxTeams, setMaxTeams] = useState('16')
  const [registrationFee, setRegistrationFee] = useState('0')
  const [status, setStatus] = useState('upcoming')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/venues/${venueId}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          max_teams: parseInt(maxTeams, 10),
          registration_fee: parseFloat(registrationFee),
          status,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el torneo')

      router.push(`/admin/venues/${venueId}/tournaments`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/admin/venues/${venueId}/tournaments`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Torneo</h1>
          <p className="text-muted-foreground">Completá los datos básicos del campeonato.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Torneo</CardTitle>
          <CardDescription>
            Esta información será pública para los jugadores interesandos en inscribirse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Torneo</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Copa de Verano Fútbol 5"
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Descripción y Reglas Mínimas</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explicá formato, premios, categorías..."
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Fecha de Inicio</Label>
                <Input
                  id="start"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Fecha de Fin</Label>
                <Input
                  id="end"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max">Límite de Equipos</Label>
                <Input
                  id="max"
                  type="number"
                  min="2"
                  step="2"
                  value={maxTeams}
                  onChange={e => setMaxTeams(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Costo de Inscripción ($)</Label>
                <Input
                  id="fee"
                  type="number"
                  min="0"
                  step="1000"
                  value={registrationFee}
                  onChange={e => setRegistrationFee(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado Inicial</Label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={saving}
              >
                <option value="upcoming">Próximamente (Anuncio)</option>
                <option value="registration_open">Inscripciones Abiertas</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving} className="min-w-[140px]">
                {saving ? 'Guardando...' : 'Crear Torneo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

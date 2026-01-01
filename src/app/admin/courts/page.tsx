'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

type Court = {
  id: string
  venue_id: string
  name: string
  court_type: string
  is_indoor: boolean
  hourly_rate: number
  is_active: boolean
  display_order: number
  image_url?: string
}

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [venueId, setVenueId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [courtType, setCourtType] = useState('Fútbol 5')
  const [isIndoor, setIsIndoor] = useState(false)
  const [hourlyRate, setHourlyRate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    loadCourts()
  }, [])

  const loadCourts = async () => {
    setLoading(true)
    setError(null)
    try {
      // Primero obtener la sede
      const venueRes = await fetch('/api/venues')
      const venueData = await venueRes.json()
      if (!venueRes.ok) throw new Error('No se pudo cargar la sede')

      const venue = venueData.venues?.[0]
      if (!venue) throw new Error('No hay sede configurada')

      setVenueId(venue.id)

      // Cargar canchas (incluyendo inactivas para el panel de admin)
      const res = await fetch(`/api/venues/${venue.id}/courts?includeInactive=true`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las canchas')

      setCourts(data.courts || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando canchas')
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingCourt(null)
    setName('')
    setCourtType('Fútbol 5')
    setIsIndoor(false)
    setHourlyRate('')
    setIsActive(true)
    setImageUrl('')
    setShowDialog(true)
  }

  const openEditDialog = (court: Court) => {
    setEditingCourt(court)
    setName(court.name)
    setCourtType(court.court_type)
    setIsIndoor(court.is_indoor)
    setHourlyRate(court.hourly_rate.toString())
    setIsActive(court.is_active)
    setImageUrl(court.image_url || '')
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!name.trim() || !hourlyRate) {
      alert('Completá todos los campos requeridos')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: name.trim(),
        court_type: courtType,
        is_indoor: isIndoor,
        hourly_rate: parseFloat(hourlyRate),
        is_active: isActive,
        image_url: imageUrl || null,
      }

      if (editingCourt) {
        // Actualizar
        const res = await fetch(`/api/courts/${editingCourt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error al actualizar')
        }
      } else {
        // Crear
        const res = await fetch(`/api/venues/${venueId}/courts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error al crear')
        }
      }

      setShowDialog(false)
      await loadCourts()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error guardando cancha')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (court: Court) => {
    if (!confirm(`¿Eliminar la cancha "${court.name}"?`)) return

    try {
      const res = await fetch(`/api/courts/${court.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }

      await loadCourts()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error eliminando cancha')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Canchas</h1>
          <p className="text-muted-foreground">Administrá las canchas del complejo</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cancha
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground">Cargando canchas...</div>
      ) : courts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No hay canchas creadas</p>
            <Button onClick={openCreateDialog} variant="outline">
              Crear primera cancha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courts.map(court => (
            <Card key={court.id} className={!court.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{court.name}</CardTitle>
                    <CardDescription>
                      {court.court_type} • {court.is_indoor ? 'Techada' : 'Al aire libre'}
                    </CardDescription>
                  </div>
                  {!court.is_active && (
                    <span className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                      Inactiva
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Precio por hora</span>
                  <span className="font-bold text-2xl text-primary">${court.hourly_rate}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(court)}
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(court)}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear/editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCourt ? 'Editar Cancha' : 'Nueva Cancha'}</DialogTitle>
            <DialogDescription>
              {editingCourt
                ? 'Modificá los datos de la cancha'
                : 'Creá una nueva cancha para el complejo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courtName">Nombre *</Label>
              <Input
                id="courtName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Cancha 1"
                required
              />
            </div>

            <ImageUpload
              currentImageUrl={imageUrl}
              onImageChange={setImageUrl}
              label="Imagen de la cancha"
              aspectRatio="cover"
            />

            <div className="space-y-2">
              <Label htmlFor="courtType">Tipo de cancha *</Label>
              <select
                id="courtType"
                value={courtType}
                onChange={e => setCourtType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Fútbol 5">Fútbol 5</option>
                <option value="Fútbol 7">Fútbol 7</option>
                <option value="Fútbol 11">Fútbol 11</option>
                <option value="Tenis">Tenis</option>
                <option value="Paddle">Paddle</option>
                <option value="Básquet">Básquet</option>
                <option value="Vóley">Vóley</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Precio por hora *</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="Ej: 5000"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isIndoor"
                checked={isIndoor}
                onChange={e => setIsIndoor(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isIndoor" className="cursor-pointer">
                Cancha techada
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Cancha activa (visible para reservas)
              </Label>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

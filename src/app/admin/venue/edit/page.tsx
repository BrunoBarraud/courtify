'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MapPin, Image as ImageIcon, Save, User } from 'lucide-react'

type Venue = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string | null
  country: string
  phone: string | null
  email: string | null
  description: string | null
  cover_image_url: string | null
  profile_image_url: string | null
  plus_code: string | null
  is_active: boolean
}

export default function EditVenuePage() {
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [plusCode, setPlusCode] = useState('')

  useEffect(() => {
    loadVenue()
  }, [])

  const loadVenue = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/venues')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo cargar la sede')

      const venues = data.venues || []
      if (venues.length === 0) {
        throw new Error('No hay sedes configuradas')
      }

      const venueData = venues[0]
      setVenue(venueData)

      // Populate form
      setName(venueData.name || '')
      setAddress(venueData.address || '')
      setCity(venueData.city || '')
      setState(venueData.state || '')
      setCountry(venueData.country || '')
      setPhone(venueData.phone || '')
      setEmail(venueData.email || '')
      setDescription(venueData.description || '')
      setCoverImageUrl(venueData.cover_image_url || '')
      setProfileImageUrl(venueData.profile_image_url || '')
      setPlusCode(venueData.plus_code || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando sede')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venue) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/venues/${venue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          city,
          state: state || null,
          country,
          phone: phone || null,
          email: email || null,
          description: description || null,
          cover_image_url: coverImageUrl || null,
          profile_image_url: profileImageUrl || null,
          plus_code: plusCode || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la sede')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      await loadVenue()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error actualizando sede')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (error && !venue) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={loadVenue} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editar Complejo</h1>
          <p className="text-muted-foreground">Configurá la información del complejo deportivo</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/bookings')}>
          Volver
        </Button>
      </div>

      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
          ✓ Cambios guardados exitosamente
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>Nombre y ubicación del complejo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Complejo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Ej: ComplejoApp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ej: +54 9 11 1234-5678"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ej: info@complejo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="Ej: Av. Principal 1234"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  placeholder="Ej: Buenos Aires"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Provincia/Estado</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="Ej: Buenos Aires"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  required
                  placeholder="Ej: Argentina"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plusCode">Google Plus Code</Label>
              <Input
                id="plusCode"
                value={plusCode}
                onChange={e => setPlusCode(e.target.value)}
                placeholder="Ej: 47RR+MQ Buenos Aires"
              />
              <p className="text-xs text-muted-foreground">
                Encontrá tu Plus Code en{' '}
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Maps
                </a>{' '}
                haciendo click derecho en tu ubicación
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Descripción */}
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
            <CardDescription>Información adicional sobre el complejo</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Describe el complejo, sus instalaciones, horarios, etc."
              rows={5}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Foto de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Foto de Perfil
            </CardTitle>
            <CardDescription>
              Logo o imagen principal del complejo (se muestra circular)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImageUrl={profileImageUrl}
              onImageChange={setProfileImageUrl}
              label="Foto de Perfil"
              aspectRatio="square"
            />
          </CardContent>
        </Card>

        {/* Imagen de Portada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagen de Portada
            </CardTitle>
            <CardDescription>
              Imagen grande que se muestra en la parte superior (estilo Facebook)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImageUrl={coverImageUrl}
              onImageChange={setCoverImageUrl}
              label="Imagen de Portada"
              aspectRatio="cover"
            />
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/bookings')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

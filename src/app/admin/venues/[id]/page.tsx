'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminVenueDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const venueId = params?.id as string

  const [venue, setVenue] = useState<any | null>(null)
  const [courts, setCourts] = useState<any[]>([])
  const [selectedCourtId, setSelectedCourtId] = useState<string>('')

  const [rules, setRules] = useState<any[]>([])
  const [blocked, setBlocked] = useState<any[]>([])
  const [loadingRules, setLoadingRules] = useState(false)
  const [loadingBlocked, setLoadingBlocked] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Court form
  const [name, setName] = useState('')
  const [courtType, setCourtType] = useState('tennis')
  const [isIndoor, setIsIndoor] = useState(false)
  const [hourlyRate, setHourlyRate] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [venueRes, courtsRes] = await Promise.all([
        fetch(`/api/venues/${venueId}`),
        fetch(`/api/venues/${venueId}/courts`),
      ])
      const venueData = await venueRes.json()
      const courtsData = await courtsRes.json()
      if (!venueRes.ok) throw new Error(venueData.error || 'No se pudo cargar la sede')
      if (!courtsRes.ok) throw new Error(courtsData.error || 'No se pudieron cargar las canchas')
      setVenue(venueData.venue)
      setCourts(courtsData.courts || [])
      if (!selectedCourtId && (courtsData.courts || []).length > 0) {
        setSelectedCourtId(courtsData.courts[0].id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (venueId) load()
  }, [venueId])

  // Load rules and blocked periods when court changes
  useEffect(() => {
    const fetchCourtData = async () => {
      if (!selectedCourtId) return
      setLoadingRules(true)
      setLoadingBlocked(true)
      try {
        const [rRes, bRes] = await Promise.all([
          fetch(`/api/courts/${selectedCourtId}/availability-rules`),
          fetch(`/api/courts/${selectedCourtId}/blocked-periods`),
        ])
        const rData = await rRes.json()
        const bData = await bRes.json()
        if (rRes.ok) setRules(rData.rules || [])
        if (bRes.ok) setBlocked(bData.blockedPeriods || [])
      } finally {
        setLoadingRules(false)
        setLoadingBlocked(false)
      }
    }
    fetchCourtData()
  }, [selectedCourtId])

  const onCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/venues/${venueId}/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          court_type: courtType,
          is_indoor: isIndoor,
          hourly_rate: Number(hourlyRate || '0'),
          is_active: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo crear la cancha')
      setName('')
      setCourtType('tennis')
      setIsIndoor(false)
      setHourlyRate('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error creando cancha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sede</h1>
        <Button variant="outline" onClick={() => router.push('/admin/venues')}>
          Volver
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : !venue ? (
        <div className="text-sm text-muted-foreground">Sede no encontrada</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{venue.name}</CardTitle>
              <CardDescription>
                {venue.address} • {venue.city}, {venue.country}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Slug: {venue.slug} • Activa: {venue.is_active ? 'Sí' : 'No'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nueva cancha</CardTitle>
              <CardDescription>Agregá una cancha a la sede</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreateCourt} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cname">Nombre</Label>
                  <Input
                    id="cname"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctype">Deporte</Label>
                  <select
                    id="ctype"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={courtType}
                    onChange={e => setCourtType(e.target.value)}
                    disabled={saving}
                  >
                    <option value="tennis">Tenis</option>
                    <option value="paddle">Pádel</option>
                    <option value="football">Fútbol</option>
                    <option value="basketball">Básquet</option>
                    <option value="volleyball">Vóley</option>
                    <option value="multipurpose">Multipropósito</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Precio por hora</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indoor">¿Techada?</Label>
                  <select
                    id="indoor"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={isIndoor ? 'true' : 'false'}
                    onChange={e => setIsIndoor(e.target.value === 'true')}
                    disabled={saving}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Creando...' : 'Agregar cancha'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canchas</CardTitle>
              <CardDescription>Listado de canchas de la sede</CardDescription>
            </CardHeader>
            <CardContent>
              {courts.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay canchas.</div>
              ) : (
                <div className="grid gap-3">
                  {courts.map(c => (
                    <div key={c.id} className="flex flex-col gap-3 p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {c.name} • {c.court_type}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {c.is_indoor ? 'Techada' : 'Aire libre'} • ${c.hourly_rate} / hora
                          </div>
                        </div>
                        <Button
                          variant={selectedCourtId === c.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCourtId(c.id)}
                        >
                          {selectedCourtId === c.id ? 'Seleccionada' : 'Seleccionar'}
                        </Button>
                      </div>

                      {selectedCourtId === c.id && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Reglas de disponibilidad</CardTitle>
                              <CardDescription>Definí horarios por día</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <AvailabilityRules
                                courtId={c.id}
                                rules={rules}
                                loading={loadingRules}
                                onChanged={async () => {
                                  const r = await fetch(`/api/courts/${c.id}/availability-rules`)
                                    .then(r => r.json())
                                    .catch(() => ({ rules: [] }))
                                  setRules(r.rules || [])
                                }}
                              />
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Períodos bloqueados</CardTitle>
                              <CardDescription>Definí fechas y horarios bloqueados</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <BlockedPeriods
                                courtId={c.id}
                                items={blocked}
                                loading={loadingBlocked}
                                onChanged={async () => {
                                  const b = await fetch(`/api/courts/${c.id}/blocked-periods`)
                                    .then(r => r.json())
                                    .catch(() => ({ blockedPeriods: [] }))
                                  setBlocked(b.blockedPeriods || [])
                                }}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function AvailabilityRules({
  courtId,
  rules,
  loading,
  onChanged,
}: {
  courtId: string
  rules: any[]
  loading: boolean
  onChanged: () => void
}) {
  const [day, setDay] = useState('monday')
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('22:00')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      // Validations
      if (!start || !end) throw new Error('Completá inicio y fin')
      if (end <= start) throw new Error('El fin debe ser mayor al inicio')
      const overlaps = (rules || []).some((r: any) => r.day_of_week === day && !(end <= r.start_time || start >= r.end_time))
      if (overlaps) throw new Error('La regla se solapa con otra existente para ese día')
      const res = await fetch(`/api/courts/${courtId}/availability-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: day,
          start_time: start,
          end_time: end,
          price_override: price ? Number(price) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo crear la regla')
      }
      setPrice('')
      onChanged()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear la regla')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (r: any) => {
    const res = await fetch(`/api/courts/${courtId}/availability-rules`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
      }),
    })
    if (res.ok) onChanged()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="grid gap-3">
        {formError && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{formError}</div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Día</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={day}
              onChange={e => setDay(e.target.value)}
            >
              <option value="monday">Lunes</option>
              <option value="tuesday">Martes</option>
              <option value="wednesday">Miércoles</option>
              <option value="thursday">Jueves</option>
              <option value="friday">Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Inicio</Label>
            <Input type="time" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Fin</Label>
            <Input type="time" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Precio override (opcional)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Agregando...' : 'Agregar regla'}
          </Button>
        </div>
      </form>

      <div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando reglas...</div>
        ) : rules.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin reglas definidas</div>
        ) : (
          <div className="space-y-2 text-sm">
            {rules.map(r => (
              <div
                key={`${r.day_of_week}-${r.start_time}-${r.end_time}`}
                className="p-2 border rounded-md flex items-center justify-between"
              >
                <div>
                  {r.day_of_week} • {r.start_time} - {r.end_time}{' '}
                  {r.price_override ? `• $${r.price_override}` : ''}
                </div>
                <Button size="sm" variant="destructive" onClick={() => onDelete(r)}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BlockedPeriods({
  courtId,
  items,
  loading,
  onChanged,
}: {
  courtId: string
  items: any[]
  loading: boolean
  onChanged: () => void
}) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (!start || !end) throw new Error('Completá inicio y fin')
      const startD = new Date(start)
      const endD = new Date(end)
      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) throw new Error('Fechas inválidas')
      if (endD <= startD) throw new Error('El fin debe ser mayor al inicio')
      const res = await fetch(`/api/courts/${courtId}/blocked-periods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_datetime: startD.toISOString(),
          end_datetime: endD.toISOString(),
          reason,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo crear el bloqueo')
      }
      setStart('')
      setEnd('')
      setReason('')
      onChanged()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear el bloqueo')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (bp: any) => {
    const res = await fetch(`/api/courts/${courtId}/blocked-periods`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bp.id }),
    })
    if (res.ok) onChanged()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onAdd} className="grid gap-3">
        {formError && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{formError}</div>
        )}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Inicio</Label>
            <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Fin</Label>
            <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Motivo</Label>
          <Input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Mantenimiento, evento, ..."
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Agregando...' : 'Agregar bloqueo'}
          </Button>
        </div>
      </form>

      <div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Cargando bloqueos...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin bloqueos</div>
        ) : (
          <div className="space-y-2 text-sm">
            {items.map(bp => (
              <div
                key={bp.id ?? `${bp.start_datetime}-${bp.end_datetime}`}
                className="p-2 border rounded-md flex items-center justify-between"
              >
                <div>
                  {new Date(bp.start_datetime).toLocaleString()} -{' '}
                  {new Date(bp.end_datetime).toLocaleString()} {bp.reason ? `• ${bp.reason}` : ''}
                </div>
                <Button size="sm" variant="destructive" onClick={() => onDelete(bp)}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

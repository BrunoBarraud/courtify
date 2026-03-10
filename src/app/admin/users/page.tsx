'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])

  const [filter, setFilter] = useState('')
  const [savingRole, setSavingRole] = useState<string | null>(null)
  const [savingVenue, setSavingVenue] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return users
    return users.filter(u => (u.email || '').toLowerCase().includes(q))
  }, [filter, users])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [uRes, vRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/venues'),
      ])
      const uData = await uRes.json()
      const vData = await vRes.json()
      if (!uRes.ok) throw new Error(uData.error || 'No se pudieron cargar usuarios')
      if (!vRes.ok) throw new Error(vData.error || 'No se pudieron cargar sedes')
      setUsers(uData.users || [])
      setVenues(vData.venues || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }

    const onDeleteUser = async (userId: string, email?: string) => {
      const ok = window.confirm(
        `¿Eliminar al usuario ${email || userId}? Esta acción es permanente.`
      )
      if (!ok) return
      try {
        const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el usuario')
        toast.success('Usuario eliminado')
        await load()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error eliminando usuario')
      }
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSetRole = async (userId: string, role: string) => {
    setSavingRole(userId)
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el rol')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error actualizando rol')
    } finally {
      setSavingRole(null)
    }
  }

  const onAddVenueAdmin = async (userId: string, venueId: string) => {
    setSavingVenue(`${userId}:${venueId}`)
    try {
      const res = await fetch('/api/admin/venue-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, venueId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo asignar admin a la sede')
      alert('Asignado como admin de la sede')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error asignando admin')
    } finally {
      setSavingVenue(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Usuarios</h1>
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Volver
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Buscar, asignar roles y administrar sedes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Buscar por email</Label>
              <Input
                placeholder="email@dominio.com"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sin usuarios</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(u => (
                <div key={u.id} className="p-3 border rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{u.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Rol actual: {u.role || 'user'}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <Label>Asignar rol</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue={u.role || 'user'}
                        onChange={e => onSetRole(u.id, e.target.value)}
                        disabled={savingRole === u.id}
                      >
                        <option value="user">user</option>
                        <option value="venue_admin">venue_admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label>Asignar admin de sede</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue=""
                        onChange={e => e.target.value && onAddVenueAdmin(u.id, e.target.value)}
                        disabled={savingVenue?.startsWith(u.id)}
                      >
                        <option value="" disabled>
                          Elegí una sede
                        </option>
                        {venues.map((v: any) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${u.id}/permissions`)}
                        >
                          Gestionar permisos
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          //onClick={() => onDeleteUser(u.id, u.email)}
                          disabled={savingRole === u.id || savingVenue?.startsWith(u.id)}
                        >
                          Eliminar usuario
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

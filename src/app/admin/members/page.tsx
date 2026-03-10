'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type MemberRow = {
  id: string
  member_number: string
  full_name: string
  email: string | null
  phone: string | null
  is_active: boolean
  status: string | null
  profile_id: string | null
  claimed_at: string | null
  created_at: string
}

export default function AdminMembersPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberRow[]>([])

  const [query, setQuery] = useState('')

  // Create form
  const [memberNumber, setMemberNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter(m => {
      return (
        (m.member_number || '').toLowerCase().includes(q) ||
        (m.full_name || '').toLowerCase().includes(q)
      )
    })
  }, [members, query])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
      const res = await fetch(`/api/admin/members${qs}`, { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los socios')
      setMembers((data.members || []) as MemberRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando socios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_number: memberNumber.trim(),
          full_name: fullName.trim(),
          email: email.trim() ? email.trim() : null,
          phone: phone.trim() ? phone.trim() : null,
          is_active: isActive,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el socio')

      setMemberNumber('')
      setFullName('')
      setEmail('')
      setPhone('')
      setIsActive(true)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error creando socio')
    } finally {
      setSaving(false)
    }
  }

  const onToggleActive = async (m: MemberRow) => {
    const ok = window.confirm(
      `${m.is_active ? 'Desactivar' : 'Activar'} al socio ${m.full_name} (${m.member_number})?`
    )
    if (!ok) return

    try {
      const res = await fetch(`/api/admin/members/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !m.is_active }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar')
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error actualizando')
    }
  }

  const onDelete = async (m: MemberRow) => {
    if (m.profile_id) {
      alert('No se puede eliminar: el socio ya está asociado a una cuenta. Desactívalo.')
      return
    }

    const ok = window.confirm(`¿Eliminar socio ${m.full_name} (${m.member_number})?`)
    if (!ok) return

    try {
      const res = await fetch(`/api/admin/members/${m.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar')
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error eliminando')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold">Socios</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Volver
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            Recargar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nuevo socio</CardTitle>
          <CardDescription>
            Cargá el padrón (número + nombre). Luego cada socio reclama su número desde su cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member_number">Número de socio</Label>
              <Input
                id="member_number"
                value={memberNumber}
                onChange={e => setMemberNumber(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre y apellido</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  disabled={saving}
                />
                Activo
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Crear socio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Buscar por número o nombre</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Buscar</Label>
              <Input
                placeholder="123 / Juan Pérez"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button variant="outline" onClick={load} disabled={loading}>
                Aplicar
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sin socios</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(m => (
                <div key={m.id} className="p-3 border rounded-md space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {m.full_name}{' '}
                        <span className="text-muted-foreground">• #{m.member_number}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estado: {m.is_active ? 'activo' : 'inactivo'}
                        {m.profile_id ? ' • asociado a cuenta' : ''}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onToggleActive(m)}>
                        {m.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(m)}>
                        Eliminar
                      </Button>
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

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type NotificationRow = {
  id: string
  title?: string
  body?: string
  sent_at?: string
  read_at?: string | null
  notification_type?: string
  data?: Record<string, unknown> | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const load = async (opts?: { append?: boolean }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/notifications?limit=20&offset=${opts?.append ? offset : 0}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las notificaciones')
      if (opts?.append) {
        setItems(prev => [...prev, ...(data.notifications || [])])
      } else {
        setItems(data.notifications || [])
      }
      setUnread(data.unread || 0)
      const total = typeof data.total === 'number' ? data.total : (data.notifications?.length || 0)
      const newOffset = (opts?.append ? offset : 0) + 20
      setOffset(newOffset)
      setHasMore(newOffset < total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando notificaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // marcar todas como leídas al abrir
    ;(async () => {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      if (res.ok) setUnread(0)
    })()
  }, [])

  const markAllRead = async () => {
    const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return alert(data.error || 'No se pudo marcar como leído')
    await load()
  }

  const markOneRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return alert(data.error || 'No se pudo marcar como leído')
    await load()
  }

  const resolveLink = (n: NotificationRow) => {
    const t = (n.notification_type || '').toLowerCase()
    if (t.includes('booking')) return '/bookings'
    if (t.includes('payment')) return '/payments'
    if (t.includes('promotion')) return '/pricing'
    if (t.startsWith('admin_')) return '/admin'
    return '/notifications'
  }

  const onItemClick = async (n: NotificationRow) => {
    await markOneRead(n.id)
    router.push(resolveLink(n))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Notificaciones</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">No leídas: {unread}</span>
          <Button variant="outline" onClick={markAllRead} disabled={loading || unread === 0}>
            Marcar todo como leído
          </Button>
        </div>
      </div>

      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">Sin notificaciones</div>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div key={n.id} className={`p-3 border rounded-md ${n.read_at ? '' : 'bg-muted/40'} cursor-pointer`} onClick={() => onItemClick(n)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{n.title || 'Notificación'}</div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{n.sent_at ? new Date(n.sent_at).toLocaleString('es-AR') : ''}</div>
                </div>
                {!n.read_at && (
                  <Button size="sm" variant="secondary" onClick={() => markOneRead(n.id)}>
                    Marcar leído
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={() => load({ append: true })} disabled={!hasMore || loading}>
              {hasMore ? 'Cargar más' : 'No hay más'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

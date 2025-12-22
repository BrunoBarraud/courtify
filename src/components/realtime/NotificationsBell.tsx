'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type NotificationRow = {
  id?: string
  title?: string
  body?: string
  sent_at?: string
  read_at?: string | null
  notification_type?: string
  data?: Record<string, unknown> | null
}

export const resolveNotificationLink = (n: NotificationRow) => {
  const type = (n.notification_type || '').toLowerCase()
  const data = n.data ?? undefined

  if (type.startsWith('admin_')) {
    const bookingId =
      typeof (data as Record<string, unknown>)?.bookingId === 'string'
        ? (data as Record<string, string>).bookingId
        : undefined
    if (bookingId) {
      return `/admin/bookings?highlight=${bookingId}`
    }
    return '/admin'
  }

  if (type.includes('booking')) return '/bookings'
  if (type.includes('payment')) return '/payments'
  if (type.includes('promotion')) return '/pricing'
  return '/notifications'
}

export default function NotificationsBell() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [items, setItems] = useState<NotificationRow[]>([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  // derive counts if needed in future
  useMemo(() => items.length, [items])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    ;(async () => {
      try {
        // Prefer API to also get unread count with RLS
        const res = await fetch('/api/notifications?limit=10', { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && res.ok) {
          setItems((json.notifications || []) as NotificationRow[])
          setUnread(json.unread || 0)
        }
      } catch {
        // fallback to direct query
        const { data } = await supabase
          .from('notifications')
          .select('id, title, body, sent_at, read_at, notification_type, data')
          .eq('user_id', user.id)
          .eq('channel', 'push')
          .order('sent_at', { ascending: false })
          .limit(10)
        if (!cancelled && data) {
          setItems(data as NotificationRow[])
          setUnread((data as { read_at?: string | null }[]).filter(n => !n.read_at).length)
        }
      }
    })()

    const channel = supabase
      .channel('notifications_bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          const row = payload.new as NotificationRow
          setItems(prev =>
            [
              {
                id: row.id,
                title: row.title,
                body: row.body,
                sent_at: row.sent_at,
                read_at: row.read_at,
                notification_type: row.notification_type,
                data: row.data,
              },
              ...prev,
            ].slice(0, 10)
          )
          setUnread(x => x + 1)
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  // Mark as read on open
  useEffect(() => {
    if (!open) return
    if (unread === 0) return
    ;(async () => {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
      if (res.ok) {
        setUnread(0)
        const now = new Date().toISOString()
        setItems(prev => prev.map(i => ({ ...i, read_at: i.read_at || now })))
      }
    })()
  }, [open, unread])

  const onItemClick = async (n: NotificationRow) => {
    if (!n.id) return
    await fetch(`/api/notifications/${n.id}/read`, { method: 'POST' }).catch(() => {})
    const now = new Date().toISOString()
    setItems(prev => prev.map(i => (i.id === n.id ? { ...i, read_at: i.read_at || now } : i)))
    setUnread(x => Math.max(0, x - (n.read_at ? 0 : 1)))
    router.push(resolveNotificationLink(n))
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-destructive px-1 text-[10px] font-bold text-white flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="text-xs underline">
              Ver todas
            </Link>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={async () => {
                const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' })
                if (res.ok) {
                  setUnread(0)
                  // Also reflect read state in current list
                  const now = new Date().toISOString()
                  setItems(prev => prev.map(i => ({ ...i, read_at: i.read_at || now })))
                }
              }}
            >
              Marcar leído
            </button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">Sin notificaciones</div>
        ) : (
          items.map(n => (
            <DropdownMenuItem
              key={n.id || Math.random()}
              className="flex flex-col items-start gap-1 focus:bg-muted cursor-pointer"
              onClick={() => onItemClick(n)}
            >
              <div className="text-sm font-medium line-clamp-1">{n.title || 'Notificación'}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {n.sent_at ? new Date(n.sent_at).toLocaleString('es-AR') : ''}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

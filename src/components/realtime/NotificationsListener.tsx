'use client'

import { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { toast } from 'sonner'

export default function NotificationsListener() {
  const supabase = useSupabaseClient()
  const user = useUser()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as {
            title?: string
            body?: string
          }
          const title = row?.title || 'Notificación'
          const body = row?.body || ''
          toast(title, { description: body })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  return null
}

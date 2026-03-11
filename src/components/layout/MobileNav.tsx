'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, MapPin, User, CreditCard, Shield, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function MobileNav() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [upcomingCount, setUpcomingCount] = useState<number>(0)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    let notificationsChannel: ReturnType<typeof supabase.channel> | null = null

    const cleanupRealtime = () => {
      if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel)
        notificationsChannel = null
      }
    }

    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!mounted) return
        setUserId(user?.id ?? null)

        if (user?.id) {
          try {
            const res = await fetch('/api/notifications?limit=1', { cache: 'no-store' })
            const json = await res.json()
            if (!mounted) return
            setUnreadNotifications(Number(json?.unread || 0))
          } catch {
            if (!mounted) return
            setUnreadNotifications(0)
          }

          cleanupRealtime()
          notificationsChannel = supabase
            .channel('mobile_nav_notifications')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
              },
              () => {
                setUnreadNotifications(x => x + 1)
              }
            )
            .subscribe()

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (!mounted) return
          setIsAdmin((profile as { role?: string } | null)?.role === 'super_admin')

          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .gte('start_datetime', new Date().toISOString())
          if (!mounted) return
          setUpcomingCount(count || 0)
        } else {
          cleanupRealtime()
          setUpcomingCount(0)
          setIsAdmin(false)
          setUnreadNotifications(0)
        }
      } catch {
        // ignore
      }
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      cleanupRealtime()
      load()
    })

    return () => {
      mounted = false
      cleanupRealtime()
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const items = [
    ...(userId
      ? ([
          { href: '/dashboard', label: 'Inicio', icon: Home },
          { href: '/bookings', label: 'Reservas', icon: Calendar },
          { href: '/venues', label: 'Canchas', icon: MapPin },
          { href: '/payments', label: 'Pagos', icon: CreditCard },
          ...(isAdmin
            ? ([{ href: '/admin/users', label: 'Admin', icon: Shield }] as const)
            : ([] as const)),
          { href: '/notifications', label: 'Notifs', icon: Bell },
        ] as const)
      : ([
          { href: '/auth/signin', label: 'Ingresar', icon: User },
          { href: '/auth/signup', label: 'Registrate', icon: User },
        ] as const)),
  ] as const

  if (!userId && pathname === '/') {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ul
        className={[
          'grid pb-[env(safe-area-inset-bottom)]',
          userId ? (isAdmin ? 'grid-cols-6' : 'grid-cols-5') : 'grid-cols-2',
        ].join(' ')}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className={[
                  'flex flex-col items-center justify-center py-3 text-xs',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {label === 'Reservas' && upcomingCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
                      {upcomingCount > 9 ? '9+' : upcomingCount}
                    </span>
                  )}
                  {label === 'Notifs' && unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[10px] leading-4 text-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </div>
                <span className="mt-1">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

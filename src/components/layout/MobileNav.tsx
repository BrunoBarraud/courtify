'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, MapPin, User, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function MobileNav() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [upcomingCount, setUpcomingCount] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return
        setUserId(user?.id ?? null)

        if (user?.id) {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .gte('start_datetime', new Date().toISOString())
          if (!mounted) return
          setUpcomingCount(count || 0)
        } else {
          setUpcomingCount(0)
        }
      } catch {
        // ignore
      }
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [supabase])

  const items = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/bookings', label: 'Reservas', icon: Calendar },
    { href: '/venues', label: 'Canchas', icon: MapPin },
    { href: '/payments', label: 'Pagos', icon: CreditCard },
    userId
      ? { href: '/perfil', label: 'Perfil', icon: User }
      : { href: '/auth/signin', label: 'Ingresar', icon: User },
  ] as const

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <ul className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
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

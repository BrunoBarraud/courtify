'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, Calendar, Users, BarChart } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
const NotificationsBell = dynamic(() => import('@/components/realtime/NotificationsBell'), {
  ssr: false,
})

// Importar dinámicamente para evitar problemas de importación
const UserMenu = dynamic(() => import('@/components/auth/UserMenu'), { ssr: false })

const MainNav = () => {
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [isAuthed, setIsAuthed] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!mounted) return
        setIsAuthed(!!user)
      } catch {
        if (!mounted) return
        setIsAuthed(false)
      }
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const navItems = [
    {
      href: '/dashboard',
      label: 'Inicio',
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: '/bookings',
      label: 'Reservas',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      href: '/teams',
      label: 'Equipos',
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: '/analytics',
      label: 'Estadísticas',
      icon: <BarChart className="h-5 w-5" />,
    },
  ]

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-20 items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logocomplejo.png"
              alt="Logo Complejo Deportivo"
              width={75}
              height={75}
              priority
            />
            <span className="flex items-baseline gap-1 leading-none">
              <span className="text-[22px] font-extrabold tracking-tight leading-none">
                Complejo
              </span>
              <span className="text-[18px] font-semibold italic text-primary leading-none">
                App
              </span>
            </span>
          </Link>

          {isAuthed && (
            <nav className="hidden md:flex items-center space-x-1 ml-4">
              {navItems.map(item => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    'flex items-center space-x-2 text-sm',
                    pathname === item.href
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline',
                    'justify-start'
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {isAuthed ? (
            <>
              <NotificationsBell />
              <UserMenu />
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="outline">Iniciar sesión</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Registrate</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MainNav

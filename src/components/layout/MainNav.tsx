'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, Calendar, Users, BarChart, Trophy } from 'lucide-react'
// Importación temporal con ruta relativa
import dynamic from 'next/dynamic'

// Importar dinámicamente para evitar problemas de importación
const UserMenu = dynamic(
  () => import('@/components/auth/UserMenu'),
  { ssr: false }
)

const MainNav = () => {
  const pathname = usePathname()

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
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Courtify</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1 ml-4">
            {navItems.map((item) => (
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
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </div>
  )
}

export default MainNav

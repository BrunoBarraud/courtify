'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

// Importar componentes UI con rutas relativas
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export default function UserMenu() {
  const router = useRouter()
  type User = {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      name?: string
      avatar_url?: string
    }
  } | null

  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  type Role = Database['public']['Tables']['profiles']['Row']['role']
  const [role, setRole] = useState<Role | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.debug('[UserMenu] init getUser ->', user?.id, user?.email)
        if (mounted) setUser(user)
        if (mounted && user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          const userRole = (profile as { role: Role } | null)?.role ?? null
          console.debug('[UserMenu] init role ->', userRole)
          if (mounted) setRole(userRole)
        } else if (mounted) {
          setRole(null)
        }
      } catch (error) {
        console.error('Error al cargar el usuario:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    const { data: subscription } = supabase.auth.onAuthStateChange(async evt => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.debug('[UserMenu] onAuthStateChange', evt, '->', user?.id, user?.email)
        if (mounted) setUser(user)
        if (mounted && user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          const newRole = (profile as { role: Role } | null)?.role ?? null
          console.debug('[UserMenu] onAuthStateChange role ->', newRole)
          if (mounted) setRole(newRole)
        } else if (mounted) {
          setRole(null)
        }
      } catch (error) {
        console.error('Error al actualizar el estado de auth:', error)
      }
    })

    init()

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      setIsLoading(true)

      // Llamar al endpoint del servidor para que se encargue de limpiar las cookies fuertemente
      await fetch('/api/auth/signout', { method: 'POST' })

      // También limpiamos en cliente por si acaso
      await supabase.auth.signOut()

      setUser(null)
      setRole(null)
      toast.success('Sesión cerrada correctamente')
      window.location.href = '/'
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Ocurrió un error al cerrar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
  }

  if (!user || !user.email) {
    return (
      <Button variant="outline" onClick={() => router.push('/auth/signin')} className="ml-4">
        Iniciar sesión
      </Button>
    )
  }

  // Obtener iniciales para el avatar
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return email ? email.substring(0, 2).toUpperCase() : 'US'
  }

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        className="relative h-10 justify-start space-x-2 px-2"
        onClick={() => router.push('/profile')}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.email} />
          <AvatarFallback className="bg-indigo-100 text-indigo-700">
            {getInitials(
              user.user_metadata?.full_name || user.user_metadata?.name || '',
              user.email
            )}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-flex flex-col items-start">
          <span className="text-sm font-medium">
            {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 w-8 px-0">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/configuracion')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            {(role === 'super_admin' || role === 'venue_admin') && (
              <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

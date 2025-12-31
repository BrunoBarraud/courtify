'use client'

import { useEffect, useState } from 'react'
import { VenueAdminPermissions } from '@/lib/auth/roles'
import { checkVenuePermission } from '@/lib/auth/permissions'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface PermissionGateProps {
  venueId: string
  permission: keyof VenueAdminPermissions
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PermissionGate({
  venueId,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setHasPermission(false)
          return
        }

        const allowed = await checkVenuePermission(user.id, venueId, permission)
        setHasPermission(allowed)
      } catch (error) {
        console.error('Error checking permission:', error)
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermission()
  }, [supabase, venueId, permission])

  if (isLoading) return null

  return hasPermission ? children : fallback
}

// Componente para botones de acción
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  venueId: string
  permission: keyof VenueAdminPermissions
  children: React.ReactNode
}

export function ActionButton({ venueId, permission, children, ...props }: ActionButtonProps) {
  return (
    <PermissionGate venueId={venueId} permission={permission}>
      <button {...props}>{children}</button>
    </PermissionGate>
  )
}

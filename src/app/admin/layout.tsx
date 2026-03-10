import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { isAdmin, isOwnerOrSuperAdmin } from '@/lib/auth/roles'
import {
  LayoutDashboard,
  CalendarCheck,
  Settings,
  Map,
  UsersRound,
  UserCog,
  LogOut,
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient(() => cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdmin(profile.role)) {
    redirect('/dashboard') // Redirigir a jugador si no es admin ni staff
  }

  const isOwner = isOwnerOrSuperAdmin(profile?.role)

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col lg:flex-row">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden w-full border-b bg-card px-4 py-3 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="font-bold text-lg text-primary flex items-center gap-2">
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
          Admin
        </div>
      </div>

      {/* Desktop Sidebar & Mobile Horizontal Nav Menu Container */}
      <aside className="w-full lg:w-[260px] border-b lg:border-b-0 lg:border-r bg-card shadow-sm lg:min-h-screen lg:sticky lg:top-0 z-40 overflow-x-auto lg:overflow-x-hidden no-scrollbar">
        <div className="font-bold text-xl text-primary hidden lg:flex items-center gap-2 p-6 pb-2">
          <svg
            className="h-7 w-7"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
          CanchaLibre
        </div>

        <nav className="flex lg:flex-col gap-1 text-sm font-medium p-3 lg:p-4 min-w-max lg:min-w-0">
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted text-foreground transition-colors"
            href="/admin"
          >
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted text-foreground transition-colors"
            href="/admin/bookings"
          >
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <span>Agenda / Check-in</span>
          </Link>

          {isOwner && (
            <>
              <div className="hidden lg:block mt-6 mb-2 border-t border-border/50 pt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground px-3">
                Administración
              </div>
              <div className="lg:hidden mx-2 w-px h-6 bg-border/50 self-center" />
              <Link
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted text-foreground transition-colors"
                href="/admin/venues"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Sedes</span>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted text-foreground transition-colors"
                href="/admin/courts"
              >
                <Map className="h-4 w-4 text-muted-foreground" />
                <span>Canchas</span>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted text-foreground transition-colors"
                href="/admin/members"
              >
                <UsersRound className="h-4 w-4 text-muted-foreground" />
                <span>Socios</span>
              </Link>
              <Link
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted text-foreground transition-colors"
                href="/admin/users"
              >
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <span>Staff y Usuarios</span>
              </Link>
            </>
          )}

          <div className="hidden lg:block mt-auto pt-6"></div>
          <div className="lg:hidden mx-2 w-px h-6 bg-border/50 self-center" />
          <Link
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors lg:mt-auto"
            href="/dashboard"
          >
            <LogOut className="h-4 w-4" />
            <span>Volver al sitio</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

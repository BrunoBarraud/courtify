import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Toaster } from 'sonner'
import './globals.css'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import SiteShell from '@/components/layout/SiteShell'
import NotificationsListener from '@/components/realtime/NotificationsListener'
import type { Database } from '@/types/database'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CanchaLibreApp',
  description: 'Gestor de Sedes y Reservas Multi-Tenant',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider initialSession={session}>
          <SiteShell>{children}</SiteShell>
          <NotificationsListener />
          <Toaster position="top-right" richColors />
        </SupabaseProvider>
      </body>
    </html>
  )
}

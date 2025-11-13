import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import SiteShell from '@/components/layout/SiteShell'
import NotificationsListener from '@/components/realtime/NotificationsListener'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Courtify - Sports Court Booking Platform',
  description: 'Book sports courts online with ease. Manage bookings, subscriptions, and tournaments.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider>
          <SiteShell>
            {children}
          </SiteShell>
          <NotificationsListener />
          <Toaster position="top-right" richColors />
        </SupabaseProvider>
      </body>
    </html>
  )
}

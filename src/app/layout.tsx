import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import MainNav from '@/components/layout/MainNav'
import MobileNav from '@/components/layout/MobileNav'

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
          <div className="min-h-screen flex flex-col">
            <MainNav />
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
              {children}
            </main>
            <MobileNav />
          </div>
          <Toaster position="top-right" richColors />
        </SupabaseProvider>
      </body>
    </html>
  )
}

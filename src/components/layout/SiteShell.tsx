'use client'

import { usePathname } from 'next/navigation'
import MainNav from '@/components/layout/MainNav'
import MobileNav from '@/components/layout/MobileNav'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogo = pathname?.startsWith('/logo')

  return (
    <div className="min-h-screen flex flex-col">
      {!isLogo && <MainNav />}
      <main className={isLogo ? '' : 'flex-1 p-4 md:p-8 pb-20 md:pb-8'}>
        {children}
      </main>
      {!isLogo && <MobileNav />}
    </div>
  )
}

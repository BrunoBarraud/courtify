import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/auth/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient(() => cookies())
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', session.user.id)
    .single()

  if (!isAdmin(profile?.role)) redirect('/')

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r bg-muted/40">
        <div className="p-4 font-bold">Admin</div>
        <nav className="flex flex-col p-2 gap-1 text-sm">
          <Link className="px-3 py-2 rounded hover:bg-muted" href="/admin">Panel</Link>
          <Link className="px-3 py-2 rounded hover:bg-muted" href="/admin/venues">Sedes</Link>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}

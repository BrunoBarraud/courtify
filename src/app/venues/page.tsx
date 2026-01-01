import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default async function VenuesPage() {
  const supabase = createServerClient(() => cookies())

  // Obtener la única sede y redirigir directamente a su perfil
  const { data: venues } = await supabase
    .from('venues')
    .select('slug')
    .eq('is_active', true)
    .limit(1)
    .single()

  // Redirigir directamente al perfil de la única sede
  if (venues?.slug) {
    redirect(`/venues/${venues.slug}`)
  }

  // Si no hay sede, redirigir al home
  redirect('/')
}

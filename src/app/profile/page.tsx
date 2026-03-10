import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, User, Calendar, Award, CheckCircle } from 'lucide-react'

type BadgeData = {
  id: string
  badge_name: string
  badge_description: string
  icon_name: string
  awarded_at: string
}

export default async function UserProfilePage() {
  const supabase = createServerClient(() => cookies())

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?next=/profile')
  }

  // 1. Get User Profile Data
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // 2. Get User Badges
  // Since we created the table user_badges with columns: user_id, badge_name, badge_description, icon_name, awarded_at
  const { data: badges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', user.id)
    .order('awarded_at', { ascending: false })

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-6 border-b border-border/50">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-background shadow-md">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.full_name || 'Mi Perfil'}</h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <div className="bg-muted px-4 py-2 rounded-lg border border-border/50 text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Miembro desde: {new Date(profile?.created_at || new Date()).getFullYear()}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Form - Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Datos Personales</CardTitle>
              <CardDescription>
                Actualizá tu información de contacto y preferencias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" defaultValue={profile?.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      defaultValue={profile?.phone || ''}
                      placeholder="+54 9 11..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    defaultValue={profile?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    El correo está vinculado a tu cuenta y no puede cambiarse desde acá.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  {/* El botón en un Server Component no puede tener onClick, usamos type="submit" para un futuro form action */}
                  <Button type="submit">Guardar Cambios</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Estadísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/40">
                  <div className="text-2xl font-black text-primary mb-1">0</div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase font-semibold">
                    Torneos
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/40">
                  <div className="text-2xl font-black text-primary mb-1">0</div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase font-semibold">
                    Victorias
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl text-center border border-border/40 sm:col-span-1 col-span-2">
                  <div className="text-2xl font-black text-primary mb-1">{badges?.length || 0}</div>
                  <div className="text-xs text-muted-foreground tracking-wide uppercase font-semibold">
                    Insignias
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Badges & Achievements */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award className="w-24 h-24" />
            </div>
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Mis Insignias
              </CardTitle>
              <CardDescription>Logros obtenidos en torneos y en la app.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              {!badges || badges.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <Trophy className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Aún no hay insignias</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                    Participá en torneos y competiciones para ganar tus primeros logros.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {badges.map((badge: BadgeData) => (
                    <div
                      key={badge.id}
                      className="flex gap-4 items-start p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors shadow-sm"
                    >
                      <div className="h-10 w-10 shrink-0 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600 border border-yellow-500/20">
                        {/* Render icon conditionally based on name or fallback to award */}
                        {badge.icon_name === 'Trophy' ? (
                          <Trophy className="h-5 w-5" />
                        ) : badge.icon_name === 'CheckCircle' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Award className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{badge.badge_name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {badge.badge_description}
                        </p>
                        <span className="text-[10px] font-medium text-primary mt-2 block uppercase tracking-wider">
                          {new Date(badge.awarded_at).toLocaleDateString('es-AR', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

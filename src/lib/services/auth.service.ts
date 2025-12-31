import { createBrowserClient } from '@/lib/supabase/client'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  } | null
  error: AuthError | null
}

class AuthService {
  private supabase = createBrowserClient()

  /**
   * Inicia sesión con email y contraseña
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  /**
   * Registra un nuevo usuario con email y contraseña
   */
  async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: '',
            avatar_url: '',
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  /**
   * Inicia sesión con Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Obtiene el usuario actualmente autenticado
   */
  async getCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    return user
  }

  /**
   * Obtiene la sesión actual
   */
  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()
    return session
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'phone'>>
  ): Promise<{ data: Profile | null; error: Error | null }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = this.supabase.from('profiles').update(updates as any) as any
      const { data, error } = await query.eq('id', userId).select().single()

      if (error) throw error
      return { data: data ? (data as unknown as Profile) : null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export const authService = new AuthService()

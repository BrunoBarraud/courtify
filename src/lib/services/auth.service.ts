import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session, User, AuthError } from '@supabase/supabase-js'

export type Provider = 'google' | 'github' | 'facebook' | 'twitter'

export interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  } | null
  error: AuthError | null
}

class AuthService {
  private supabase = createClientComponentClient()

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
   * Inicia sesión con proveedor OAuth (Google o GitHub)
   */
  async signInWithOAuth(provider: 'google' | 'github'): Promise<{ url: string; provider: string } | { error: AuthError }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile'
        }
      })

      if (error) {
        console.error(`Error en signInWithOAuth para ${provider}:`, error)
        return { error }
      }

      if (!data?.url) {
        const error = new Error('No se pudo obtener la URL de autenticación') as AuthError
        error.message = 'No se pudo obtener la URL de autenticación'
        return { error }
      }

      // Redirigir manualmente a la URL de autenticación
      window.location.href = data.url
      
      // Retornar los datos para el manejo en el cliente
      return data
    } catch (error) {
      console.error(`Error inesperado en signInWithOAuth (${provider}):`, error)
      // Crear un error de autenticación compatible
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const authError: AuthError = {
        name: 'AuthError',
        message: errorMessage,
        status: 500,
        __isAuthError: true
      } as unknown as AuthError
      return { error: authError }
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
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  /**
   * Obtiene la sesión actual
   */
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string }) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export const authService = new AuthService()

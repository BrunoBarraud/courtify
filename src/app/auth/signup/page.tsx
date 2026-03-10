/**
 * Sign Up Page
 */

'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function SignUpPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-12">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
            <svg
              className="h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Creá tu cuenta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Ya tenés una cuenta?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

        <Card className="border border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Unite a CanchaLibreApp</CardTitle>
            <CardDescription className="text-muted-foreground">Registrate fácil y rápido con tu cuenta de Google.</CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-6">
            <GoogleSignInButton />
          </CardContent>
        </Card>

        {/* Volver al inicio */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground underline underline-offset-4 transition-colors">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  )
}

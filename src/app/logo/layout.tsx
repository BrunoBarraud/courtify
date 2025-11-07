import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Courtify Logo',
  description: 'Standalone large logo view for screenshot.'
}

export default function LogoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout anidado para evitar la navegación global y mostrar solo el contenido del logo
  return <div>{children}</div>
}

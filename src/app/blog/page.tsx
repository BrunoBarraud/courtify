import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatDateTimeAR } from '@/lib/i18n/format'

export const metadata = {
  title: 'Blog | MatchUp',
}

const posts = [
  {
    id: 1,
    title: 'Cómo optimizar la ocupación de tus canchas',
    excerpt: 'Estrategias probadas para maximizar las reservas y reducir horarios vacíos.',
    date: '2025-12-20',
    author: 'Equipo MatchUp',
    category: 'Gestión',
  },
  {
    id: 2,
    title: 'Guía de abonos: Fidelizá a tus clientes',
    excerpt: 'Aprende a diseñar planes de membresía atractivos y rentables.',
    date: '2025-12-15',
    author: 'Equipo MatchUp',
    category: 'Marketing',
  },
  {
    id: 3,
    title: 'Organizar torneos exitosos',
    excerpt: 'Tips para planificar y ejecutar torneos que tus clientes amarán.',
    date: '2025-12-10',
    author: 'Equipo MatchUp',
    category: 'Eventos',
  },
]

export default function BlogPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[900px]">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Recursos y consejos para la gestión de tu club
          </p>
        </div>

        <div className="grid gap-6">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span>{post.category}</span>
                    <span>•</span>
                    <time dateTime={post.date}>{formatDateTimeAR(post.date)}</time>
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Por {post.author}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

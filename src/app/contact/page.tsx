export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[800px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contacto</h1>
          <p className="mt-2 text-muted-foreground">¿Interesado en MatchUp para tu sede?</p>
        </div>

        <div className="text-center space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Bruno Ariel Barraud</h2>
            <p className="text-muted-foreground">Analista de Sistemas</p>
          </div>

          <div className="space-y-2">
            <div>
              <p className="font-medium">Email</p>
              <a
                href="mailto:brunobarraud.contacto@gmail.com"
                className="text-primary hover:underline"
              >
                brunobarraud.contacto@gmail.com
              </a>
            </div>

            <div>
              <p className="font-medium">Teléfono</p>
              <a href="tel:+543537325109" className="text-primary hover:underline">
                (3537) 325109
              </a>
            </div>
          </div>

          <p className="text-muted-foreground">
            Contactanos para conocer más sobre cómo MatchUp puede ayudar a tu sede a optimizar la
            gestión de canchas y reservas.
          </p>
        </div>
      </div>
    </div>
  )
}

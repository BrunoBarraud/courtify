import ContactForm from './ContactForm'

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[800px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contacto</h1>
          <p className="mt-2 text-muted-foreground">Escribinos y te respondemos a la brevedad</p>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}

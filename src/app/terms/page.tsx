export const metadata = {
  title: 'Términos de Servicio | MatchUp',
}

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[800px] prose">
        <h1>Términos de Servicio</h1>
        <p className="lead">
          Al usar MatchUp, aceptás estos términos de servicio. Por favor, leelos cuidadosamente.
        </p>

        <h2>1. Uso del servicio</h2>
        <p>
          MatchUp es una plataforma que facilita la reserva de canchas deportivas. Al usar nuestros
          servicios, te comprometés a:
        </p>
        <ul>
          <li>Proporcionar información precisa y actualizada</li>
          <li>Mantener la seguridad de tu cuenta</li>
          <li>Cumplir con las políticas de reserva y cancelación</li>
          <li>No usar el servicio para fines ilegales</li>
        </ul>

        <h2>2. Cuentas</h2>
        <p>Para usar MatchUp, necesitás crear una cuenta. Sos responsable de:</p>
        <ul>
          <li>Mantener la confidencialidad de tu contraseña</li>
          <li>Todas las actividades bajo tu cuenta</li>
          <li>Notificar cualquier uso no autorizado</li>
        </ul>

        <h2>3. Reservas y pagos</h2>
        <ul>
          <li>Las reservas están sujetas a disponibilidad</li>
          <li>Los precios pueden variar según la sede y horario</li>
          <li>Las cancelaciones siguen la política de cada sede</li>
          <li>Los reembolsos se procesan según términos específicos</li>
        </ul>

        <h2>4. Responsabilidades</h2>
        <p>MatchUp no es responsable por:</p>
        <ul>
          <li>Cancelaciones por parte de las sedes</li>
          <li>Condiciones climáticas adversas</li>
          <li>Problemas técnicos de las instalaciones</li>
          <li>Lesiones o accidentes durante el uso de canchas</li>
        </ul>

        <h2>5. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
          entran en vigor inmediatamente después de su publicación.
        </p>

        <h2>6. Terminación</h2>
        <p>Podemos suspender o terminar cuentas que:</p>
        <ul>
          <li>Violen estos términos</li>
          <li>Realicen actividades fraudulentas</li>
          <li>Causen problemas a otros usuarios</li>
        </ul>

        <h2>7. Contacto</h2>
        <p>
          Para consultas sobre estos términos:
          <br />
          Email: legal@matchup.com
        </p>

        <hr />

        <p className="text-sm text-muted-foreground">Última actualización: Diciembre 2025</p>
      </div>
    </div>
  )
}

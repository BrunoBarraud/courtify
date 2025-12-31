export const metadata = {
  title: 'Política de Privacidad | MatchUp',
}

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-[800px] prose">
        <h1>Política de Privacidad</h1>
        <p className="lead">
          En MatchUp, la privacidad de nuestros usuarios es una prioridad. Esta política describe
          cómo recolectamos, usamos y protegemos tu información.
        </p>

        <h2>Información que recolectamos</h2>
        <ul>
          <li>Información de registro (nombre, email, teléfono)</li>
          <li>Datos de reservas y pagos</li>
          <li>Información de uso de la plataforma</li>
          <li>Cookies y datos de navegación</li>
        </ul>

        <h2>Uso de la información</h2>
        <p>Utilizamos tu información para:</p>
        <ul>
          <li>Procesar reservas y pagos</li>
          <li>Enviar notificaciones importantes</li>
          <li>Mejorar nuestros servicios</li>
          <li>Prevenir fraudes</li>
        </ul>

        <h2>Compartiendo información</h2>
        <p>No vendemos tu información personal. Compartimos datos solo con:</p>
        <ul>
          <li>Proveedores de servicios (procesadores de pago, email)</li>
          <li>Clubes donde realizás reservas</li>
          <li>Autoridades (cuando la ley lo requiere)</li>
        </ul>

        <h2>Seguridad</h2>
        <p>Implementamos medidas de seguridad para proteger tu información:</p>
        <ul>
          <li>Encriptación SSL/TLS</li>
          <li>Acceso restringido a datos personales</li>
          <li>Monitoreo de seguridad 24/7</li>
          <li>Backups regulares</li>
        </ul>

        <h2>Tus derechos</h2>
        <p>Tenés derecho a:</p>
        <ul>
          <li>Acceder a tus datos</li>
          <li>Corregir información inexacta</li>
          <li>Solicitar eliminación de datos</li>
          <li>Oponerte al procesamiento</li>
        </ul>

        <h2>Contacto</h2>
        <p>
          Para ejercer tus derechos o consultas sobre privacidad:
          <br />
          Email: privacy@matchup.com
        </p>

        <hr />

        <p className="text-sm text-muted-foreground">Última actualización: Diciembre 2025</p>
      </div>
    </div>
  )
}

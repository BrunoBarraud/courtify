# Courtify - Plataforma de Reservas de Canchas

Una plataforma SaaS integral para gestionar reservas de canchas, abonos, torneos y pagos para clubes y complejos deportivos.

## 🚀 Funcionalidades

### Funcionalidades principales
- **Reservas online**: Disponibilidad en tiempo real y confirmación inmediata
- **Multi-sede**: Administrá múltiples ubicaciones desde una sola plataforma
- **Pagos**: Integración con Stripe y Mercado Pago
- **Abonos y membresías**: Planes flexibles con créditos para reservas
- **Torneos**: Organización y gestión de torneos deportivos
- **Notificaciones automáticas**: Email y push con SendGrid y Firebase Cloud Messaging
- **Políticas de cancelación**: Reglas flexibles de reintegros según anticipación
- **Lista de espera**: Avisos automáticos cuando haya disponibilidad
- **Facturación**: Generación automática de comprobantes

### Roles de usuario
- **Clientes**: Reservan canchas, gestionan abonos, participan en torneos
- **Administradores de sede**: Gestionan canchas, reservas y configuración de la sede
- **Super Administradores**: Administración global de la plataforma

## 🏗️ Arquitectura

### Stack tecnológico
- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Rutas API de Next.js
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe, Mercado Pago
- **Notificaciones**: SendGrid (Email), Firebase Cloud Messaging (Push)
- **Testing**: Jest (Unitario), Playwright (E2E)

### Patrones de diseño
- **Observer**: Sistema de notificaciones con múltiples canales (email, push, SMS)
- **Strategy**: Procesamiento de pagos con pasarelas intercambiables
- **Repository**: Abstracción de acceso a datos
- **Service Layer**: Separación de la lógica de negocio

## 📦 Instalación

### Requisitos previos
- Node.js 18+
- npm 9+
- Cuenta de Supabase
- Cuenta de Stripe
- Cuenta de Mercado Pago (opcional)
- Cuenta de SendGrid
- Proyecto de Firebase

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd courtify
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editá `.env` con tus credenciales:
```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@courtify.com

# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key
```

4. **Configurar Supabase**

Instalar Supabase CLI:
```bash
npm install -g supabase
```

Inicializar Supabase:
```bash
supabase init
```

Vincular a tu proyecto:
```bash
supabase link --project-ref your-project-ref
```

Ejecutar migraciones:
```bash
supabase db push
```

5. **Levantar el servidor de desarrollo**
```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Testing

### Tests unitarios
```bash
npm test
```

### Tests E2E
```bash
npm run test:e2e
```

### Tests E2E con UI
```bash
npm run test:e2e:ui
```

## 📊 Esquema de base de datos

### Tablas principales
- **profiles**: Perfiles de usuario y roles
- **venues**: Clubes/instalaciones deportivas
- **courts**: Canchas dentro de cada sede
- **bookings**: Reservas de canchas
- **payments**: Transacciones de pago
- **invoices**: Comprobantes generados
- **subscription_plans**: Planes de membresía
- **user_subscriptions**: Suscripciones activas por usuario
- **tournaments**: Información de torneos
- **promotions**: Códigos y promociones
- **notifications**: Notificaciones a usuarios
- **waitlist**: Lista de espera de canchas
- **reviews**: Reseñas de sedes y canchas

Ver `supabase/migrations/20250101000000_initial_schema.sql` para el esquema completo.

## 🔌 Endpoints API

### Autenticación
- `POST /api/auth/signup` - Registrar usuario
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión

### Reservas
- `GET /api/bookings` - Obtener reservas del usuario
- `POST /api/bookings` - Crear nueva reserva
- `GET /api/bookings/[id]` - Obtener detalle de una reserva
- `POST /api/bookings/[id]/cancel` - Cancelar reserva

### Canchas
- `GET /api/courts` - Listar canchas
- `GET /api/courts/[id]` - Obtener detalle de cancha
- `GET /api/courts/[id]/availability` - Consultar disponibilidad

### Pagos
- `POST /api/payments/create` - Crear intento de pago
- `POST /api/payments/webhook` - Handler de webhook de pagos

### Sedes
- `GET /api/venues` - Listar sedes
- `GET /api/venues/[id]` - Obtener detalle de sede

## 🎨 Componentes UI

Construido con Radix UI y TailwindCSS para una interfaz moderna y accesible:
- Button, Card, Input, Label
- Dialog, Dropdown, Select, Tabs
- Toast notifications
- Formularios con validación

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Autenticación basada en JWT vía Supabase
- Protección de rutas API con validación de sesión
- Procesamiento de pagos seguro (cumplimiento PCI vía Stripe/Mercado Pago)
- Protección de variables de entorno

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t courtify .
docker run -p 3000:3000 courtify
```

### Variables de entorno
Asegurate de configurar todas las variables en tu plataforma de despliegue.

## 📝 Guías de desarrollo

### Estilo de código
- TypeScript en modo estricto
- ESLint para calidad de código
- Prettier para formato (recomendado)

### Flujo de trabajo con Git
```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

### Convención de commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato/estilo
- `refactor:` Refactor de código
- `test:` Tests
- `chore:` Mantenimiento

## 📚 Documentación

### Capa de servicios
- `BookingService`: Maneja lógica de reservas y disponibilidad
- `PaymentService`: Gestiona pagos con múltiples pasarelas
- `NotificationService`: Envía notificaciones por múltiples canales

### Patrones de diseño
- **Observer**: `NotificationService` con `EmailNotificationObserver` y `PushNotificationObserver`
- **Strategy**: `PaymentService` con `StripePaymentStrategy` y `MercadoPagoPaymentStrategy`

## 🤝 Contribuir

1. Hacé un fork del repositorio
2. Creá tu rama de funcionalidad
3. Commit de tus cambios
4. Push a la rama
5. Creá un Pull Request

## 📄 Licencia

Este proyecto es software propietario. Todos los derechos reservados.



## 👥 Equipo

Hecho con ❤️ por el equipo de Courtify.

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025

# Courtify - Sports Court Booking Platform

A comprehensive SaaS platform for managing sports court bookings, subscriptions, tournaments, and payments for clubs and complexes.

## 🚀 Features

### Core Functionality
- **Online Booking System**: Real-time court availability and instant booking confirmation
- **Multi-Venue Support**: Manage multiple locations from a single platform
- **Payment Processing**: Integrated with Stripe and MercadoPago
- **Subscription Management**: Flexible membership plans with credit-based bookings
- **Tournament Management**: Organize and manage sports tournaments
- **Automated Notifications**: Email and push notifications via SendGrid and Firebase Cloud Messaging
- **Cancellation Policies**: Flexible refund rules based on cancellation timing
- **Waitlist Management**: Automatic notifications when courts become available
- **Invoice Generation**: Automated invoicing and receipt generation

### User Roles
- **Customers**: Book courts, manage subscriptions, join tournaments
- **Venue Admins**: Manage courts, bookings, and venue settings
- **Super Admins**: Platform-wide administration

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe, MercadoPago
- **Notifications**: SendGrid (Email), Firebase Cloud Messaging (Push)
- **Testing**: Jest (Unit), Playwright (E2E)

### Design Patterns
- **Observer Pattern**: Notification system with multiple channels (email, push, SMS)
- **Strategy Pattern**: Payment processing with pluggable payment gateways
- **Repository Pattern**: Data access layer abstraction
- **Service Layer**: Business logic separation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+
- Supabase account
- Stripe account
- MercadoPago account (optional)
- SendGrid account
- Firebase project

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd courtify
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
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

4. **Set up Supabase**

Install Supabase CLI:
```bash
npm install -g supabase
```

Initialize Supabase:
```bash
supabase init
```

Link to your project:
```bash
supabase link --project-ref your-project-ref
```

Run migrations:
```bash
supabase db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### E2E Tests with UI
```bash
npm run test:e2e:ui
```

## 📊 Database Schema

### Main Tables
- **profiles**: User profiles and roles
- **venues**: Sports facilities/clubs
- **courts**: Individual courts within venues
- **bookings**: Court reservations
- **payments**: Payment transactions
- **invoices**: Generated invoices
- **subscription_plans**: Membership plans
- **user_subscriptions**: Active user subscriptions
- **tournaments**: Tournament information
- **promotions**: Discount codes and promotions
- **notifications**: User notifications
- **waitlist**: Court waitlist entries
- **reviews**: Venue and court reviews

See `supabase/migrations/20250101000000_initial_schema.sql` for complete schema.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `POST /api/bookings/[id]/cancel` - Cancel booking

### Courts
- `GET /api/courts` - List courts
- `GET /api/courts/[id]` - Get court details
- `GET /api/courts/[id]/availability` - Check availability

### Payments
- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/webhook` - Payment webhook handler

### Venues
- `GET /api/venues` - List venues
- `GET /api/venues/[id]` - Get venue details

## 🎨 UI Components

Built with Radix UI and TailwindCSS for a modern, accessible interface:
- Button, Card, Input, Label
- Dialog, Dropdown, Select, Tabs
- Toast notifications
- Form components with validation

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- API route protection with session validation
- Secure payment processing (PCI compliant via Stripe/MercadoPago)
- Environment variable protection

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t courtify .
docker run -p 3000:3000 courtify
```

### Environment Variables
Ensure all environment variables are set in your deployment platform.

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (recommended)

### Git Workflow
```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 📚 Documentation

### Service Layer
- `BookingService`: Handles booking logic and availability
- `PaymentService`: Manages payment processing with multiple gateways
- `NotificationService`: Sends notifications via multiple channels

### Design Patterns
- **Observer Pattern**: `NotificationService` with `EmailNotificationObserver` and `PushNotificationObserver`
- **Strategy Pattern**: `PaymentService` with `StripePaymentStrategy` and `MercadoPagoPaymentStrategy`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@courtify.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Equipment rental management
- [ ] Coaching session booking
- [ ] Loyalty points system
- [ ] Social features (player matching)

## 👥 Team

Built with ❤️ by the Courtify team.

---

**Version**: 1.0.0  
**Last Updated**: January 2025

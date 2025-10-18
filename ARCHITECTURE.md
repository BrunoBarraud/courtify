# Courtify Architecture Documentation

## 🏛️ System Architecture

### Overview
Courtify is built as a modern, scalable SaaS platform using Next.js 14 with the App Router, providing both server-side and client-side rendering capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Next.js Frontend - React Components + TailwindCSS)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Next.js)                      │
│  • Authentication Routes                                     │
│  • Booking Management Routes                                 │
│  • Payment Processing Routes                                 │
│  • Venue & Court Management Routes                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  • BookingService (Business Logic)                          │
│  • PaymentService (Strategy Pattern)                        │
│  • NotificationService (Observer Pattern)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│              Supabase Client (PostgreSQL)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  • Stripe/MercadoPago (Payments)                            │
│  • SendGrid (Email)                                          │
│  • Firebase Cloud Messaging (Push Notifications)            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
courtify/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── bookings/             # Booking endpoints
│   │   │   ├── courts/               # Court endpoints
│   │   │   ├── payments/             # Payment endpoints
│   │   │   └── venues/               # Venue endpoints
│   │   ├── dashboard/                # Dashboard pages
│   │   ├── auth/                     # Auth pages
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # Reusable UI components
│   │   ├── booking/                  # Booking-specific components
│   │   ├── court/                    # Court-specific components
│   │   └── layout/                   # Layout components
│   │
│   ├── lib/                          # Core Libraries
│   │   ├── services/                 # Business Logic Services
│   │   │   ├── BookingService.ts
│   │   │   ├── payment/
│   │   │   │   ├── PaymentService.ts
│   │   │   │   ├── StripePaymentStrategy.ts
│   │   │   │   └── MercadoPagoPaymentStrategy.ts
│   │   │   └── notification/
│   │   │       ├── NotificationService.ts
│   │   │       ├── EmailNotificationObserver.ts
│   │   │       └── PushNotificationObserver.ts
│   │   │
│   │   ├── supabase/                 # Supabase configuration
│   │   │   └── client.ts
│   │   ├── validations/              # Zod schemas
│   │   └── utils.ts                  # Utility functions
│   │
│   └── types/                        # TypeScript types
│       └── database.ts               # Database types
│
├── supabase/                         # Supabase configuration
│   └── migrations/                   # Database migrations
│       └── 20250101000000_initial_schema.sql
│
├── tests/                            # Test files
│   ├── e2e/                          # End-to-end tests
│   └── unit/                         # Unit tests
│
├── public/                           # Static assets
├── .env.example                      # Environment variables template
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Jest configuration
├── playwright.config.ts              # Playwright configuration
└── package.json                      # Dependencies
```

## 🎯 Design Patterns

### 1. Observer Pattern (Notification System)

**Purpose**: Decouple notification sending from business logic, allowing multiple notification channels.

**Implementation**:
```typescript
// Subject
class NotificationService {
  private observers: Map<string, NotificationObserver>
  
  registerObserver(name: string, observer: NotificationObserver)
  notify(notification: NotificationData)
}

// Observers
class EmailNotificationObserver implements NotificationObserver
class PushNotificationObserver implements NotificationObserver
class SMSNotificationObserver implements NotificationObserver
```

**Benefits**:
- Easy to add new notification channels
- Notifications can be sent through multiple channels simultaneously
- Business logic doesn't need to know about notification implementation

### 2. Strategy Pattern (Payment Processing)

**Purpose**: Support multiple payment gateways with a unified interface.

**Implementation**:
```typescript
// Strategy Interface
interface PaymentStrategy {
  createPayment(data: PaymentData): Promise<PaymentResult>
  confirmPayment(paymentId: string): Promise<PaymentResult>
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResult>
}

// Concrete Strategies
class StripePaymentStrategy implements PaymentStrategy
class MercadoPagoPaymentStrategy implements PaymentStrategy

// Context
class PaymentService {
  private strategies: Map<string, PaymentStrategy>
  
  registerStrategy(name: string, strategy: PaymentStrategy)
  createPayment(method: string, data: PaymentData)
}
```

**Benefits**:
- Easy to add new payment gateways
- Payment logic is isolated and testable
- Runtime selection of payment method

### 3. Repository Pattern (Data Access)

**Purpose**: Abstract database operations and provide a clean API for data access.

**Implementation**:
- Supabase client wrapper
- Service layer methods for CRUD operations
- Type-safe database queries

## 🔄 Data Flow

### Booking Creation Flow

```
1. User submits booking form
   ↓
2. Frontend validates input (Zod schema)
   ↓
3. POST /api/bookings
   ↓
4. API route authenticates user
   ↓
5. BookingService.createBooking()
   ├─ Check availability
   ├─ Calculate pricing
   ├─ Apply promotions
   ├─ Create booking record
   └─ Send confirmation notification
   ↓
6. Return booking details to client
   ↓
7. Redirect to payment page
```

### Payment Processing Flow

```
1. User initiates payment
   ↓
2. POST /api/payments/create
   ↓
3. PaymentService.createPayment()
   ├─ Select payment strategy (Stripe/MercadoPago)
   ├─ Create payment intent
   ├─ Store payment record
   └─ Return client secret
   ↓
4. Client confirms payment
   ↓
5. Webhook receives confirmation
   ↓
6. Update payment status
   ↓
7. Update booking status
   ↓
8. Send payment confirmation notification
   ↓
9. Generate invoice
```

### Notification Flow

```
1. Event occurs (booking created, payment received, etc.)
   ↓
2. Service calls NotificationService.notify()
   ↓
3. NotificationService:
   ├─ Fetch user preferences
   ├─ Determine channels (email, push, SMS)
   ├─ Notify all registered observers
   │  ├─ EmailNotificationObserver → SendGrid
   │  ├─ PushNotificationObserver → Firebase
   │  └─ SMSNotificationObserver → Twilio
   └─ Store notification in database
```

## 🗄️ Database Design

### Key Relationships

```
venues (1) ─────── (N) courts
                      │
                      │ (N)
                      ↓
users (1) ────────── (N) bookings
  │                      │
  │ (N)                  │ (1)
  ↓                      ↓
user_subscriptions    payments
  │
  │ (N)
  ↓
subscription_usage
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only view/edit their own data
- Venue admins can manage their venue's data
- Super admins have full access

### Indexes

Strategic indexes on:
- Foreign keys
- Frequently queried fields (status, dates)
- Search fields (venue name, city)

## 🔐 Security Architecture

### Authentication Flow

```
1. User signs up/signs in
   ↓
2. Supabase Auth creates session
   ↓
3. JWT token stored in httpOnly cookie
   ↓
4. Token included in all API requests
   ↓
5. API routes verify token
   ↓
6. RLS policies enforce data access
```

### Security Measures

- **Authentication**: Supabase Auth with JWT
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row Level Security (RLS)
- **API Security**: Session validation on all protected routes
- **Payment Security**: PCI compliance via Stripe/MercadoPago
- **Environment Variables**: Sensitive data in environment variables
- **HTTPS**: All production traffic over HTTPS

## 📊 Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session stored in Supabase (not in-memory)
- Can deploy multiple Next.js instances

### Database Optimization
- Indexed queries
- Connection pooling via Supabase
- Prepared statements
- Query optimization

### Caching Strategy
- Static pages cached at CDN level
- API responses cached where appropriate
- Client-side caching with React Query (future)

### Performance
- Server-side rendering for SEO
- Client-side rendering for interactivity
- Code splitting and lazy loading
- Image optimization with Next.js Image

## 🧪 Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Validation schemas

### Integration Tests
- API routes
- Database operations
- External service integrations

### E2E Tests
- Critical user flows
- Booking process
- Payment process
- Authentication

### Contract Tests
- API endpoint contracts
- Database schema validation
- External API integrations

## 🚀 Deployment Architecture

### Production Setup

```
┌─────────────────┐
│   Vercel CDN    │ ← Static assets, edge caching
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js App    │ ← Serverless functions
└────────┬────────┘
         │
         ├─────────────┐
         ▼             ▼
┌──────────────┐  ┌──────────────┐
│   Supabase   │  │   External   │
│  (Database)  │  │   Services   │
└──────────────┘  └──────────────┘
```

### Environment Separation
- **Development**: Local Supabase, test payment keys
- **Staging**: Staging Supabase, test payment keys
- **Production**: Production Supabase, live payment keys

## 📈 Monitoring & Observability

### Logging
- API request/response logging
- Error logging with stack traces
- Payment transaction logging
- User action logging (audit trail)

### Metrics
- API response times
- Database query performance
- Payment success rates
- User engagement metrics

### Alerts
- Failed payments
- System errors
- High latency
- Database connection issues

## 🔄 Future Enhancements

### Planned Improvements
1. **Caching Layer**: Redis for frequently accessed data
2. **Message Queue**: Bull/BullMQ for background jobs
3. **Real-time Updates**: WebSocket for live availability
4. **Analytics Dashboard**: Advanced reporting and insights
5. **Mobile App**: React Native application
6. **Microservices**: Split into domain-specific services
7. **GraphQL API**: Alternative to REST API
8. **Event Sourcing**: For audit trail and replay capability

---

**Last Updated**: January 2025  
**Version**: 1.0.0

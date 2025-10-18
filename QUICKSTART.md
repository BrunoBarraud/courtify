# Courtify Quick Start Guide

Get Courtify up and running in 15 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd courtify
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials. **Minimum required for local development:**

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Set Up Supabase

#### Option A: Use Supabase Cloud (Recommended for Quick Start)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy your project URL and keys from Settings → API
4. In the SQL Editor, paste and run the migration from:
   `supabase/migrations/20250101000000_initial_schema.sql`

#### Option B: Use Local Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📝 First Steps

### Create Your First User

1. Navigate to http://localhost:3000/auth/signup
2. Fill in the registration form
3. Check your email for verification (if email is configured)
4. Sign in at http://localhost:3000/auth/signin

### Create a Test Venue

Use the Supabase dashboard or run this SQL:

```sql
-- Create a test venue
INSERT INTO venues (name, slug, address, city, country, phone, email)
VALUES (
  'Test Sports Club',
  'test-sports-club',
  '123 Main Street',
  'Miami',
  'USA',
  '+1234567890',
  'info@testsportsclub.com'
);

-- Get the venue ID
SELECT id FROM venues WHERE slug = 'test-sports-club';

-- Create a test court (replace venue_id with actual ID)
INSERT INTO courts (venue_id, name, court_type, hourly_rate, is_indoor, has_lighting)
VALUES (
  'your-venue-id-here',
  'Court 1',
  'tennis',
  50.00,
  false,
  true
);
```

### Make Your First Booking

1. Go to http://localhost:3000/venues
2. Select a venue
3. Choose a court
4. Select date and time
5. Complete the booking

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run E2E Tests

```bash
# Start dev server first
npm run dev

# In another terminal
npm run test:e2e
```

## 🔧 Optional Integrations

### Stripe (for Payments)

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. Add to `.env`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### SendGrid (for Emails)

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Add to `.env`:

```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Firebase (for Push Notifications)

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Cloud Messaging
3. Download service account key
4. Add to `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
```

## 📚 Next Steps

### For Developers

1. **Explore the codebase**
   - `src/app/` - Next.js pages and API routes
   - `src/lib/services/` - Business logic
   - `src/components/` - React components

2. **Read the documentation**
   - [Architecture Guide](./ARCHITECTURE.md)
   - [API Documentation](./API_DOCUMENTATION.md)
   - [Deployment Guide](./DEPLOYMENT.md)

3. **Customize the platform**
   - Modify UI components in `src/components/ui/`
   - Add new features in `src/lib/services/`
   - Extend database schema in `supabase/migrations/`

### For Administrators

1. **Configure your venue**
   - Add venue details
   - Upload logo and images
   - Set opening hours
   - Add amenities

2. **Set up courts**
   - Add courts with details
   - Configure pricing
   - Set availability rules

3. **Create subscription plans**
   - Define membership tiers
   - Set pricing and credits
   - Configure restrictions

4. **Set up promotions**
   - Create discount codes
   - Set validity periods
   - Configure usage limits

## 🎯 Common Tasks

### Add a New Court Type

1. Update enum in `supabase/migrations/`:
```sql
ALTER TYPE court_type ADD VALUE 'squash';
```

2. Update TypeScript types in `src/types/database.ts`

### Create a Promotion

```sql
INSERT INTO promotions (
  code, name, description,
  discount_type, discount_value,
  start_date, end_date
) VALUES (
  'SUMMER2025',
  'Summer Special',
  '20% off all bookings',
  'percentage',
  20,
  '2025-06-01',
  '2025-08-31'
);
```

### Add Venue Administrator

```sql
-- First, get the user ID and venue ID
-- Then insert into venue_admins
INSERT INTO venue_admins (venue_id, user_id, permissions)
VALUES (
  'venue-uuid',
  'user-uuid',
  '{"can_manage_bookings": true, "can_manage_courts": true}'
);
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Issues

```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript Errors

```bash
# Regenerate types
npm run type-check
```

## 📞 Getting Help

- **Documentation**: Check the docs in this repository
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord server
- **Email**: support@courtify.com

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Tutorials](https://supabase.com/docs/guides)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Development server running
- [ ] Test user created
- [ ] Test venue and court created
- [ ] First booking completed
- [ ] Tests passing

## 🎉 You're Ready!

Congratulations! You now have Courtify running locally. Start building your sports court booking platform!

### What's Next?

1. **Customize the UI** - Make it match your brand
2. **Add your venues** - Import your real data
3. **Configure payments** - Set up Stripe/MercadoPago
4. **Deploy to production** - Follow the [Deployment Guide](./DEPLOYMENT.md)

---

**Need help?** Open an issue or contact support@courtify.com

**Happy coding!** 🚀

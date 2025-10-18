# Courtify Installation Guide

Complete step-by-step installation instructions for Courtify.

## 📋 System Requirements

### Required
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### Recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for dependencies
- **Internet Connection**: Required for package installation

## 🚀 Installation Methods

### Method 1: Automated Setup (Recommended)

#### Windows (PowerShell)
```powershell
cd courtify
.\scripts\setup.ps1
```

#### macOS/Linux (Bash)
```bash
cd courtify
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Method 2: Manual Setup

Follow these steps for manual installation:

#### Step 1: Verify Prerequisites

Check Node.js version:
```bash
node -v
# Should output v18.x.x or higher
```

Check npm version:
```bash
npm -v
# Should output 9.x.x or higher
```

#### Step 2: Install Dependencies

```bash
cd courtify
npm install
```

This will install all required dependencies including:
- Next.js and React
- Supabase client
- Payment SDKs (Stripe, MercadoPago)
- Notification services (SendGrid, Firebase)
- UI components (Radix UI, TailwindCSS)
- Testing frameworks (Jest, Playwright)

**Expected time**: 2-5 minutes depending on internet speed

#### Step 3: Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

**Minimum required for local development:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Optional (for full functionality):**
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxx
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxx
```

#### Step 4: Set Up Database

##### Option A: Supabase Cloud (Recommended)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account
   - Create new project

2. **Get Project Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

3. **Run Database Migration**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/migrations/20250101000000_initial_schema.sql`
   - Paste and run in SQL Editor
   - Wait for completion (may take 30-60 seconds)

##### Option B: Local Supabase

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Initialize Supabase**
```bash
supabase init
```

3. **Start Local Supabase**
```bash
supabase start
```

This will start:
- PostgreSQL database
- Supabase Studio (GUI)
- Auth server
- Storage server
- Edge Functions

4. **Apply Migrations**
```bash
supabase db reset
```

5. **Get Local Credentials**
```bash
supabase status
```

Copy the displayed URLs and keys to your `.env` file.

#### Step 5: Verify Installation

Run the development server:
```bash
npm run dev
```

Open browser to [http://localhost:3000](http://localhost:3000)

You should see the Courtify landing page.

## 🔧 Configuration

### Payment Gateways

#### Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for account

2. **Get Test API Keys**
   - Go to Developers → API keys
   - Copy Publishable key and Secret key
   - Add to `.env`

3. **Set Up Webhooks** (for production)
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copy webhook signing secret

#### MercadoPago Setup

1. **Create MercadoPago Account**
   - Go to [mercadopago.com](https://www.mercadopago.com)
   - Sign up for account

2. **Get Test Credentials**
   - Go to Your integrations → Credentials
   - Copy Test Public Key and Test Access Token
   - Add to `.env`

### Email Service (SendGrid)

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up (free tier available)

2. **Verify Sender**
   - Go to Settings → Sender Authentication
   - Verify single sender email OR
   - Verify domain (recommended for production)

3. **Create API Key**
   - Go to Settings → API Keys
   - Create new key with "Full Access"
   - Copy key and add to `.env`

4. **Create Email Templates** (optional)
   - Go to Email API → Dynamic Templates
   - Create templates for:
     - Booking confirmation
     - Payment receipt
     - Booking reminder
     - Cancellation notice

### Push Notifications (Firebase)

1. **Create Firebase Project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Create new project

2. **Enable Cloud Messaging**
   - Go to Project Settings → Cloud Messaging
   - Enable Cloud Messaging API

3. **Generate VAPID Key**
   - In Cloud Messaging settings
   - Generate Web Push certificates
   - Copy VAPID key

4. **Download Service Account**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download JSON file
   - Extract credentials:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`

## 🧪 Testing Installation

### Run Unit Tests
```bash
npm test
```

Expected output: All tests passing

### Run E2E Tests
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Landing page loads
- [ ] Sign up page accessible
- [ ] Sign in page accessible
- [ ] Can create account
- [ ] Can sign in
- [ ] Dashboard loads after sign in
- [ ] API endpoints respond

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port 3000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Issue: Supabase connection errors

**Solution:**
- Verify `.env` has correct Supabase URL and keys
- Check Supabase project is running
- Verify network connection
- Check Supabase dashboard for project status

#### Issue: Database migration fails

**Solution:**
- Check SQL syntax in migration file
- Verify Supabase project permissions
- Try running migration in smaller chunks
- Check Supabase logs for specific errors

#### Issue: TypeScript errors

**Solution:**
```bash
npm run type-check
```

Fix any reported type errors.

#### Issue: Build fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Getting Help

If you encounter issues:

1. **Check Documentation**
   - README.md
   - QUICKSTART.md
   - This file

2. **Check Logs**
   - Browser console (F12)
   - Terminal output
   - Supabase logs

3. **Search Issues**
   - Check GitHub issues
   - Search error messages

4. **Ask for Help**
   - Open GitHub issue
   - Email: support@courtify.com

## 📦 What Gets Installed

### Production Dependencies (27 packages)
- **Framework**: Next.js, React
- **Database**: Supabase client
- **Payments**: Stripe, MercadoPago
- **Email**: SendGrid
- **Push**: Firebase Admin
- **Validation**: Zod
- **State**: Zustand
- **Forms**: React Hook Form
- **UI**: Radix UI components
- **Styling**: TailwindCSS utilities
- **Date**: date-fns
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

### Development Dependencies (14 packages)
- **TypeScript**: Type checking
- **ESLint**: Code linting
- **Testing**: Jest, Playwright, Testing Library
- **Build**: PostCSS, Autoprefixer
- **Database**: Supabase CLI

### Total Size
- **node_modules**: ~300-400 MB
- **Build output**: ~50-100 MB

## 🔄 Updating

### Update Dependencies

Check for updates:
```bash
npm outdated
```

Update all dependencies:
```bash
npm update
```

Update specific package:
```bash
npm update next
```

### Update Database Schema

1. Create new migration file in `supabase/migrations/`
2. Run migration:
```bash
supabase db push
```

## ✅ Post-Installation

After successful installation:

1. **Create Test Data**
   - Add a test venue
   - Create test courts
   - Make test bookings

2. **Configure Settings**
   - Update branding
   - Set up email templates
   - Configure payment methods

3. **Test Features**
   - User registration
   - Booking flow
   - Payment processing
   - Notifications

4. **Read Documentation**
   - API_DOCUMENTATION.md
   - ARCHITECTURE.md
   - DEPLOYMENT.md

## 🎓 Next Steps

- **Development**: Start building features
- **Customization**: Modify UI and branding
- **Testing**: Write tests for new features
- **Deployment**: Follow DEPLOYMENT.md guide

## 📞 Support

- **Email**: support@courtify.com
- **Documentation**: Check all .md files in root
- **GitHub**: Open an issue

---

**Installation Guide Version**: 1.0.0  
**Last Updated**: January 2025

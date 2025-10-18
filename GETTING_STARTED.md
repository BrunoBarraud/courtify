# Getting Started with Courtify

Welcome to Courtify! This guide will help you get started quickly.

## 🎯 What is Courtify?

Courtify is a complete SaaS platform for managing sports court bookings. It includes:

- ✅ Online booking system with real-time availability
- ✅ Multi-venue and multi-court management
- ✅ Payment processing (Stripe & MercadoPago)
- ✅ Subscription/membership management
- ✅ Tournament organization
- ✅ Automated notifications (email & push)
- ✅ Admin dashboard
- ✅ Mobile-ready API

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Supabase credentials
# Minimum required:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 🎉

## 📚 Documentation Structure

We've created comprehensive documentation for you:

### For Getting Started
- **GETTING_STARTED.md** (this file) - Quick overview
- **QUICKSTART.md** - 15-minute setup guide
- **INSTALLATION.md** - Detailed installation instructions

### For Development
- **README.md** - Project overview and features
- **ARCHITECTURE.md** - System architecture and design patterns
- **API_DOCUMENTATION.md** - Complete API reference

### For Deployment
- **DEPLOYMENT.md** - Production deployment guide

### For Understanding the Project
- **PROJECT_SUMMARY.md** - Complete project summary

## 🗂️ Project Structure

```
courtify/
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── api/               # Backend API endpoints
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   └── page.tsx           # Landing page
│   │
│   ├── components/            # React components
│   │   └── ui/               # Reusable UI components
│   │
│   ├── lib/                   # Core business logic
│   │   ├── services/         # Service layer
│   │   ├── supabase/         # Database client
│   │   ├── validations/      # Input validation
│   │   └── utils.ts          # Utility functions
│   │
│   └── types/                # TypeScript types
│
├── supabase/                  # Database
│   └── migrations/           # SQL migrations
│
├── tests/                     # Tests
│   ├── e2e/                  # End-to-end tests
│   └── unit/                 # Unit tests
│
└── Documentation files (.md)
```

## 🔑 Key Concepts

### 1. Venues
Sports facilities/clubs that have courts. Each venue can have multiple courts.

### 2. Courts
Individual playing areas (tennis court, football field, etc.) within a venue.

### 3. Bookings
Reservations made by users for specific courts at specific times.

### 4. Subscriptions
Membership plans that give users credits for bookings.

### 5. Tournaments
Organized competitions with registration, brackets, and match scheduling.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe, MercadoPago
- **Email**: SendGrid
- **Push**: Firebase Cloud Messaging
- **Testing**: Jest, Playwright

## 📖 Common Tasks

### Create a New User
1. Go to `/auth/signup`
2. Fill in registration form
3. Verify email (if configured)
4. Sign in at `/auth/signin`

### Add a Venue (via SQL)
```sql
INSERT INTO venues (name, slug, address, city, country)
VALUES ('My Sports Club', 'my-sports-club', '123 Main St', 'Miami', 'USA');
```

### Add a Court (via SQL)
```sql
INSERT INTO courts (venue_id, name, court_type, hourly_rate)
VALUES ('venue-id', 'Court 1', 'tennis', 50.00);
```

### Make a Booking (via API)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "courtId": "court-id",
    "startDatetime": "2025-01-15T10:00:00Z",
    "endDatetime": "2025-01-15T11:00:00Z"
  }'
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test
```bash
npm test BookingService
```

## 🎨 Customization

### Change Colors
Edit `src/app/globals.css`:
```css
:root {
  --primary: 142 76% 36%;  /* Change this */
}
```

### Add New Page
1. Create file in `src/app/your-page/page.tsx`
2. Add route in navigation

### Add New API Endpoint
1. Create file in `src/app/api/your-endpoint/route.ts`
2. Implement GET/POST/PUT/DELETE handlers

### Modify Database
1. Create new migration in `supabase/migrations/`
2. Run migration in Supabase dashboard

## 🔐 Security

- All API routes check authentication
- Database uses Row Level Security (RLS)
- Passwords are hashed
- Payment data never touches your server
- Environment variables for secrets

## 📱 Mobile App Ready

The backend API is ready for mobile app integration:
- RESTful API endpoints
- JWT authentication
- Push notification support
- Payment processing

## 🚀 Deployment

When ready to deploy:

1. **Set up production Supabase**
   - Create production project
   - Run migrations
   - Get production keys

2. **Configure payment gateways**
   - Get production API keys
   - Set up webhooks

3. **Deploy to Vercel** (recommended)
   ```bash
   vercel
   ```

4. **Configure environment variables**
   - Add all production keys
   - Set up domain

See DEPLOYMENT.md for detailed instructions.

## 📊 What's Included

### ✅ Backend (Complete)
- Authentication system
- Booking management
- Payment processing
- Notification system
- Admin APIs
- Webhook handlers

### ✅ Frontend (Complete)
- Landing page
- Auth pages (sign in/up)
- User dashboard
- Responsive design
- UI component library

### ✅ Database (Complete)
- 25+ tables
- Row Level Security
- Indexes and constraints
- Triggers and functions

### ✅ Testing (Complete)
- Unit tests
- E2E tests
- Test configuration

### ✅ Documentation (Complete)
- Setup guides
- API documentation
- Architecture docs
- Deployment guide

## 🎯 Next Steps

### For Developers
1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Run development server
4. 📖 Read ARCHITECTURE.md
5. 🔨 Start building features

### For Product Owners
1. ✅ Review features
2. 📝 Plan customizations
3. 🎨 Design branding
4. 📊 Set up analytics
5. 🚀 Plan deployment

### For Administrators
1. ✅ Set up Supabase
2. 🏟️ Add venues
3. 🎾 Add courts
4. 💳 Configure payments
5. 📧 Set up emails

## 💡 Tips

- **Start Small**: Get basic booking working first
- **Use Test Mode**: Use test API keys for development
- **Check Logs**: Browser console and terminal for errors
- **Read Docs**: We've documented everything
- **Ask Questions**: Open GitHub issues

## 🆘 Need Help?

### Documentation
- Check the .md files in the root directory
- Each file covers a specific topic

### Common Issues
- See INSTALLATION.md troubleshooting section
- Check GitHub issues

### Support
- Email: support@courtify.com
- GitHub: Open an issue
- Documentation: Read all .md files

## 📝 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update docs

3. **Test**
   ```bash
   npm test
   npm run test:e2e
   ```

4. **Commit**
   ```bash
   git commit -m "feat: add my feature"
   ```

5. **Push and Deploy**
   ```bash
   git push origin feature/my-feature
   ```

## 🎓 Learning Path

### Week 1: Setup & Basics
- Install and configure
- Understand project structure
- Create test data
- Make first booking

### Week 2: Customization
- Modify UI components
- Add custom features
- Configure integrations
- Set up payments

### Week 3: Testing & Deployment
- Write tests
- Set up CI/CD
- Deploy to staging
- Deploy to production

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Supabase set up
- [ ] Development server running
- [ ] Test user created
- [ ] Test venue added
- [ ] First booking made
- [ ] Documentation read
- [ ] Ready to customize

## 🎉 You're Ready!

You now have everything you need to build your sports court booking platform!

### Quick Links
- 🏠 [Landing Page](http://localhost:3000)
- 🔐 [Sign In](http://localhost:3000/auth/signin)
- 📝 [Sign Up](http://localhost:3000/auth/signup)
- 📊 [Dashboard](http://localhost:3000/dashboard)
- 📚 [API Docs](./API_DOCUMENTATION.md)

---

**Happy Coding!** 🚀

For detailed information, see:
- **QUICKSTART.md** - Quick setup
- **README.md** - Full documentation
- **ARCHITECTURE.md** - Technical details

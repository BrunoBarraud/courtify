# Courtify Deployment Guide

This guide covers deploying Courtify to production environments.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Payment gateways configured (Stripe/MercadoPago)
- [ ] Email service configured (SendGrid)
- [ ] Push notifications configured (Firebase)
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] Monitoring tools set up

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform as it's built by the Next.js team and provides optimal performance.

#### Steps:

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Configure Environment Variables**

Go to your project settings on Vercel dashboard and add all environment variables from `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`
- `SENDGRID_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

5. **Configure Custom Domain**

In Vercel dashboard:
- Go to Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

6. **Set up Webhooks**

Configure webhook URLs in your payment providers:
- Stripe: `https://yourdomain.com/api/webhooks/stripe`
- MercadoPago: `https://yourdomain.com/api/webhooks/mercadopago`

### Option 2: Docker Deployment

#### Build Docker Image

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Build and Run**
```bash
docker build -t courtify .
docker run -p 3000:3000 --env-file .env courtify
```

### Option 3: AWS Deployment

#### Using AWS Amplify

1. **Connect Repository**
- Go to AWS Amplify Console
- Connect your Git repository
- Configure build settings

2. **Build Settings** (amplify.yml)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. **Environment Variables**
Add all required environment variables in Amplify Console

#### Using EC2

1. **Launch EC2 Instance**
- Choose Ubuntu 22.04 LTS
- t3.medium or larger recommended
- Configure security groups (ports 80, 443, 22)

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

3. **Deploy Application**
```bash
# Clone repository
git clone <your-repo-url>
cd courtify

# Install dependencies
npm ci

# Build application
npm run build

# Start with PM2
pm2 start npm --name "courtify" -- start
pm2 save
pm2 startup
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Set up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🗄️ Database Setup

### Supabase Production Setup

1. **Create Production Project**
- Go to supabase.com
- Create new project
- Note down project URL and keys

2. **Run Migrations**
```bash
# Link to production project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

3. **Configure Row Level Security**
- Ensure RLS is enabled on all tables
- Test policies with different user roles

4. **Set up Database Backups**
- Enable automatic backups in Supabase dashboard
- Configure backup retention period

## 💳 Payment Gateway Configuration

### Stripe Setup

1. **Get Production Keys**
- Go to Stripe Dashboard
- Switch to production mode
- Copy API keys

2. **Configure Webhooks**
- Go to Developers → Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`

3. **Test Webhook**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### MercadoPago Setup

1. **Get Production Credentials**
- Go to MercadoPago Developer Dashboard
- Get production access token

2. **Configure Webhooks**
- Add webhook URL: `https://yourdomain.com/api/webhooks/mercadopago`
- Select notification events

## 📧 Email Configuration (SendGrid)

1. **Verify Domain**
- Go to SendGrid → Settings → Sender Authentication
- Verify your domain
- Configure DNS records

2. **Create API Key**
- Go to Settings → API Keys
- Create new key with full access
- Add to environment variables

3. **Configure Templates**
- Create email templates in SendGrid
- Update template IDs in code

## 🔔 Push Notifications (Firebase)

1. **Create Firebase Project**
- Go to Firebase Console
- Create new project

2. **Enable Cloud Messaging**
- Go to Project Settings → Cloud Messaging
- Generate server key

3. **Download Service Account**
- Go to Project Settings → Service Accounts
- Generate new private key
- Add credentials to environment variables

4. **Configure Web Push**
- Generate VAPID key
- Add to environment variables

## 🔍 Monitoring & Logging

### Vercel Analytics

Enable in Vercel dashboard:
- Web Analytics
- Speed Insights
- Log Drains

### Sentry (Error Tracking)

1. **Install Sentry**
```bash
npm install @sentry/nextjs
```

2. **Configure**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

## 🔐 Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (using Supabase)
- [ ] XSS protection (React default)
- [ ] CSRF protection
- [ ] Security headers configured
- [ ] Regular dependency updates
- [ ] Secrets rotation schedule

## 📊 Performance Optimization

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### CDN Configuration

Use Vercel's built-in CDN or configure CloudFlare:
- Enable caching for static assets
- Configure cache headers
- Enable Brotli compression

## 🧪 Post-Deployment Testing

1. **Smoke Tests**
```bash
# Test main endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/venues
```

2. **E2E Tests**
```bash
npm run test:e2e -- --config baseURL=https://yourdomain.com
```

3. **Load Testing**
```bash
# Using k6
k6 run load-test.js
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📱 Mobile App Preparation

The backend is ready for mobile app integration:

1. **API Endpoints**: All REST endpoints available
2. **Authentication**: Supabase Auth supports mobile SDKs
3. **Push Notifications**: Firebase configured
4. **Payment Processing**: Mobile SDKs available for Stripe/MercadoPago

## 🆘 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**Database Connection Issues**
- Check Supabase project status
- Verify environment variables
- Check IP allowlist in Supabase

**Payment Webhook Failures**
- Verify webhook signature
- Check endpoint accessibility
- Review webhook logs in provider dashboard

## 📞 Support

For deployment support:
- Email: devops@courtify.com
- Documentation: https://docs.courtify.com
- Slack: #deployment-support

---

**Last Updated**: January 2025

#!/bin/bash

# MatchUp Setup Script
# This script helps you set up MatchUp for the first time

echo "🏟️  MatchUp Setup Script"
echo "========================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your credentials:"
    echo "   - Supabase URL and keys"
    echo "   - Stripe keys (optional for development)"
    echo "   - MercadoPago keys (optional)"
    echo "   - SendGrid API key (optional)"
    echo "   - Firebase credentials (optional)"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found"
    echo "   Install it with: npm install -g supabase"
    echo ""
else
    echo "✅ Supabase CLI installed"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your credentials"
echo "2. Set up your Supabase project:"
echo "   - Go to https://supabase.com and create a project"
echo "   - Run the SQL migration from supabase/migrations/ in SQL Editor"
echo "3. Start the development server: npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full README: README.md"
echo "   - API Docs: API_DOCUMENTATION.md"
echo ""
echo "Happy coding! 🚀"

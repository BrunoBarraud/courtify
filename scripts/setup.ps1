# MatchUp Setup Script for Windows (PowerShell)
# This script helps you set up MatchUp for the first time

Write-Host "🏟️  MatchUp Setup Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Host "❌ Error: Node.js 18 or higher is required" -ForegroundColor Red
        Write-Host "   Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and add your credentials:" -ForegroundColor Yellow
    Write-Host "   - Supabase URL and keys"
    Write-Host "   - Stripe keys (optional for development)"
    Write-Host "   - MercadoPago keys (optional)"
    Write-Host "   - SendGrid API key (optional)"
    Write-Host "   - Firebase credentials (optional)"
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  Supabase CLI not found" -ForegroundColor Yellow
    Write-Host "   Install it with: npm install -g supabase"
    Write-Host ""
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env with your credentials"
Write-Host "2. Set up your Supabase project:"
Write-Host "   - Go to https://supabase.com and create a project"
Write-Host "   - Run the SQL migration from supabase/migrations/ in SQL Editor"
Write-Host "3. Start the development server: npm run dev"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start: QUICKSTART.md"
Write-Host "   - Full README: README.md"
Write-Host "   - API Docs: API_DOCUMENTATION.md"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

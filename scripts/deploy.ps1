# CV Marketplace Deployment Script for Windows PowerShell
# Run as Administrator

Write-Host "🚀 CV Marketplace Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check prerequisites
function Check-Command($cmdname) {
    return [bool](Get-Command $cmdname -ErrorAction SilentlyContinue)
}

if (-not (Check-Command "docker")) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

if (-not (Check-Command "docker-compose")) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Create .env.production if missing
if (-not (Test-Path ".env.production")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.production"
        Write-Host "✅ Created .env.production from example. Please edit with real keys." -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example missing" -ForegroundColor Red
        exit 1
    }
}

# Run builder to verify
Write-Host "`n🔧 Running builder engine to verify code..." -ForegroundColor Yellow
node builder.js --fix
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Builder verification failed. Fix errors and re-run." -ForegroundColor Red
    exit 1
}

# Setup directories
New-Item -ItemType Directory -Force -Path "backend\uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\downloads" | Out-Null

# Install dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Build frontend
Write-Host "`n🏗️ Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# Start with Docker Compose
Write-Host "`n🐳 Starting containers with Docker Compose..." -ForegroundColor Yellow
docker-compose --env-file .env.production up -d --build

# Run database indexes
Write-Host "`n🗄️ Setting up database indexes..." -ForegroundColor Yellow
docker-compose exec backend node src/scripts/setupIndexes.js

# Seed free tier
Write-Host "`n🌱 Seeding free tier credits..." -ForegroundColor Yellow
docker-compose exec backend node src/scripts/seedFreeTier.js

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:5000/api/health" -ForegroundColor Cyan

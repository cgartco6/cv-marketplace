@echo off
title CV Marketplace Deployment
echo ====================================
echo CV Marketplace Deployment Script
echo ====================================
echo.

REM Check Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Check Docker Compose
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose not found.
    pause
    exit /b 1
)

REM Create .env.production if needed
if not exist .env.production (
    if exist .env.example (
        copy .env.example .env.production
        echo ✅ Created .env.production from example. Edit with real keys.
    ) else (
        echo ❌ .env.example missing
        pause
        exit /b 1
    )
)

REM Run builder
echo 🔧 Running builder engine...
node builder.js --fix
if %errorlevel% neq 0 (
    echo ❌ Builder verification failed.
    pause
    exit /b 1
)

REM Create directories
mkdir backend\uploads 2>nul
mkdir backend\logs 2>nul
mkdir backend\downloads 2>nul

REM Install dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Build frontend
echo 🏗️ Building frontend...
cd frontend
call npm run build
cd ..

REM Start Docker
echo 🐳 Starting containers...
docker-compose --env-file .env.production up -d --build

REM Setup indexes
echo 🗄️ Setting up indexes...
docker-compose exec backend node src/scripts/setupIndexes.js

REM Seed free tier
echo 🌱 Seeding free tier...
docker-compose exec backend node src/scripts/seedFreeTier.js

echo.
echo ✅ Deployment complete!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api
pause

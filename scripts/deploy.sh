#!/bin/bash
# CV Marketplace Deployment Script for Unix-like systems

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 CV Marketplace Deployment Script${NC}"
echo "=================================="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose is not installed.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is not installed.${NC}" >&2; exit 1; }

# Create .env.production if missing
if [ ! -f .env.production ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.production
        echo -e "${YELLOW}✅ Created .env.production from example. Edit with real keys.${NC}"
    else
        echo -e "${RED}❌ .env.example missing${NC}"
        exit 1
    fi
fi

# Run builder
echo -e "\n${YELLOW}🔧 Running builder engine...${NC}"
node builder.js --fix
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Builder verification failed.${NC}"
    exit 1
fi

# Create directories
mkdir -p backend/uploads backend/logs backend/downloads

# Install dependencies
echo -e "\n${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend && npm install && cd ..

echo -e "\n${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..

# Build frontend
echo -e "\n${YELLOW}🏗️ Building frontend...${NC}"
cd frontend && npm run build && cd ..

# Start Docker containers
echo -e "\n${YELLOW}🐳 Starting containers...${NC}"
docker-compose --env-file .env.production up -d --build

# Setup indexes
echo -e "\n${YELLOW}🗄️ Setting up indexes...${NC}"
docker-compose exec backend node src/scripts/setupIndexes.js

# Seed free tier
echo -e "\n${YELLOW}🌱 Seeding free tier...${NC}"
docker-compose exec backend node src/scripts/seedFreeTier.js

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend API: http://localhost:5000/api"
echo -e "Health check: http://localhost:5000/api/health"

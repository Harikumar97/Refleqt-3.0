#!/bin/bash

# Refleqt v3.0 - Database Setup Script
# This script sets up a fresh database with proper migrations

set -e  # Exit on error

echo "🚀 Refleqt v3.0 - Database Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local from .env.example"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found .env.local"

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    echo -e "${RED}❌ Error: DATABASE_URL not set in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} DATABASE_URL configured"

# Step 1: Validate Prisma schema
echo ""
echo "📋 Step 1: Validating Prisma schema..."
npx prisma validate
echo -e "${GREEN}✓${NC} Schema is valid"

# Step 2: Format schema
echo ""
echo "📝 Step 2: Formatting schema..."
npx prisma format
echo -e "${GREEN}✓${NC} Schema formatted"

# Step 3: Generate Prisma Client
echo ""
echo "⚙️  Step 3: Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✓${NC} Prisma Client generated"

# Step 4: Create migration
echo ""
echo "🔄 Step 4: Creating migration..."
echo -e "${YELLOW}Note: This will create a new migration from your schema${NC}"

# Check if we can connect to database
if npx prisma db execute --stdin < /dev/null 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Database connection successful"

    # Create migration
    npx prisma migrate dev --name init --create-only
    echo -e "${GREEN}✓${NC} Migration created"

    # Apply migration
    echo ""
    echo "📦 Step 5: Applying migration..."
    npx prisma migrate deploy
    echo -e "${GREEN}✓${NC} Migration applied"

else
    echo -e "${YELLOW}⚠️  Cannot connect to database${NC}"
    echo "Creating migration file only (will not apply to database)"
    npx prisma migrate dev --name init --create-only
    echo -e "${GREEN}✓${NC} Migration file created"
    echo ""
    echo -e "${YELLOW}To apply migration later:${NC}"
    echo "  1. Start your database (docker-compose up -d)"
    echo "  2. Run: npx prisma migrate deploy"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start database: docker-compose up -d"
echo "  2. Apply migrations: npx prisma migrate deploy"
echo "  3. Seed data: npm run db:seed"
echo "  4. Start app: npm run dev"
echo ""

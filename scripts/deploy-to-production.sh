#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================
# This script helps you deploy migrations and seed data to production
# Usage: ./scripts/deploy-to-production.sh

set -e  # Exit on error

echo "🚀 Menu Create - Production Deployment Script"
echo "=============================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found"
    echo ""
    echo "Please create .env.production from .env.production.example:"
    echo "  cp .env.production.example .env.production"
    echo ""
    echo "Then fill in your Supabase credentials."
    exit 1
fi

echo "✅ Found .env.production file"
echo ""

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Verify required variables
if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_URL" ]; then
    echo "❌ Error: DATABASE_URL or DIRECT_URL not set in .env.production"
    exit 1
fi

echo "📊 Environment Configuration:"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}... (truncated)"
echo "  DIRECT_URL: ${DIRECT_URL:0:30}... (truncated)"
echo ""

# Ask for confirmation
echo "⚠️  WARNING: This will modify your PRODUCTION database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo "🔄 Step 1: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "🔄 Step 2: Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations completed"
echo ""

# Ask if user wants to run seed
read -p "Do you want to seed the database with initial super admin? (yes/no): " -r
echo ""

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "🔄 Step 3: Seeding database..."

    if [ -z "$SUPER_ADMIN_EMAIL" ] || [ -z "$SUPER_ADMIN_PASSWORD" ]; then
        echo "❌ Error: SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in .env.production"
        exit 1
    fi

    npx tsx prisma/seed.ts
    echo "✅ Database seeded"
    echo ""
    echo "📧 Super Admin Credentials:"
    echo "  Email: $SUPER_ADMIN_EMAIL"
    echo "  Password: $SUPER_ADMIN_PASSWORD"
    echo ""
else
    echo "⏭️  Skipping seed"
    echo ""
fi

echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Verify your application at: $NEXT_PUBLIC_APP_URL"
echo "  2. Login with your super admin credentials"
echo "  3. Create a test restaurant/tenant"
echo ""
echo "Optional: Open Prisma Studio to view your production database"
read -p "Do you want to open Prisma Studio? (yes/no): " -r
echo ""

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "🔄 Opening Prisma Studio..."
    npx prisma studio
else
    echo "✅ All done!"
fi

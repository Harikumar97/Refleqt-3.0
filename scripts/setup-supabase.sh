#!/bin/bash

# Refleqt v3.0 - Supabase Setup Script
# Run this on your LOCAL machine (not in sandbox)

set -e

echo "🚀 Refleqt v3.0 - Supabase Database Setup"
echo "========================================"
echo ""

# Step 1: Enable pgvector extension
echo "📦 Step 1: Enabling pgvector extension in Supabase..."
echo ""
echo "Please run this SQL in your Supabase SQL Editor:"
echo "👉 https://supabase.com/dashboard/project/mpopzdpsdlrtyjqaixvw/sql/new"
echo ""
echo "-------- Copy and paste this SQL --------"
echo "CREATE EXTENSION IF NOT EXISTS vector;"
echo "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
echo "-----------------------------------------"
echo ""
read -p "Press Enter after running the SQL above..."

# Step 2: Apply migrations
echo ""
echo "🔄 Step 2: Applying database migrations..."
npx prisma migrate deploy

# Step 3: Generate Prisma Client
echo ""
echo "⚙️  Step 3: Generating Prisma Client..."
npx prisma generate

# Step 4: Verify tables
echo ""
echo "✅ Step 4: Verifying all tables created..."
npx prisma db execute --stdin <<'SQL'
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
SQL

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Seed database: npm run db:seed:api"
echo "  2. Start app: npm run dev"
echo "  3. Open: http://localhost:3000/portal"
echo ""

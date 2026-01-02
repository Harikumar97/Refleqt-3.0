# 🎯 Quick Start - Supabase Setup

Your Supabase database is now configured! Follow these steps on **your local machine**:

## Step 1: Enable Extensions in Supabase

1. Go to: https://supabase.com/dashboard/project/mpopzdpsdlrtyjqaixvw/sql/new
2. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Step 2: Apply Migrations

On your local machine, run:

```bash
npx prisma migrate deploy
```

This will create all 20 tables in your Supabase database.

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

## Step 4: Seed Database (Optional)

```bash
npm run db:seed:api
```

## Step 5: Start Development

```bash
npm run dev
```

Then open: http://localhost:3000/portal

---

## Automated Setup

Or run the automated script:

```bash
./scripts/setup-supabase.sh
```

---

## Verify Setup

Check your tables in Supabase:
https://supabase.com/dashboard/project/mpopzdpsdlrtyjqaixvw/editor

You should see 20 tables:

- users, user_profiles
- accounts, sessions, verification_tokens
- competitors
- intelligence_sources, intelligence_items
- research_goals, smart_trackers
- research_swarms, swarm_findings
- synthesized_insights, knowledge_nodes
- strategy_cohorts, cohort_analyses
- psychographic_segments, segment_insights
- brewery_outputs, obsession_scores

---

## Connection Details Configured

✅ **DATABASE_URL**: Transaction pooler (for app runtime)
✅ **DIRECT_DATABASE_URL**: Direct connection (for migrations)
✅ **Prisma Config**: Updated for Supabase

---

## Troubleshooting

### "Can't reach database server"

- Check your internet connection
- Verify Supabase project is active
- Check if you're behind a firewall

### "Extension not found"

- Run the CREATE EXTENSION commands in Supabase SQL Editor first

### "Table already exists"

- This is fine! Migrations are idempotent
- Or reset: `npx prisma migrate reset`

---

**Ready to deploy! 🚀**

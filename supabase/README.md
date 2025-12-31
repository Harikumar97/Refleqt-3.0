# Supabase Setup

This directory contains SQL scripts for setting up your PostgreSQL database in Supabase.

## Files

- `schema.sql` - Creates all database tables (run this FIRST)
- `enable-rls.sql` - Enables RLS and creates security policies for all tables (run this SECOND)

## ⚠️ Important: Run in Order!

**You must run these files in this exact order:**

1. **First**: `schema.sql` - Creates all tables
2. **Second**: `enable-rls.sql` - Adds security policies

## Step 1: Create Database Schema

### Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

### Command Line (Alternative)

```bash
psql "postgresql://postgres:your-password@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
\i supabase/schema.sql
```

## Step 2: Enable RLS Policies

**Only run this AFTER Step 1 completes successfully!**

### Supabase Dashboard (Recommended)

1. In the same **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `enable-rls.sql`
4. Paste into the SQL editor
5. Click **Run** to execute

### Command Line (Alternative)

```bash
psql "postgresql://postgres:your-password@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
\i supabase/enable-rls.sql
```

## What RLS Does

Row Level Security ensures that:

- **Users can only access their own data**: Each user can only view/modify records where `user_id` matches their authenticated user ID
- **Privacy is protected**: Users cannot see other users' competitors, research swarms, insights, etc.
- **System operations work**: Background jobs can still create swarm findings, analytics, etc.
- **Public templates are shared**: Public swarm templates are visible to all users

## Current Status

✅ RLS policies created
⚠️ **Not yet applied** - Policies are ready to apply when you switch to Supabase

## Local Development

For local development with SQLite, RLS is not needed since:
- You're using a local database file (`dev.db`)
- Only you have access to the database
- The test user is already seeded

## When to Apply RLS

Apply RLS policies when:
- **Deploying to production** with Supabase
- **Switching from SQLite to PostgreSQL** in development
- **Setting up a staging environment**

## Verification

After applying RLS, verify it's working:

1. Go to Supabase Dashboard → Database → Tables
2. Click on any table (e.g., `research_swarms`)
3. Check that the **RLS Enabled** badge appears
4. Click **View Policies** to see the security rules

## Security Notes

- RLS uses `auth.uid()` to identify the current user
- Policies enforce at the database level (not just application level)
- Even if your API has bugs, users still can't access others' data
- System operations (like background jobs) need proper service role keys

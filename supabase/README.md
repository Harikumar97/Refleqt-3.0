# Supabase Setup

This directory contains SQL scripts for setting up Row Level Security (RLS) policies in Supabase.

## Files

- `enable-rls.sql` - Enables RLS and creates security policies for all tables

## How to Apply RLS Policies

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `enable-rls.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

### Option 3: psql (Command Line)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:your-password@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Run the SQL file
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

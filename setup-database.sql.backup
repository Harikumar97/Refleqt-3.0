-- Refleqt v2.0 - Database Setup SQL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mpopzdpsdlrtyjqaixvw/sql

-- ============================================================================
-- STEP 1: Enable Required Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- STEP 2: Create Tables
-- ============================================================================

-- Users & Authentication
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID UNIQUE NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255) NOT NULL,
    "business_challenge" TEXT,
    "obsession_score" DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_user_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "accounts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "provider_account_id" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(255),
    "scope" VARCHAR(255),
    "id_token" TEXT,
    "session_state" VARCHAR(255),
    CONSTRAINT "fk_accounts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("provider", "provider_account_id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "session_token" VARCHAR(255) UNIQUE NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    CONSTRAINT "fk_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    UNIQUE ("identifier", "token")
);

-- Competitors
CREATE TABLE IF NOT EXISTS "competitors" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "website" VARCHAR(500),
    "social_handles" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_competitors_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Intelligence Feed
CREATE TABLE IF NOT EXISTS "intelligence_sources" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "source_type" VARCHAR(100) NOT NULL,
    "source_url" VARCHAR(500) NOT NULL,
    "source_name" VARCHAR(255),
    "category" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_fetched_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_intelligence_sources_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("user_id", "source_url")
);

CREATE TABLE IF NOT EXISTS "intelligence_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "source_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "url" VARCHAR(500),
    "author" VARCHAR(255),
    "published_at" TIMESTAMP,
    "fetched_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "relevance_score" DECIMAL(3,2),
    "embedding" vector(1536),
    "metadata" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_intelligence_items_source" FOREIGN KEY ("source_id") REFERENCES "intelligence_sources"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_intelligence_items_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Research Swarms
CREATE TABLE IF NOT EXISTS "research_swarms" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "swarm_type" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "agent_config" JSONB,
    "started_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_research_swarms_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "swarm_findings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "swarm_id" UUID NOT NULL,
    "finding_type" VARCHAR(100),
    "title" VARCHAR(500),
    "content" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "sources" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_swarm_findings_swarm" FOREIGN KEY ("swarm_id") REFERENCES "research_swarms"("id") ON DELETE CASCADE
);

-- Strategy Cohorts
CREATE TABLE IF NOT EXISTS "strategy_cohorts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "competitor_ids" TEXT[] NOT NULL,
    "analysis_type" VARCHAR(100),
    "last_analyzed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_strategy_cohorts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "cohort_analyses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "cohort_id" UUID NOT NULL,
    "analysis_data" JSONB NOT NULL,
    "insights" TEXT[] NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_cohort_analyses_cohort" FOREIGN KEY ("cohort_id") REFERENCES "strategy_cohorts"("id") ON DELETE CASCADE
);

-- Psychographics / Funnel-lytics
CREATE TABLE IF NOT EXISTS "psychographic_segments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "segment_name" VARCHAR(255) NOT NULL,
    "segment_tagline" VARCHAR(500),
    "characteristics" JSONB,
    "funnel_stage" VARCHAR(50),
    "size_estimate" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_psychographic_segments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "segment_insights" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "segment_id" UUID NOT NULL,
    "insight_type" VARCHAR(100),
    "content" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_segment_insights_segment" FOREIGN KEY ("segment_id") REFERENCES "psychographic_segments"("id") ON DELETE CASCADE
);

-- Brewery (Distilled Content)
CREATE TABLE IF NOT EXISTS "brewery_outputs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "output_type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "source_items" TEXT[] NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'brewing',
    "scheduled_for" TIMESTAMP,
    "delivered_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "fk_brewery_outputs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Obsession Score Tracking
CREATE TABLE IF NOT EXISTS "obsession_scores" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "score" DECIMAL(3,1) NOT NULL,
    "calculated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "factors" JSONB,
    CONSTRAINT "fk_obsession_scores_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ============================================================================
-- STEP 3: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_intelligence_items_user_published"
    ON "intelligence_items"("user_id", "published_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_obsession_scores_user_calculated"
    ON "obsession_scores"("user_id", "calculated_at" DESC);

-- ============================================================================
-- STEP 4: Create Updated At Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE INSERT OR UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE INSERT OR UPDATE ON "user_profiles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: Insert Test Data
-- ============================================================================

-- Create a test user
INSERT INTO "users" ("id", "email", "name", "created_at", "updated_at")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'test@refleqt.com',
    'Test User',
    NOW(),
    NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Create user profile for test user
INSERT INTO "user_profiles" ("id", "user_id", "company_name", "industry", "business_challenge", "obsession_score", "created_at", "updated_at")
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Test Company',
    'Technology',
    'Growing market share in competitive landscape',
    7.5,
    NOW(),
    NOW()
) ON CONFLICT ("user_id") DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all tables were created
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'users',
        'user_profiles',
        'intelligence_sources',
        'intelligence_items',
        'accounts',
        'sessions',
        'verification_tokens',
        'competitors',
        'research_swarms',
        'swarm_findings',
        'strategy_cohorts',
        'cohort_analyses',
        'psychographic_segments',
        'segment_insights',
        'brewery_outputs',
        'obsession_scores'
    )
ORDER BY tablename;

-- Count tables created
SELECT COUNT(*) as tables_created
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename LIKE '%__%' OR tablename IN ('users', 'competitors', 'sessions', 'accounts');

-- Show test user
SELECT * FROM users WHERE email = 'test@refleqt.com';
SELECT * FROM user_profiles WHERE user_id = '00000000-0000-0000-0000-000000000001';

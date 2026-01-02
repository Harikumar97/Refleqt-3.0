[dotenv@17.2.3] injecting env (12) from .env.local -- tip: 📡 add observability to secrets: https://dotenvx.com/ops
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "business_challenge" TEXT,
    "obsession_score" DECIMAL(3,1) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "competitors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "social_handles" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intelligence_sources" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_name" TEXT,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_fetched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intelligence_items" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "url" VARCHAR(500),
    "author" TEXT,
    "published_at" TIMESTAMP(3),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relevance_score" DECIMAL(3,2),
    "embedding" vector(1536),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intelligence_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_swarms" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "swarm_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "agent_config" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_swarms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swarm_findings" (
    "id" TEXT NOT NULL,
    "swarm_id" TEXT NOT NULL,
    "finding_type" TEXT,
    "title" VARCHAR(500),
    "content" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "sources" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swarm_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategy_cohorts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "competitor_ids" TEXT[],
    "analysis_type" TEXT,
    "last_analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strategy_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_analyses" (
    "id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "analysis_data" JSONB NOT NULL,
    "insights" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psychographic_segments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "segment_name" TEXT NOT NULL,
    "segment_tagline" VARCHAR(500),
    "characteristics" JSONB,
    "funnel_stage" TEXT,
    "size_estimate" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "psychographic_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segment_insights" (
    "id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "insight_type" TEXT,
    "content" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "segment_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brewery_outputs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "output_type" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "source_items" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'brewing',
    "scheduled_for" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brewery_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obsession_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DECIMAL(3,1) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "factors" JSONB,

    CONSTRAINT "obsession_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "intelligence_sources_user_id_source_url_key" ON "intelligence_sources"("user_id", "source_url");

-- CreateIndex
CREATE INDEX "intelligence_items_user_id_published_at_idx" ON "intelligence_items"("user_id", "published_at" DESC);

-- CreateIndex
CREATE INDEX "obsession_scores_user_id_calculated_at_idx" ON "obsession_scores"("user_id", "calculated_at" DESC);

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intelligence_sources" ADD CONSTRAINT "intelligence_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intelligence_items" ADD CONSTRAINT "intelligence_items_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "intelligence_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intelligence_items" ADD CONSTRAINT "intelligence_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_swarms" ADD CONSTRAINT "research_swarms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swarm_findings" ADD CONSTRAINT "swarm_findings_swarm_id_fkey" FOREIGN KEY ("swarm_id") REFERENCES "research_swarms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_cohorts" ADD CONSTRAINT "strategy_cohorts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_analyses" ADD CONSTRAINT "cohort_analyses_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "strategy_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psychographic_segments" ADD CONSTRAINT "psychographic_segments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_insights" ADD CONSTRAINT "segment_insights_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "psychographic_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brewery_outputs" ADD CONSTRAINT "brewery_outputs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obsession_scores" ADD CONSTRAINT "obsession_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


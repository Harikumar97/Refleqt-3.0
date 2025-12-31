-- Refleqt v3.0 - PostgreSQL Schema for Supabase
-- Run this BEFORE applying RLS policies

-- Enable pgvector extension
-- Note: Supabase may already have this enabled. If you get an error, skip this line.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- ============================================================================
-- Users & Authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  business_challenge TEXT,
  obsession_score DECIMAL(3, 1) DEFAULT 0.0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- NextAuth.js tables
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE(identifier, token)
);

-- ============================================================================
-- Competitors
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.competitors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  social_handles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Intelligence Feed
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.intelligence_sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, source_url)
);

CREATE TABLE IF NOT EXISTS public.intelligence_items (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES public.intelligence_sources(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  relevance_score DECIMAL(3, 2),
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intelligence_items_user_published
  ON public.intelligence_items(user_id, published_at DESC);

-- ============================================================================
-- Research Swarms - MCP Architecture
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.research_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_title TEXT NOT NULL,
  goal_query TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  mcp_chain_config JSONB,
  is_active BOOLEAN DEFAULT true NOT NULL,
  monitoring_level TEXT DEFAULT 'daily' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.smart_trackers (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES public.research_goals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  update_interval INTEGER NOT NULL,
  max_insights INTEGER DEFAULT 10 NOT NULL,
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_smart_trackers_active_next
  ON public.smart_trackers(is_active, next_execution_at);

CREATE TABLE IF NOT EXISTS public.research_swarms (
  id TEXT PRIMARY KEY,
  goal_id TEXT REFERENCES public.research_goals(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  swarm_type TEXT NOT NULL,
  swarm_size TEXT DEFAULT 'small' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  progress_percent INTEGER DEFAULT 0 NOT NULL,
  time_remaining TEXT,
  mcp_chain_used JSONB,
  agent_results JSONB,
  synthesis_applied BOOLEAN DEFAULT false NOT NULL,
  execution_time_ms INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_research_swarms_user_status
  ON public.research_swarms(user_id, status);
CREATE INDEX IF NOT EXISTS idx_research_swarms_created
  ON public.research_swarms(created_at DESC);

CREATE TABLE IF NOT EXISTS public.swarm_findings (
  id TEXT PRIMARY KEY,
  swarm_id TEXT NOT NULL REFERENCES public.research_swarms(id) ON DELETE CASCADE,
  agent_id TEXT,
  finding_type TEXT,
  title TEXT,
  content TEXT NOT NULL,
  confidence_score DECIMAL(3, 2),
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.swarm_recommendations (
  id TEXT PRIMARY KEY,
  swarm_id TEXT NOT NULL REFERENCES public.research_swarms(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  impact TEXT NOT NULL,
  priority TEXT NOT NULL,
  timeline TEXT NOT NULL,
  effort TEXT NOT NULL,
  revenue_impact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_swarm_recommendations_priority
  ON public.swarm_recommendations(swarm_id, priority);

CREATE TABLE IF NOT EXISTS public.swarm_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  query TEXT NOT NULL,
  swarm_type TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_swarm_templates_user_public
  ON public.swarm_templates(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_swarm_templates_type
  ON public.swarm_templates(swarm_type);

CREATE TABLE IF NOT EXISTS public.swarm_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  research_depth TEXT DEFAULT 'STANDARD' NOT NULL,
  analysis_speed TEXT DEFAULT 'BALANCED' NOT NULL,
  result_format TEXT DEFAULT 'EXECUTIVE' NOT NULL,
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  notifications JSONB NOT NULL,
  focus_areas TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.swarm_analytics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  total_swarms INTEGER NOT NULL,
  completed_swarms INTEGER NOT NULL,
  failed_swarms INTEGER NOT NULL,
  avg_duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_swarm_analytics_date
  ON public.swarm_analytics(date);

CREATE TABLE IF NOT EXISTS public.synthesized_insights (
  id TEXT PRIMARY KEY,
  swarm_id TEXT NOT NULL REFERENCES public.research_swarms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hierarchy_level TEXT NOT NULL,
  priority_score DECIMAL(3, 2) NOT NULL,
  relevance_score DECIMAL(3, 2) NOT NULL,
  is_actionable BOOLEAN DEFAULT false NOT NULL,
  action_items TEXT[] NOT NULL DEFAULT '{}',
  source_finding_ids TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  psychographic_tags TEXT[] NOT NULL DEFAULT '{}',
  display_position INTEGER,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_synthesized_insights_user_hierarchy
  ON public.synthesized_insights(user_id, hierarchy_level, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_synthesized_insights_dismissed
  ON public.synthesized_insights(user_id, dismissed_at);

CREATE TABLE IF NOT EXISTS public.knowledge_nodes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
  node_title TEXT NOT NULL,
  node_content TEXT,
  hierarchy_level TEXT NOT NULL,
  depth INTEGER DEFAULT 0 NOT NULL,
  insight_ids TEXT[] NOT NULL DEFAULT '{}',
  relevance_score DECIMAL(3, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_user_hierarchy
  ON public.knowledge_nodes(user_id, hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_parent
  ON public.knowledge_nodes(parent_id);

-- ============================================================================
-- Strategy Cohorts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.strategy_cohorts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  competitor_ids TEXT[] NOT NULL DEFAULT '{}',
  analysis_type TEXT,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cohort_analyses (
  id TEXT PRIMARY KEY,
  cohort_id TEXT NOT NULL REFERENCES public.strategy_cohorts(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  insights TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Psychographics / Funnel-lytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.psychographic_segments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  segment_name TEXT NOT NULL,
  segment_tagline TEXT,
  characteristics JSONB,
  funnel_stage TEXT,
  size_estimate INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.segment_insights (
  id TEXT PRIMARY KEY,
  segment_id TEXT NOT NULL REFERENCES public.psychographic_segments(id) ON DELETE CASCADE,
  insight_type TEXT,
  content TEXT NOT NULL,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Brewery (Distilled Content)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.brewery_outputs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_items TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'brewing' NOT NULL,
  scheduled_for TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Obsession Score Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.obsession_scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score DECIMAL(3, 1) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  factors JSONB
);

CREATE INDEX IF NOT EXISTS idx_obsession_scores_user_calculated
  ON public.obsession_scores(user_id, calculated_at DESC);

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_goals_updated_at BEFORE UPDATE ON public.research_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_swarm_settings_updated_at BEFORE UPDATE ON public.swarm_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_nodes_updated_at BEFORE UPDATE ON public.knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

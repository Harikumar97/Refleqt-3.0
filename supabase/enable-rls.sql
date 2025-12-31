-- Enable Row Level Security (RLS) on all tables
-- This ensures users can only access their own data

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_swarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthesized_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychographic_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brewery_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obsession_scores ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS & AUTHENTICATION POLICIES
-- ============================================================================

-- Users: Can only read their own user record
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- User Profiles: Can only access their own profile
CREATE POLICY "Users can view own user profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Accounts: Managed by NextAuth, users can view their own accounts
CREATE POLICY "Users can view own accounts"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sessions: Managed by NextAuth, users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Verification Tokens: Public (needed for email verification)
CREATE POLICY "Anyone can access verification tokens"
  ON public.verification_tokens
  FOR ALL
  USING (true);

-- ============================================================================
-- COMPETITORS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own competitors"
  ON public.competitors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitors"
  ON public.competitors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitors"
  ON public.competitors
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitors"
  ON public.competitors
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INTELLIGENCE FEED POLICIES
-- ============================================================================

CREATE POLICY "Users can view own intelligence sources"
  ON public.intelligence_sources
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intelligence sources"
  ON public.intelligence_sources
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intelligence sources"
  ON public.intelligence_sources
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own intelligence sources"
  ON public.intelligence_sources
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intelligence items"
  ON public.intelligence_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intelligence items"
  ON public.intelligence_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own intelligence items"
  ON public.intelligence_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RESEARCH SWARMS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own research goals"
  ON public.research_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research goals"
  ON public.research_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research goals"
  ON public.research_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own research goals"
  ON public.research_goals
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own smart trackers"
  ON public.smart_trackers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own smart trackers"
  ON public.smart_trackers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smart trackers"
  ON public.smart_trackers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own research swarms"
  ON public.research_swarms
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research swarms"
  ON public.research_swarms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research swarms"
  ON public.research_swarms
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own research swarms"
  ON public.research_swarms
  FOR DELETE
  USING (auth.uid() = user_id);

-- Swarm Findings: Accessible via parent swarm
CREATE POLICY "Users can view findings from own swarms"
  ON public.swarm_findings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.research_swarms
      WHERE research_swarms.id = swarm_findings.swarm_id
      AND research_swarms.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert swarm findings"
  ON public.swarm_findings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_swarms
      WHERE research_swarms.id = swarm_findings.swarm_id
      AND research_swarms.user_id = auth.uid()
    )
  );

-- Swarm Recommendations: Accessible via parent swarm
CREATE POLICY "Users can view recommendations from own swarms"
  ON public.swarm_recommendations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.research_swarms
      WHERE research_swarms.id = swarm_recommendations.swarm_id
      AND research_swarms.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert swarm recommendations"
  ON public.swarm_recommendations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.research_swarms
      WHERE research_swarms.id = swarm_recommendations.swarm_id
      AND research_swarms.user_id = auth.uid()
    )
  );

-- Swarm Templates: Users can view public templates and their own
CREATE POLICY "Users can view public and own swarm templates"
  ON public.swarm_templates
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own swarm templates"
  ON public.swarm_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own swarm templates"
  ON public.swarm_templates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own swarm templates"
  ON public.swarm_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Swarm Settings
CREATE POLICY "Users can view own swarm settings"
  ON public.swarm_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swarm settings"
  ON public.swarm_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own swarm settings"
  ON public.swarm_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Swarm Analytics
CREATE POLICY "Users can view own swarm analytics"
  ON public.swarm_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert swarm analytics"
  ON public.swarm_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SYNTHESIZED INSIGHTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own synthesized insights"
  ON public.synthesized_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert synthesized insights"
  ON public.synthesized_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own synthesized insights"
  ON public.synthesized_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own synthesized insights"
  ON public.synthesized_insights
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- KNOWLEDGE TRAVERSE POLICIES
-- ============================================================================

CREATE POLICY "Users can view own knowledge nodes"
  ON public.knowledge_nodes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge nodes"
  ON public.knowledge_nodes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge nodes"
  ON public.knowledge_nodes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge nodes"
  ON public.knowledge_nodes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STRATEGY COHORTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own strategy cohorts"
  ON public.strategy_cohorts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategy cohorts"
  ON public.strategy_cohorts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategy cohorts"
  ON public.strategy_cohorts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategy cohorts"
  ON public.strategy_cohorts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Cohort Analyses: Accessible via parent cohort
CREATE POLICY "Users can view analyses from own cohorts"
  ON public.cohort_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.strategy_cohorts
      WHERE strategy_cohorts.id = cohort_analyses.cohort_id
      AND strategy_cohorts.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert cohort analyses"
  ON public.cohort_analyses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.strategy_cohorts
      WHERE strategy_cohorts.id = cohort_analyses.cohort_id
      AND strategy_cohorts.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PSYCHOGRAPHICS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own psychographic segments"
  ON public.psychographic_segments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own psychographic segments"
  ON public.psychographic_segments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own psychographic segments"
  ON public.psychographic_segments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own psychographic segments"
  ON public.psychographic_segments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Segment Insights: Accessible via parent segment
CREATE POLICY "Users can view insights from own segments"
  ON public.segment_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.psychographic_segments
      WHERE psychographic_segments.id = segment_insights.segment_id
      AND psychographic_segments.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert segment insights"
  ON public.segment_insights
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.psychographic_segments
      WHERE psychographic_segments.id = segment_insights.segment_id
      AND psychographic_segments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- BREWERY OUTPUTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own brewery outputs"
  ON public.brewery_outputs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert brewery outputs"
  ON public.brewery_outputs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brewery outputs"
  ON public.brewery_outputs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- OBSESSION SCORES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own obsession scores"
  ON public.obsession_scores
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert obsession scores"
  ON public.obsession_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

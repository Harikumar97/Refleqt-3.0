/**
 * Cache Configuration
 * Defines TTL (Time To Live) for different cache keys
 *
 * TTL Guidelines:
 * - Frequently changing data: 1-5 minutes
 * - Moderately changing data: 5-15 minutes
 * - Rarely changing data: 15-60 minutes
 * - Static/reference data: 1-24 hours
 */

export const CacheTTL = {
  // User data (changes rarely)
  USER_PROFILE: 15 * 60, // 15 minutes
  USER_OBSESSION_SCORE: 10 * 60, // 10 minutes

  // Research Goals (moderate changes)
  RESEARCH_GOALS_LIST: 10 * 60, // 10 minutes
  RESEARCH_GOAL_DETAIL: 10 * 60, // 10 minutes

  // Smart Trackers (moderate changes)
  SMART_TRACKERS_LIST: 5 * 60, // 5 minutes
  SMART_TRACKER_DETAIL: 5 * 60, // 5 minutes

  // Insights (frequently updated)
  SYNTHESIZED_INSIGHTS: 5 * 60, // 5 minutes
  INSIGHT_DETAIL: 5 * 60, // 5 minutes

  // Knowledge Hierarchy (moderate changes)
  KNOWLEDGE_NODES: 10 * 60, // 10 minutes

  // Intelligence Feed (frequently updated)
  INTELLIGENCE_ITEMS: 5 * 60, // 5 minutes
  INTELLIGENCE_SOURCES: 15 * 60, // 15 minutes

  // Research Swarms (cached after completion)
  SWARM_RESULTS: 30 * 60, // 30 minutes
  SWARM_FINDINGS: 30 * 60, // 30 minutes

  // Strategy Cohorts
  COHORT_ANALYSIS: 30 * 60, // 30 minutes

  // System/Stats
  CACHE_STATS: 1 * 60, // 1 minute
} as const;

/**
 * Cache key generators
 * Ensures consistent key naming across the app
 */
export const CacheKeys = {
  // User
  userProfile: (userId: string) => `user:${userId}:profile`,
  userObsessionScore: (userId: string) => `user:${userId}:obsession-score`,

  // Research Goals
  researchGoalsList: (userId: string) => `research-goals:${userId}:list`,
  researchGoalDetail: (goalId: string) => `research-goals:${goalId}:detail`,

  // Smart Trackers
  smartTrackersList: (userId: string) => `smart-trackers:${userId}:list`,
  smartTrackerDetail: (trackerId: string) =>
    `smart-trackers:${trackerId}:detail`,

  // Insights
  synthesizedInsights: (userId: string, hierarchyLevel?: string) =>
    hierarchyLevel
      ? `insights:${userId}:${hierarchyLevel}`
      : `insights:${userId}:all`,
  insightDetail: (insightId: string) => `insights:${insightId}:detail`,

  // Knowledge Hierarchy
  knowledgeNodes: (userId: string) => `knowledge:${userId}:nodes`,

  // Intelligence Feed
  intelligenceItems: (userId: string, limit?: number) =>
    `intelligence:${userId}:items:${limit || 50}`,
  intelligenceSources: (userId: string) => `intelligence:${userId}:sources`,

  // Research Swarms
  swarmResults: (swarmId: string) => `swarm:${swarmId}:results`,
  swarmFindings: (swarmId: string) => `swarm:${swarmId}:findings`,

  // Strategy Cohorts
  cohortAnalysis: (cohortId: string) => `cohort:${cohortId}:analysis`,
} as const;

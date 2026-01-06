// @refleqt/types - Shared Type Definitions

// Re-export database types
export type {
  User,
  UserProfile,
  Competitor,
  IntelligenceSource,
  IntelligenceItem,
  ResearchGoal,
  SmartTracker,
  ResearchSwarm,
  SwarmFinding,
  SynthesizedInsight,
  KnowledgeNode,
  StrategyCohort,
  CohortAnalysis,
  PsychographicSegment,
  SegmentInsight,
  BreweryOutput,
  ObsessionScore,
} from '@refleqt/database';

// Application Types
export type FeatureTier = 'free' | 'pro' | 'enterprise';
export type FeedCategory = 'competitive' | 'market' | 'technology' | 'customer';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type SwarmStatus = 'pending' | 'running' | 'synthesizing' | 'completed' | 'failed';
export type SwarmType = 'competitive' | 'market' | 'technical' | 'customer';
export type SwarmSize = 'small' | 'large';
export type HierarchyLevel = 'strategic' | 'tactical' | 'operational';
export type FunnelStage = 'awareness' | 'consideration' | 'decision' | 'retention';
export type LLMProvider = 'anthropic-claude' | 'openai-gpt' | 'google-gemini';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LLMRequest {
  task: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed: number;
  latencyMs: number;
}

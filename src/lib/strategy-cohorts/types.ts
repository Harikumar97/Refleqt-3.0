/**
 * Strategy Cohorts - TypeScript Type Definitions
 */

import type { LLMProvider } from "@/lib/llm/types";

// ============================================================================
// Database Model Types (from Prisma)
// ============================================================================

export interface StrategyCohort {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  query: string | null;
  status: "draft" | "analyzing" | "completed" | "failed";
  analysisType: "insights" | "scenarios" | "opportunities" | "deep-dive";
  includeFinancial: boolean;
  includeSocial: boolean;
  includeTech: boolean;
  includeSentiment: boolean;
  executionTimeMs: number | null;
  confidence: number | null;
  insightCount: number | null;
  swarmId: string | null;
  lastAnalyzedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CohortCompetitor {
  id: string;
  cohortId: string;
  name: string;
  url: string | null;
  domain: string | null;
  industry: string | null;
  employees: string | null;
  funding: string | null;
  logoUrl: string | null;
  status: "pending" | "analyzing" | "completed" | "failed";
  discoveredData: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CohortContext {
  id: string;
  cohortId: string;
  contextType: string;
  contextLabel: string;
  percentage: number | null;
  createdAt: Date;
}

export interface CohortInsight {
  id: string;
  cohortId: string;
  title: string;
  content: string;
  confidence: "high" | "medium" | "low";
  category: string;
  sources: string[];
  rank: number;
  llmProvider: string | null;
  llmModel: string | null;
  createdAt: Date;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateCohortRequest {
  name: string;
  description?: string;
  analysisType?: StrategyCohort["analysisType"];
}

export interface CreateCohortResponse {
  cohort: StrategyCohort;
}

export interface UpdateCohortRequest {
  name?: string;
  description?: string;
  query?: string;
  analysisType?: StrategyCohort["analysisType"];
  includeFinancial?: boolean;
  includeSocial?: boolean;
  includeTech?: boolean;
  includeSentiment?: boolean;
}

export interface AddCompetitorRequest {
  name: string;
  url?: string;
  domain?: string;
  industry?: string;
  employees?: string;
  funding?: string;
  logoUrl?: string;
  discoveredData?: any;
}

export interface AddCompetitorResponse {
  competitor: CohortCompetitor;
}

export interface AddContextRequest {
  contextType: string;
  contextLabel: string;
  percentage?: number;
}

export interface ExecuteCohortRequest {
  enableMultiProvider?: boolean;
  providers?: LLMProvider[];
  depth?: "shallow" | "deep";
}

export interface ExecuteCohortResponse {
  swarmId: string;
  status: "completed" | "partial" | "failed";
  executionTimeMs: number;
  confidence: number;
  insightCount: number;
}

export interface GetCohortResponse {
  cohort: StrategyCohort & {
    competitors: CohortCompetitor[];
    contexts: CohortContext[];
    insights: CohortInsight[];
  };
}

export interface ListCohortsResponse {
  cohorts: (StrategyCohort & {
    _count: {
      competitors: number;
      insights: number;
    };
  })[];
  total: number;
}

// ============================================================================
// Discovery Types
// ============================================================================

export interface CompetitorSuggestion {
  name: string;
  url: string;
  domain: string;
  industry: string;
  employees: string;
  funding: string;
  logo: string;
  description?: string;
}

export interface DiscoverCompetitorsRequest {
  query: string;
  method: "url" | "name" | "industry" | "bulk";
  limit?: number;
}

export interface DiscoverCompetitorsResponse {
  suggestions: CompetitorSuggestion[];
}

export interface CompetitorDiscoveryRequest {
  method: "url" | "company-name" | "industry-scan" | "bulk-import";
  input: string;
}

export interface DiscoveredCompetitor {
  name: string;
  website: string;
  description: string;
  relevanceScore: number;
  reason: string;
}

export interface CompetitorDiscoveryResponse {
  competitors: DiscoveredCompetitor[];
  method: string;
  source: string;
  model?: string;
}

// ============================================================================
// Analysis Progress Types
// ============================================================================

export interface AnalysisProgressEvent {
  type: "progress" | "complete" | "error";
  stage?: string;
  progress?: number;
  description?: string;
  result?: ExecuteCohortResponse;
  error?: string;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportCohortRequest {
  format: "pdf" | "excel" | "pptx" | "json";
  includeSources?: boolean;
  includeCharts?: boolean;
  includeInsights?: boolean;
  includeRecommendations?: boolean;
}

export interface ExportCohortResponse {
  exportId: string;
  downloadUrl: string;
  expiresAt: Date;
}

// ============================================================================
// Visualization Types
// ============================================================================

export interface ChartData {
  type: "scatter" | "bar" | "line" | "radar";
  data: any;
  labels: string[];
  datasets: any[];
}

export interface CompetitorPositioning {
  name: string;
  priceCompetitiveness: number; // 0-5
  featureRichness: number; // 0-5
  marketShare?: number;
  customerSatisfaction?: number;
}

// ============================================================================
// Template Types
// ============================================================================

export interface CohortTemplate {
  id: string;
  name: string;
  description: string;
  analysisType: StrategyCohort["analysisType"];
  defaultOptions: {
    includeFinancial: boolean;
    includeSocial: boolean;
    includeTech: boolean;
    includeSentiment: boolean;
  };
  promptTemplate?: string;
}

// ============================================================================
// Refinement Types
// ============================================================================

export interface RefineCohortRequest {
  query: string;
  focusAreas?: string[];
}

export interface RefineCohortResponse {
  additionalInsights: CohortInsight[];
  refinementId: string;
}

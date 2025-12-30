/**
 * Research Swarm DTOs (Data Transfer Objects)
 *
 * Purpose: Type-safe data contracts between API routes and service layer
 *
 * Features:
 * - Separates API contracts from database models
 * - Provides clear validation boundaries
 * - Enables frontend-friendly data structures
 * - Type-safe transformations
 *
 * Usage:
 * ```typescript
 * // In API route
 * const dto: CreateSwarmDto = {
 *   userId: session.user.id,
 *   query: "Analyze competitor pricing",
 *   swarmType: "competitive"
 * };
 *
 * const swarm = await researchSwarmService.createSwarm(dto);
 * return apiResponse.success(swarm);
 * ```
 *
 * Benefits:
 * - Decouples API from database schema
 * - Clear data contracts
 * - Easier to validate and transform
 * - Frontend-friendly response formats
 */

/**
 * Valid swarm types for research analysis
 */
export const SWARM_TYPES = [
  "competitive",
  "market",
  "customer",
  "product",
] as const;

export type SwarmType = (typeof SWARM_TYPES)[number];

/**
 * Valid swarm sizes
 */
export const SWARM_SIZES = ["small", "large"] as const;

export type SwarmSize = (typeof SWARM_SIZES)[number];

/**
 * Valid swarm statuses
 */
export const SWARM_STATUSES = [
  "pending",
  "running",
  "processing",
  "completed",
  "failed",
] as const;

export type SwarmStatus = (typeof SWARM_STATUSES)[number];

/**
 * Valid recommendation priorities
 */
export const RECOMMENDATION_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type RecommendationPriority = (typeof RECOMMENDATION_PRIORITIES)[number];

/**
 * DTO for creating a new research swarm
 */
export interface CreateSwarmDto {
  userId: string;
  query: string;
  swarmType: SwarmType;
  swarmSize?: SwarmSize;
  goalId?: string; // Optional link to research goal
}

/**
 * DTO for swarm list item (GET /active)
 */
export interface SwarmListItemDto {
  id: string;
  query: string;
  type: SwarmType;
  typeName: string; // User-friendly display name
  status: SwarmStatus;
  progress: number; // 0-100
  timeRemaining: string | null;
  timestamp: number; // Unix timestamp in milliseconds
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  executionTimeMs: number | null;
}

/**
 * DTO for recommendation
 */
export interface RecommendationDto {
  action: string;
  impact: string;
  priority: RecommendationPriority;
  timeline: string;
  effort: string;
  revenueImpact?: string;
}

/**
 * DTO for swarm results (GET /[id]/results)
 */
export interface SwarmResultDto {
  swarmId: string;
  query: string;
  type: SwarmType;
  status: SwarmStatus;
  completedAt: Date | null;
  executionTimeMs: number | null;
  keyFindings: string[];
  recommendations: RecommendationDto[];
  sources: string[];
  metadata: {
    swarmSize: SwarmSize;
    agentCount: number;
    findingsCount: number;
    recommendationsCount: number;
  };
}

/**
 * DTO for swarm statistics
 */
export interface SwarmStatsDto {
  totalSwarms: number;
  completedSwarms: number;
  pendingSwarms: number;
  failedSwarms: number;
  averageExecutionTimeMs: number;
  swarmsByType: Record<SwarmType, number>;
}

/**
 * DTO for swarm template
 */
export interface SwarmTemplateDto {
  id: string;
  title: string;
  description: string;
  icon: string;
  query: string;
  swarmType: SwarmType;
  usageCount: number;
  isPublic: boolean;
}

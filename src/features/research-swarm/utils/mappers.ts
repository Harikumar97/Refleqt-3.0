/**
 * Research Swarm Mappers
 *
 * Purpose: Transform Prisma models to DTOs (Data Transfer Objects)
 *
 * Features:
 * - Type-safe transformations
 * - Consistent data formatting
 * - User-friendly display names
 * - Clean separation between database and API
 *
 * Usage:
 * ```typescript
 * // In service layer
 * const swarm = await swarmRepository.findById(id);
 * const dto = toSwarmListItemDto(swarm);
 * return dto;
 * ```
 *
 * Benefits:
 * - Decouples database schema from API responses
 * - Centralizes data transformation logic
 * - Easier to maintain and test
 * - Type-safe conversions
 */

import type {
  ResearchSwarm,
  SwarmFinding,
  SwarmRecommendation,
} from "@prisma/client";
import type {
  SwarmListItemDto,
  SwarmResultDto,
  RecommendationDto,
  SwarmType,
  SwarmStatus,
  SwarmSize,
  RecommendationPriority,
} from "../types/dtos";

/**
 * Swarm type display names
 */
const TYPE_DISPLAY_NAMES: Record<SwarmType, string> = {
  competitive: "Competitive Analysis",
  market: "Market Research",
  customer: "Customer Intelligence",
  product: "Product Research",
};

/**
 * Get user-friendly display name for swarm type
 */
export function getTypeDisplayName(type: SwarmType): string {
  return TYPE_DISPLAY_NAMES[type] || type;
}

/**
 * Transform Prisma ResearchSwarm to SwarmListItemDto
 * Used for GET /active endpoint
 */
export function toSwarmListItemDto(swarm: ResearchSwarm): SwarmListItemDto {
  return {
    id: swarm.id,
    query: swarm.query,
    type: swarm.swarmType as SwarmType,
    typeName: getTypeDisplayName(swarm.swarmType as SwarmType),
    status: swarm.status as SwarmStatus,
    progress: swarm.progressPct,
    timeRemaining: swarm.timeRemaining,
    timestamp: swarm.createdAt.getTime(),
    createdAt: swarm.createdAt,
    startedAt: swarm.startedAt,
    completedAt: swarm.completedAt,
    executionTimeMs: swarm.executionTimeMs,
  };
}

/**
 * Transform Prisma SwarmRecommendation to RecommendationDto
 */
export function toRecommendationDto(
  recommendation: SwarmRecommendation
): RecommendationDto {
  const dto: RecommendationDto = {
    action: recommendation.action,
    impact: recommendation.impact,
    priority: recommendation.priority as RecommendationPriority,
    timeline: recommendation.timeline,
    effort: recommendation.effort,
  };

  if (recommendation.revenueImpact) {
    dto.revenueImpact = recommendation.revenueImpact;
  }

  return dto;
}

/**
 * Transform Prisma ResearchSwarm with relations to SwarmResultDto
 * Used for GET /[id]/results endpoint
 */
export function toSwarmResultDto(
  swarm: ResearchSwarm & {
    findings: SwarmFinding[];
    recommendations: SwarmRecommendation[];
  }
): SwarmResultDto {
  // Extract key findings from findings
  const keyFindings = swarm.findings.map((finding) => finding.content);

  // Transform recommendations
  const recommendations = swarm.recommendations.map(toRecommendationDto);

  // Extract unique sources from findings
  const allSources = swarm.findings
    .filter((f) => f.sources)
    .flatMap((f) => (f.sources as string[]) || []);
  const uniqueSources = Array.from(new Set(allSources));

  return {
    swarmId: swarm.id,
    query: swarm.query,
    type: swarm.swarmType as SwarmType,
    status: swarm.status as SwarmStatus,
    completedAt: swarm.completedAt,
    executionTimeMs: swarm.executionTimeMs,
    keyFindings,
    recommendations,
    sources: uniqueSources,
    metadata: {
      swarmSize: swarm.swarmSize as SwarmSize,
      agentCount: swarm.findings.length,
      findingsCount: swarm.findings.length,
      recommendationsCount: swarm.recommendations.length,
    },
  };
}

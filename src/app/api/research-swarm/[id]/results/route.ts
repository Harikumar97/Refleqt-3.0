/**
 * Research Swarm Results API
 *
 * GET /api/research-swarm/[id]/results
 *
 * Purpose: Retrieves comprehensive results for a completed research swarm
 *
 * Functionality:
 * - Fetches swarm with all findings and recommendations
 * - Verifies user ownership before returning results
 * - Validates swarm is in 'completed' status
 * - Aggregates unique sources from all findings
 * - Returns formatted results with metadata
 *
 * URL Parameters:
 * - id: Swarm UUID
 *
 * Query Parameters:
 * - userId: Required (string) - For ownership verification
 *
 * Response Includes:
 * - keyFindings: Array of research findings (string[])
 * - recommendations: Array with action, impact, priority, timeline, effort, revenueImpact
 * - sources: Unique list of all cited sources
 * - metadata: swarmSize, agentCount, executionTime
 *
 * Error Cases:
 * - 404: Swarm not found or unauthorized access
 * - 400: Swarm not completed or validation error
 *
 * Security:
 * - User ownership verified via userId + swarm.userId match
 * - TODO: Replace with NextAuth session verification
 */

import { type NextRequest } from "next/server";
import { ResearchSwarmService } from "@/features/research-swarm/services/ResearchSwarmService";
import { apiResponse } from "@/lib/api/response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const swarmService = new ResearchSwarmService();

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return apiResponse.badRequest("userId is required");
    }

    // Call service layer
    const results = await swarmService.getSwarmResults(id, userId);

    return apiResponse.success(results);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch results";

    // Return 404 for not found errors
    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("unauthorized")
    ) {
      return apiResponse.notFound("Swarm");
    }

    return apiResponse.error(error as Error, 400);
  }
}

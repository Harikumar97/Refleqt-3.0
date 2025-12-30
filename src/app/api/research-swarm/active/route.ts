/**
 * Active Research Swarms List API
 *
 * GET /api/research-swarm/active
 *
 * Purpose: Retrieves list of active and recent research swarms for a user
 *
 * Functionality:
 * - Fetches last 20 swarms sorted by creation date (desc)
 * - Returns swarm metadata including status, progress, execution time
 * - Maps internal swarmType to user-friendly display names
 *
 * Query Parameters:
 * - userId: Required (string) - User ID to filter swarms
 *
 * Response:
 * - success: boolean
 * - swarms: Array of swarm objects with id, query, type, status, progress, timeRemaining
 *
 * Security:
 * - User ownership verified via userId parameter
 * - TODO: Replace with NextAuth session verification
 */

import { type NextRequest } from "next/server";
import { ResearchSwarmService } from "@/features/research-swarm/services/ResearchSwarmService";
import { apiResponse } from "@/lib/api/response";

const swarmService = new ResearchSwarmService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit");

    if (!userId) {
      return apiResponse.badRequest("userId is required");
    }

    // Call service layer
    const swarms = await swarmService.getActiveSwarms(
      userId,
      limit ? parseInt(limit) : undefined
    );

    return apiResponse.success(swarms);
  } catch (error) {
    return apiResponse.error(error as Error, 400);
  }
}

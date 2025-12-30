/**
 * Research Swarm Statistics API
 *
 * GET /api/research-swarm/stats
 *
 * Purpose: Calculates and returns user performance metrics for research swarms
 *
 * Functionality:
 * - Counts total, active, completed, and failed swarms
 * - Calculates average execution time for completed swarms
 * - Computes success rate (completed / (completed + failed))
 * - Returns 3 most recent insights from completed swarms
 *
 * Query Parameters:
 * - userId: Required (string) - User ID to calculate stats for
 *
 * Metrics:
 * - totalSwarms: Total number of swarms created
 * - activeSwarms: Count of pending/running/processing swarms
 * - avgTime: Average execution time formatted as human-readable string (e.g., "2.5m")
 * - successRate: Percentage of successful completions (e.g., "95%")
 * - recentInsights: Array of 3 most recent findings
 *
 * Security:
 * - User ownership verified via userId parameter
 * - TODO: Replace with NextAuth session verification
 */

import { type NextRequest } from "next/server";
import { ResearchSwarmService } from "@/features/research-swarm/services/ResearchSwarmService";
import { apiResponse } from "@/lib/api/response";
import prisma from "@/lib/db/prisma";

const swarmService = new ResearchSwarmService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return apiResponse.badRequest("userId is required");
    }

    // Get stats from service layer
    const stats = await swarmService.getSwarmStats(userId);

    // Get active swarms count (pending/running/processing)
    const activeSwarms = await prisma.researchSwarm.count({
      where: {
        userId,
        status: { in: ["pending", "running", "processing"] },
      },
    });

    // Get recent insights (sample from recent findings)
    const recentFindings = await prisma.swarmFinding.findMany({
      where: {
        swarm: {
          userId,
          status: "completed",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: {
        content: true,
      },
    });

    // Format response for backward compatibility
    const avgTimeStr = formatDuration(stats.averageExecutionTimeMs);
    const totalCompleteOrFailed = stats.completedSwarms + stats.failedSwarms;
    const successRate =
      totalCompleteOrFailed > 0
        ? Math.round((stats.completedSwarms / totalCompleteOrFailed) * 100)
        : 100;

    return apiResponse.success({
      totalSwarms: stats.totalSwarms,
      activeSwarms,
      avgTime: avgTimeStr,
      successRate: `${successRate}%`,
      recentInsights: recentFindings.map((f) => f.content),
    });
  } catch (error) {
    return apiResponse.error(error as Error, 400);
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}.${Math.floor(seconds / 6)}m`;
  }
  return `${seconds}s`;
}

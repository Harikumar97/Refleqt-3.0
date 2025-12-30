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

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    assert(!!userId, "userId is required");

    // Get swarm counts
    const [totalSwarms, activeSwarms, completedSwarms, failedSwarms] =
      await Promise.all([
        prisma.researchSwarm.count({
          where: { userId },
        }),
        prisma.researchSwarm.count({
          where: {
            userId,
            status: { in: ["pending", "running", "processing"] },
          },
        }),
        prisma.researchSwarm.count({
          where: {
            userId,
            status: "completed",
          },
        }),
        prisma.researchSwarm.count({
          where: {
            userId,
            status: "failed",
          },
        }),
      ]);

    // Calculate average execution time for completed swarms
    const completedSwarmsWithTime = await prisma.researchSwarm.findMany({
      where: {
        userId,
        status: "completed",
        executionTimeMs: { not: null },
      },
      select: {
        executionTimeMs: true,
      },
    });

    const avgTime =
      completedSwarmsWithTime.length > 0
        ? Math.round(
            completedSwarmsWithTime.reduce(
              (sum: number, swarm) => sum + (swarm.executionTimeMs || 0),
              0
            ) / completedSwarmsWithTime.length
          )
        : 0;

    // Format average time as readable string
    const avgTimeStr = formatDuration(avgTime);

    // Calculate success rate
    const totalCompleteOrFailed = completedSwarms + failedSwarms;
    const successRate =
      totalCompleteOrFailed > 0
        ? Math.round((completedSwarms / totalCompleteOrFailed) * 100)
        : 100;

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

    return NextResponse.json({
      success: true,
      stats: {
        totalSwarms,
        activeSwarms,
        avgTime: avgTimeStr,
        successRate: `${successRate}%`,
        recentInsights: recentFindings.map(
          (f: { content: string }) => f.content
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching swarm stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 400 }
    );
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

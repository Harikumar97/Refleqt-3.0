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

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    assert(!!userId, "userId is required");

    // Get active and recent swarms
    const swarms = await prisma.researchSwarm.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to 20 most recent
      select: {
        id: true,
        query: true,
        swarmType: true,
        status: true,
        progressPct: true,
        timeRemaining: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        executionTimeMs: true,
      },
    });

    return NextResponse.json({
      success: true,
      swarms: swarms.map(
        (swarm: {
          id: string;
          query: string;
          swarmType: string;
          status: string;
          progressPct: number;
          timeRemaining: string | null;
          createdAt: Date;
        }) => ({
          id: swarm.id,
          query: swarm.query,
          type: swarm.swarmType,
          typeName: getTypeDisplayName(swarm.swarmType),
          status: swarm.status,
          progress: swarm.progressPct,
          timeRemaining: swarm.timeRemaining,
          timestamp: swarm.createdAt.getTime(),
        })
      ),
    });
  } catch (error) {
    console.error("Error fetching active swarms:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch swarms",
      },
      { status: 400 }
    );
  }
}

function getTypeDisplayName(type: string): string {
  const typeNames: Record<string, string> = {
    competitive: "Competitive Analysis",
    market: "Market Research",
    customer: "Customer Intelligence",
    product: "Product Research",
  };
  return typeNames[type] || type;
}

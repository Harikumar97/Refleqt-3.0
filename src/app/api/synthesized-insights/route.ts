/**
 * Synthesized Insights API
 * Fetch finite introspect insights (max 10) for display
 */

import { NextRequest, NextResponse } from "next/server";
import { assert } from "@/utils/assert";
import prisma from "@/lib/db/prisma";
import { getCached, invalidateInsights } from "@/lib/cache/redis-cache";
import { CacheKeys, CacheTTL } from "@/lib/cache/cache-config";

/**
 * GET /api/synthesized-insights
 * Get synthesized insights with finite introspect (max 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    const hierarchyLevel = searchParams.get("hierarchyLevel");
    const limit = parseInt(searchParams.get("limit") || "10");

    assert(userId !== null, "userId is required");

    // Build where clause
    const where: any = {
      userId,
      dismissedAt: null, // Only show non-dismissed insights
    };

    if (hierarchyLevel) {
      assert(
        ["strategic", "tactical", "operational"].includes(hierarchyLevel),
        "Invalid hierarchyLevel"
      );
      where.hierarchyLevel = hierarchyLevel;
    }

    // Generate cache key
    const cacheKey = CacheKeys.synthesizedInsights(
      userId,
      hierarchyLevel || undefined
    );

    // Fetch insights with caching (cache-aside pattern)
    const insights = await getCached(
      cacheKey,
      async () => {
        return await prisma.synthesizedInsight.findMany({
          where,
          orderBy: [{ priorityScore: "desc" }, { displayPosition: "asc" }],
          take: Math.min(limit, 10), // Enforce max 10
          include: {
            swarm: {
              select: {
                query: true,
                createdAt: true,
                executionTimeMs: true,
              },
            },
          },
        });
      },
      CacheTTL.SYNTHESIZED_INSIGHTS
    );

    return NextResponse.json({
      success: true,
      data: {
        insights: insights.map((insight) => ({
          id: insight.id,
          title: insight.title,
          content: insight.content,
          hierarchyLevel: insight.hierarchyLevel,
          priorityScore: Number(insight.priorityScore),
          relevanceScore: Number(insight.relevanceScore),
          isActionable: insight.isActionable,
          actionItems: insight.actionItems,
          psychographicTags: insight.psychographicTags,
          displayPosition: insight.displayPosition,
          swarmQuery: insight.swarm.query,
          swarmExecutedAt: insight.swarm.createdAt,
          createdAt: insight.createdAt,
        })),
        totalCount: insights.length,
        finiteIntrospectApplied: true,
        maxInsights: 10,
      },
    });
  } catch (error) {
    console.error("Error fetching synthesized insights:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/synthesized-insights/dismiss
 * Dismiss an insight (removes from finite introspect display)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, insightId } = body;

    assert(userId, "userId is required");
    assert(insightId, "insightId is required");

    // Verify ownership
    const insight = await prisma.synthesizedInsight.findFirst({
      where: {
        id: insightId,
        userId,
      },
    });

    assert(insight !== null, "Insight not found or unauthorized");

    // Mark as dismissed
    await prisma.synthesizedInsight.update({
      where: { id: insightId },
      data: {
        dismissedAt: new Date(),
      },
    });

    // Invalidate insights cache for this user
    await invalidateInsights(userId);

    return NextResponse.json({
      success: true,
      message: "Insight dismissed successfully",
    });
  } catch (error) {
    console.error("Error dismissing insight:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

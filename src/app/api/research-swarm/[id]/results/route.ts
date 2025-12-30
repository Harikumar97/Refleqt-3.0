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

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";

interface RouteContext {
  params: Promise<{ id: string }>;
}
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    assert(!!userId, "userId is required");

    // Fetch swarm with all related data
    const swarm = await prisma.researchSwarm.findFirst({
      where: {
        id,
        userId, // Ensure user owns this swarm
      },
      include: {
        findings: {
          orderBy: {
            createdAt: "asc",
          },
        },
        recommendations: {
          orderBy: {
            priority: "desc",
          },
        },
      },
    });

    assert(!!swarm, "Swarm not found or unauthorized");
    assert(swarm.status === "completed", "Swarm is not yet completed");

    // Transform findings into key findings format
    const keyFindings = swarm.findings.map(
      (finding: { content: string }) => finding.content
    );

    // Transform recommendations
    const recommendations = swarm.recommendations.map(
      (rec: {
        action: string;
        impact: string;
        priority: string;
        timeline: string;
        effort: string;
        revenueImpact: string | null;
      }) => ({
        action: rec.action,
        impact: rec.impact,
        priority: rec.priority,
        timeline: rec.timeline,
        effort: rec.effort,
        revenueImpact: rec.revenueImpact || undefined,
      })
    );

    // Extract sources from findings
    const allSources = swarm.findings
      .filter((f: { sources: unknown }) => f.sources)
      .flatMap((f: { sources: unknown }) => (f.sources as string[]) || []);
    const uniqueSources = Array.from(new Set(allSources));

    return NextResponse.json({
      success: true,
      results: {
        swarmId: swarm.id,
        query: swarm.query,
        type: swarm.swarmType,
        completedAt: swarm.completedAt,
        executionTimeMs: swarm.executionTimeMs,
        keyFindings,
        recommendations,
        sources: uniqueSources,
        metadata: {
          swarmSize: swarm.swarmSize,
          agentCount: swarm.findings.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching swarm results:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch results",
      },
      {
        status:
          error instanceof Error && error.message.includes("not found")
            ? 404
            : 400,
      }
    );
  }
}

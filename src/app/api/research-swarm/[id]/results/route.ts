import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/research-swarm/:id/results
 * Get detailed results for a completed swarm
 */
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

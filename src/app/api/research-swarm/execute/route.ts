/**
 * Research Swarm Execution API with Multi-LLM Support
 * Execute strategy cohort queries and research goals
 */

import { NextRequest, NextResponse } from "next/server";
import { assert } from "@/utils/assert";
import { MCPOrchestrator } from "@/lib/research-swarm/mcp-orchestrator";
import prisma from "@/lib/db/prisma";

/**
 * POST /api/research-swarm/execute
 * Execute a strategy cohort query (2-minute synthesis)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, goalId } = body;

    assert(userId, "userId is required");
    assert(query, "query is required");

    // Get user context (obsession score, goals)
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const obsessionScore = userProfile?.obsessionScore
      ? Number(userProfile.obsessionScore)
      : 5.0;

    // Get existing research goals for context
    const researchGoals = await prisma.researchGoal.findMany({
      where: { userId, isActive: true },
      select: { goalQuery: true },
    });

    const userContext = {
      userId,
      obsessionScore,
      goals: researchGoals.map((g) => g.goalQuery),
      ...(userProfile?.industry && { industry: userProfile.industry }),
    };

    // Execute strategy cohort with multi-provider ensemble for high obsession scores
    // High obsession users get multi-LLM analysis for better insights
    const orchestrator = new MCPOrchestrator({
      enableMultiProvider: obsessionScore >= 8,
      providers: ["claude", "openai", "gemini"],
    });
    const result = await orchestrator.executeStrategyCohort(query, userContext);

    // Store results in database
    const swarm = await prisma.researchSwarm.create({
      data: {
        goalId: goalId || null,
        userId,
        query,
        swarmType: "competitive", // Inferred from query
        swarmSize: obsessionScore >= 7 ? "large" : "small",
        status: result.status,
        progressPct: 100,
        synthesisApplied: true,
        executionTimeMs: result.executionTimeMs,
        startedAt: new Date(Date.now() - result.executionTimeMs),
        completedAt: new Date(),
      },
    });

    // Store synthesized insights
    const insights = await Promise.all(
      result.insights.insights.map((insight) =>
        prisma.synthesizedInsight.create({
          data: {
            swarmId: swarm.id,
            userId,
            title: insight.title,
            content: insight.content,
            hierarchyLevel: insight.hierarchyLevel,
            priorityScore: insight.priorityScore,
            relevanceScore: insight.relevanceScore,
            isActionable: insight.isActionable,
            actionItems: insight.actionItems,
            sourceFindingIds: insight.sourceFindingIds,
            psychographicTags: insight.psychographicTags,
            displayPosition: insight.displayPosition,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        swarmId: swarm.id,
        query,
        insights: insights.map((i: any) => ({
          id: i.id,
          title: i.title,
          content: i.content,
          hierarchyLevel: i.hierarchyLevel,
          priorityScore: Number(i.priorityScore),
          relevanceScore: Number(i.relevanceScore),
          isActionable: i.isActionable,
          actionItems: i.actionItems,
          displayPosition: i.displayPosition,
        })),
        hierarchyNodes: result.insights.hierarchyNodes,
        executionTimeMs: result.executionTimeMs,
        status: result.status,
      },
    });
  } catch (error) {
    console.error("Research swarm execution error:", error);
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
 * GET /api/research-swarm/execute/status
 * Check status of a running swarm
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const swarmId = searchParams.get("swarmId");
    const userId = searchParams.get("userId");

    assert(swarmId !== null, "swarmId is required");
    assert(userId !== null, "userId is required");

    const swarm = await prisma.researchSwarm.findFirst({
      where: {
        id: swarmId,
        userId,
      },
      include: {
        synthesizedData: {
          orderBy: { displayPosition: "asc" },
        },
      },
    });

    assert(swarm !== null, "Swarm not found");

    return NextResponse.json({
      success: true,
      data: {
        swarmId: swarm.id,
        query: swarm.query,
        status: swarm.status,
        progressPct: swarm.progressPct,
        executionTimeMs: swarm.executionTimeMs,
        insights: swarm.synthesizedData.map((i) => ({
          id: i.id,
          title: i.title,
          content: i.content,
          hierarchyLevel: i.hierarchyLevel,
          priorityScore: Number(i.priorityScore),
          relevanceScore: Number(i.relevanceScore),
          isActionable: i.isActionable,
          actionItems: i.actionItems,
          displayPosition: i.displayPosition,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching swarm status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

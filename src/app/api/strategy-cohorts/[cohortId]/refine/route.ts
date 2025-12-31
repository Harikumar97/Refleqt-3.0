/**
 * Refinement API - Generate additional insights with AI
 * POST /api/strategy-cohorts/[cohortId]/refine
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { MCPOrchestrator } from "@/lib/research-swarm/mcp-orchestrator";
import type { SynthesisResult } from "@/lib/research-swarm/types";

interface RefineRequest {
  query: string;
  focusAreas?: string[];
}

/**
 * POST /api/strategy-cohorts/[cohortId]/refine
 * Generate additional insights based on refinement query
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { cohortId } = params;
    const body: RefineRequest = await request.json();
    const { query, focusAreas = [] } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Refinement query is required" },
        { status: 400 }
      );
    }

    // Verify ownership and fetch cohort with data
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
      include: {
        competitors: true,
        insights: true,
        contexts: true,
      },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Initialize orchestrator
    const orchestrator = new MCPOrchestrator({
      enableMultiProvider: true,
      providers: ["claude", "openai", "gemini"],
    });

    // Build refinement prompt
    const competitorNames = cohort.competitors.map((c) => c.name).join(", ");
    const existingInsights = cohort.insights
      .map((i) => `- ${i.category}: ${i.title}`)
      .join("\n");

    const refinementPrompt = `
You are refining a competitive analysis for the following competitors: ${competitorNames}

Existing insights:
${existingInsights}

User's refinement request: ${query}

${focusAreas.length > 0 ? `Focus areas: ${focusAreas.join(", ")}` : ""}

Generate 3-5 additional insights that address the user's request and complement the existing insights.
Format each insight as a JSON object with: title, content, category, confidence (high/medium/low)
`;

    // Use orchestrator to generate insights
    const swarmResult = await orchestrator.executeStrategyCohort(
      refinementPrompt,
      {
        userId,
        obsessionScore: 9, // High priority for refinement
        goals: cohort.competitors.map((c: any) => `Analyze ${c.name}`),
        industry: "",
      }
    );

    // Parse and store new insights
    const additionalInsights = parseInsightsFromSwarmResult(
      swarmResult.insights,
      cohort.insights.length
    );

    // Store new insights in database
    const createdInsights = await Promise.all(
      additionalInsights.map((insight, index) =>
        prisma.cohortInsight.create({
          data: {
            cohortId,
            title: insight.title,
            content: insight.content,
            category: insight.category,
            confidence: insight.confidence as "high" | "medium" | "low",
            rank: cohort.insights.length + index,
            sources: insight.sources || [],
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      additionalInsights: createdInsights,
      count: createdInsights.length,
    });
  } catch (error) {
    console.error("Refinement failed:", error);

    return NextResponse.json(
      {
        error: "Refinement failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Parse insights from swarm result
 */
function parseInsightsFromSwarmResult(
  synthesisResult: SynthesisResult,
  startRank: number
) {
  const insights: any[] = [];

  try {
    // Extract insights from synthesis result
    synthesisResult.insights.forEach((insight, index) => {
      insights.push({
        title: insight.title,
        content: insight.content,
        category: mapHierarchyLevelToCategory(insight.hierarchyLevel),
        confidence: mapPriorityToConfidence(insight.priorityScore),
        rank: startRank + index,
        sources: insight.sourceFindingIds || [],
      });
    });

    // If no insights found, create a general insight
    if (insights.length === 0) {
      insights.push({
        title: "Refined Analysis",
        content:
          "No additional insights generated. Please try a different query.",
        category: "General",
        confidence: "low",
        rank: startRank,
        sources: [],
      });
    }
  } catch (error) {
    console.error("Failed to parse insights:", error);
    // Return default insight
    insights.push({
      title: "Analysis Result",
      content: "Error processing refinement results. Please try again.",
      category: "General",
      confidence: "low",
      rank: startRank,
      sources: [],
    });
  }

  return insights;
}

/**
 * Map hierarchy level to category
 */
function mapHierarchyLevelToCategory(
  level: "strategic" | "tactical" | "operational"
): string {
  const mapping = {
    strategic: "Strategic Insights",
    tactical: "Tactical Opportunities",
    operational: "Operational Details",
  };
  return mapping[level];
}

/**
 * Map priority score to confidence level
 */
function mapPriorityToConfidence(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

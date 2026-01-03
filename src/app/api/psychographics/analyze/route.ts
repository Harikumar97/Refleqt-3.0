/**
 * Psychographic Analysis API
 * Trigger behavioral segmentation analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { assert } from "@/utils/assert";
import prisma from "@/lib/db/prisma";
import {
  generateBehavioralSegments,
  storeSegments,
  generateJourneyStages,
  calculateConfidenceScore,
} from "@/lib/psychographics/analysis-engine";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * POST /api/psychographics/analyze
 * Execute psychographic analysis
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { userId, analysisType } = body;

    // Validation
    assert(userId, "userId is required");
    assert(analysisType, "analysisType is required");
    assert(
      [
        "behavioral-segments",
        "journey-mapping",
        "conversion-psychology",
        "competitive-psychographics",
      ].includes(analysisType),
      "Invalid analysisType"
    );

    // Create analysis record
    const analysis = await prisma.psychographicAnalysis.create({
      data: {
        userId,
        analysisType,
        status: "processing",
        progressPercent: 0,
        currentStage: "Initializing Behavioral Analysis",
        stageDescription:
          "Setting up AI engines for customer psychology analysis...",
        startedAt: new Date(),
      },
    });

    // Start async analysis (in production, this would be a background job)
    // For now, we'll run it synchronously for simplicity
    try {
      // Generate behavioral segments with progress tracking
      const segments = await generateBehavioralSegments(
        userId,
        analysis.id,
        async (progress) => {
          await prisma.psychographicAnalysis.update({
            where: { id: analysis.id },
            data: {
              progressPercent: progress.progress,
              currentStage: progress.stage,
              stageDescription: progress.description,
            },
          });
        }
      );

      // Store segments in database
      await storeSegments(userId, analysis.id, segments);

      // Generate journey stages
      await generateJourneyStages(userId, analysis.id);

      // Calculate execution time and confidence
      const executionTime = Date.now() - startTime;
      const totalInteractions = 12847; // Sample data
      const confidence = calculateConfidenceScore(totalInteractions);

      // Mark analysis as completed
      await prisma.psychographicAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: "completed",
          progressPercent: 100,
          currentStage: "Complete",
          stageDescription: "Behavioral analysis complete! Displaying results...",
          executionTimeMs: executionTime,
          confidenceScore: confidence,
          interactionsCount: totalInteractions,
          completedAt: new Date(),
        },
      });

      // Fetch the created segments
      const createdSegments = await prisma.psychographicSegment.findMany({
        where: {
          userId,
          analysisId: analysis.id,
        },
        include: {
          insights: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          analysisId: analysis.id,
          executionTimeMs: executionTime,
          confidenceScore: confidence,
          interactionsCount: totalInteractions,
          segments: createdSegments,
        },
      });
    } catch (analysisError) {
      // Mark analysis as failed
      await prisma.psychographicAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: "failed",
          stageDescription:
            analysisError instanceof Error
              ? analysisError.message
              : "Unknown error",
        },
      });

      throw analysisError;
    }
  } catch (error) {
    console.error("Error executing psychographic analysis:", error);
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
 * GET /api/psychographics/analyze
 * Get analysis status or results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const analysisId = searchParams.get("analysisId");
    const userId = searchParams.get("userId");

    if (analysisId) {
      // Get specific analysis
      assert(userId !== null, "userId is required");

      const analysis = await prisma.psychographicAnalysis.findFirst({
        where: {
          id: analysisId,
          userId,
        },
      });

      assert(analysis !== null, "Analysis not found");

      return NextResponse.json({
        success: true,
        data: analysis,
      });
    } else {
      // List all analyses for user
      assert(userId !== null, "userId is required");

      const analyses = await prisma.psychographicAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        data: analyses,
      });
    }
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

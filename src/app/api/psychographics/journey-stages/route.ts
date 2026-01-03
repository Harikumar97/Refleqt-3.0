/**
 * Journey Stages API
 * Retrieve customer journey stage data
 */

import { NextRequest, NextResponse } from "next/server";
import { assert } from "@/utils/assert";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/psychographics/journey-stages
 * Get journey stages for a user's analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");
    const analysisId = searchParams.get("analysisId");

    assert(userId !== null, "userId is required");

    const whereClause: any = { userId };
    if (analysisId) {
      whereClause.analysisId = analysisId;
    }

    const stages = await prisma.journeyStage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    console.error("Error fetching journey stages:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

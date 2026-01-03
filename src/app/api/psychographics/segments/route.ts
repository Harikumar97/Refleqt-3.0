/**
 * Psychographic Segments API
 * Retrieve behavioral segments and insights
 */

import { NextRequest, NextResponse } from "next/server";
import { assert } from "@/utils/assert";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/psychographics/segments
 * Get behavioral segments for a user
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

    const segments = await prisma.psychographicSegment.findMany({
      where: whereClause,
      include: {
        insights: {
          orderBy: { confidenceScore: "desc" },
        },
      },
      orderBy: { percentage: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

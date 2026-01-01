/**
 * Individual Competitor API
 * Delete specific competitors from a cohort
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * DELETE /api/strategy-cohorts/[cohortId]/competitors/[competitorId]
 * Remove a competitor from the cohort
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cohortId: string; competitorId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const { cohortId, competitorId } = await params;

    // Verify cohort ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Don't allow deleting competitors while analysis is in progress
    if (cohort.status === "analyzing") {
      return NextResponse.json(
        { error: "Cannot modify competitors while analysis is in progress" },
        { status: 400 }
      );
    }

    // Verify competitor exists and belongs to this cohort
    const competitor = await prisma.cohortCompetitor.findFirst({
      where: {
        id: competitorId,
        cohortId,
      },
    });

    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor not found in this cohort" },
        { status: 404 }
      );
    }

    // Delete the competitor
    await prisma.cohortCompetitor.delete({
      where: { id: competitorId },
    });

    return NextResponse.json(
      { success: true, message: "Competitor removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete competitor:", error);

    return NextResponse.json(
      {
        error: "Failed to remove competitor",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

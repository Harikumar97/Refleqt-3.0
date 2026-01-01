/**
 * Individual Insight API
 * Update and delete specific insights
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

interface UpdateInsightRequest {
  title?: string;
  content?: string;
  category?: string;
  confidence?: "high" | "medium" | "low";
}

/**
 * PATCH /api/strategy-cohorts/[cohortId]/insights/[insightId]
 * Update a specific insight
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cohortId: string; insightId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { cohortId, insightId } = await params;
    const body: UpdateInsightRequest = await request.json();

    // Verify cohort ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Verify insight belongs to this cohort
    const existingInsight = await prisma.cohortInsight.findFirst({
      where: {
        id: insightId,
        cohortId,
      },
    });

    if (!existingInsight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    // Update insight
    const updatedInsight = await prisma.cohortInsight.update({
      where: { id: insightId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.confidence !== undefined && { confidence: body.confidence }),
      },
    });

    return NextResponse.json({
      success: true,
      insight: updatedInsight,
    });
  } catch (error) {
    console.error("Failed to update insight:", error);

    return NextResponse.json(
      {
        error: "Failed to update insight",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/strategy-cohorts/[cohortId]/insights/[insightId]
 * Delete a specific insight
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cohortId: string; insightId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { cohortId, insightId } = await params;

    // Verify cohort ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Verify insight belongs to this cohort
    const existingInsight = await prisma.cohortInsight.findFirst({
      where: {
        id: insightId,
        cohortId,
      },
    });

    if (!existingInsight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    // Delete insight
    await prisma.cohortInsight.delete({
      where: { id: insightId },
    });

    return NextResponse.json({
      success: true,
      message: "Insight deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete insight:", error);

    return NextResponse.json(
      {
        error: "Failed to delete insight",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

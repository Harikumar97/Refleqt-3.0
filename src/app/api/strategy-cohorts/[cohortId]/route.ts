/**
 * Individual Strategy Cohort API
 * Get, update, and delete specific cohorts
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { UpdateCohortRequest } from "@/lib/strategy-cohorts/types";

/**
 * GET /api/strategy-cohorts/[cohortId]
 * Get a specific cohort with all related data
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const { cohortId } = await params;

    const cohort = await prisma.strategyCohort.findFirst({
      where: {
        id: cohortId,
        userId, // Ensure user can only access their own cohorts
      },
      include: {
        competitors: {
          orderBy: { createdAt: "asc" },
        },
        contexts: {
          orderBy: { createdAt: "asc" },
        },
        insights: {
          orderBy: { rank: "asc" },
        },
        _count: {
          select: {
            competitors: true,
            insights: true,
          },
        },
      },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    return NextResponse.json({ cohort });
  } catch (error) {
    console.error("Failed to fetch cohort:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve cohort",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/strategy-cohorts/[cohortId]
 * Update cohort configuration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const { cohortId } = await params;
    const body: UpdateCohortRequest = await request.json();

    // Verify ownership
    const existing = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Don't allow updating completed/analyzing cohorts
    if (existing.status === "analyzing") {
      return NextResponse.json(
        { error: "Cannot update cohort while analysis is in progress" },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      query,
      analysisType,
      includeFinancial,
      includeSocial,
      includeTech,
      includeSentiment,
    } = body;

    const cohort = await prisma.strategyCohort.update({
      where: { id: cohortId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(query !== undefined && { query }),
        ...(analysisType !== undefined && { analysisType }),
        ...(includeFinancial !== undefined && { includeFinancial }),
        ...(includeSocial !== undefined && { includeSocial }),
        ...(includeTech !== undefined && { includeTech }),
        ...(includeSentiment !== undefined && { includeSentiment }),
        updatedAt: new Date(),
      },
      include: {
        competitors: true,
        contexts: true,
        insights: true,
      },
    });

    return NextResponse.json({ cohort });
  } catch (error) {
    console.error("Failed to update cohort:", error);

    return NextResponse.json(
      {
        error: "Failed to update cohort",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/strategy-cohorts/[cohortId]
 * Delete a cohort and all related data
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const { cohortId } = await params;

    // Verify ownership
    const existing = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Don't allow deleting while analysis is in progress
    if (existing.status === "analyzing") {
      return NextResponse.json(
        { error: "Cannot delete cohort while analysis is in progress" },
        { status: 400 }
      );
    }

    // Delete cohort (cascade will handle related records)
    await prisma.strategyCohort.delete({
      where: { id: cohortId },
    });

    return NextResponse.json(
      { success: true, message: "Cohort deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete cohort:", error);

    return NextResponse.json(
      {
        error: "Failed to delete cohort",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

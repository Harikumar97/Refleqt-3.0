/**
 * Cohort Competitors API
 * Manage competitors within a strategy cohort
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type { AddCompetitorRequest } from "@/lib/strategy-cohorts/types";

/**
 * GET /api/strategy-cohorts/[cohortId]/competitors
 * List all competitors in a cohort
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const { cohortId } = await params;

    // Verify cohort ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    const competitors = await prisma.cohortCompetitor.findMany({
      where: { cohortId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ competitors });
  } catch (error) {
    console.error("Failed to list competitors:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve competitors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategy-cohorts/[cohortId]/competitors
 * Add a competitor to the cohort
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const { cohortId } = await params;
    const body: AddCompetitorRequest = await request.json();

    // Verify cohort ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Don't allow adding competitors while analysis is in progress
    if (cohort.status === "analyzing") {
      return NextResponse.json(
        { error: "Cannot modify competitors while analysis is in progress" },
        { status: 400 }
      );
    }

    const {
      name,
      url,
      domain,
      industry,
      employees,
      funding,
      logoUrl,
      discoveredData,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Competitor name is required" },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await prisma.cohortCompetitor.findFirst({
      where: {
        cohortId,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Competitor already exists in this cohort" },
        { status: 400 }
      );
    }

    const competitor = await prisma.cohortCompetitor.create({
      data: {
        cohortId,
        name,
        url: url || null,
        domain: domain || null,
        industry: industry || null,
        employees: employees || null,
        funding: funding || null,
        logoUrl: logoUrl || null,
        discoveredData: discoveredData || null,
        status: "pending",
      },
    });

    return NextResponse.json({ competitor }, { status: 201 });
  } catch (error) {
    console.error("Failed to add competitor:", error);

    return NextResponse.json(
      {
        error: "Failed to add competitor",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

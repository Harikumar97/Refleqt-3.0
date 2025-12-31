/**
 * Strategy Cohorts API
 * CRUD operations for Strategy Cohorts
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import type {
  CreateCohortRequest,
  ListCohortsResponse,
} from "@/lib/strategy-cohorts/types";

/**
 * GET /api/strategy-cohorts
 * List all cohorts for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as any;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [cohorts, total] = await Promise.all([
      prisma.strategyCohort.findMany({
        where,
        include: {
          _count: {
            select: {
              competitors: true,
              insights: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.strategyCohort.count({ where }),
    ]);

    const response: ListCohortsResponse = {
      cohorts: cohorts as any,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to list cohorts:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve cohorts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategy-cohorts
 * Create a new cohort
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id"; // Replace with actual auth

    const body: CreateCohortRequest = await request.json();

    const { name, description, analysisType = "insights" } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const cohort = await prisma.strategyCohort.create({
      data: {
        userId,
        name,
        description: description || null,
        analysisType,
        status: "draft",
      },
      include: {
        competitors: true,
        contexts: true,
        insights: true,
      },
    });

    return NextResponse.json({ cohort }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cohort:", error);

    return NextResponse.json(
      {
        error: "Failed to create cohort",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

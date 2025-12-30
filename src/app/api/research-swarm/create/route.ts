import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";

/**
 * POST /api/research-swarm/create
 * Create a new research swarm
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, query, swarmType } = body;

    // Validate required fields
    assert(userId, "userId is required");
    assert(query, "query is required");
    assert(swarmType, "swarmType is required");

    // Validate query length
    assert(
      query.length >= 10 && query.length <= 500,
      "Query must be between 10 and 500 characters"
    );

    // Validate swarm type
    const validTypes = ["competitive", "market", "customer", "product"];
    assert(
      validTypes.includes(swarmType),
      `Invalid swarmType. Must be one of: ${validTypes.join(", ")}`
    );

    // Create the swarm
    const swarm = await prisma.researchSwarm.create({
      data: {
        userId,
        query,
        swarmType,
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
      },
    });

    // TODO: Enqueue swarm execution job with BullMQ
    // For now, we'll return the created swarm

    return NextResponse.json({
      success: true,
      swarm: {
        id: swarm.id,
        query: swarm.query,
        type: swarm.swarmType,
        status: swarm.status,
        progress: swarm.progressPct,
        timeRemaining: swarm.timeRemaining,
        createdAt: swarm.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating research swarm:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create swarm",
      },
      { status: 400 }
    );
  }
}

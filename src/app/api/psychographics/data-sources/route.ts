/**
 * Psychographic Data Sources API
 * Manage integrations with analytics platforms (GA, Mixpanel, Hotjar, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { assert } from "@/utils/assert";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/psychographics/data-sources
 * List all data source integrations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    assert(userId !== null, "userId is required");

    const sources = await prisma.psychographicDataSource.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    console.error("Error fetching data sources:", error);
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
 * POST /api/psychographics/data-sources
 * Add or update a data source integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sourceType, sourceName, isConnected, configuration } =
      body;

    // Validation
    assert(userId, "userId is required");
    assert(sourceType, "sourceType is required");
    assert(sourceName, "sourceName is required");
    assert(
      [
        "google-analytics",
        "mixpanel",
        "hotjar",
        "salesforce",
        "amplitude",
        "segment",
      ].includes(sourceType),
      "Invalid sourceType"
    );

    // Upsert source (create or update if exists)
    const source = await prisma.psychographicDataSource.upsert({
      where: {
        userId_sourceType: {
          userId,
          sourceType,
        },
      },
      create: {
        userId,
        sourceType,
        sourceName,
        isConnected: isConnected ?? false,
        configuration: configuration ?? null,
      },
      update: {
        sourceName,
        isConnected: isConnected ?? false,
        configuration: configuration ?? null,
        lastSyncedAt: isConnected ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error("Error managing data source:", error);
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
 * DELETE /api/psychographics/data-sources
 * Remove a data source integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sourceId = searchParams.get("sourceId");
    const userId = searchParams.get("userId");

    assert(sourceId !== null, "sourceId is required");
    assert(userId !== null, "userId is required");

    // Verify ownership before deleting
    const source = await prisma.psychographicDataSource.findFirst({
      where: {
        id: sourceId,
        userId,
      },
    });

    assert(source !== null, "Source not found or unauthorized");

    // Delete source
    await prisma.psychographicDataSource.delete({
      where: { id: sourceId },
    });

    return NextResponse.json({
      success: true,
      message: "Data source deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting data source:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

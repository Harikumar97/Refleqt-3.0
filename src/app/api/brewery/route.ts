/**
 * Brewery API - Content Repository
 * Save and manage insights from Research Swarms, Strategy Cohorts, Intelligence Feed
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

interface SaveBreweryItemRequest {
  title: string;
  content: string;
  excerpt?: string;
  sourceType: "research-swarm" | "strategy-cohort" | "intelligence-feed";
  sourceId: string;
  sourceName?: string;
  category?: string;
  confidence?: string;
  tags?: string[];
}

/**
 * GET /api/brewery
 * List all brewery items for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("sourceType");
    const writerStatus = searchParams.get("writerStatus");
    const tag = searchParams.get("tag");

    const where: any = { userId };

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (writerStatus) {
      where.writerStatus = writerStatus;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const items = await prisma.breweryItem.findMany({
      where,
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch brewery items:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch brewery items",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brewery
 * Save a new insight to the brewery
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const body: SaveBreweryItemRequest = await request.json();

    const {
      title,
      content,
      excerpt,
      sourceType,
      sourceId,
      sourceName,
      category,
      confidence,
      tags = [],
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { error: "Source type and ID are required" },
        { status: 400 }
      );
    }

    // Check if already saved (prevent duplicates)
    const existing = await prisma.breweryItem.findFirst({
      where: {
        userId,
        sourceType,
        sourceId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This insight is already saved to your Brewery" },
        { status: 409 }
      );
    }

    // Create brewery item
    const item = await prisma.breweryItem.create({
      data: {
        userId,
        title,
        content,
        ...(excerpt && { excerpt }),
        sourceType,
        sourceId,
        ...(sourceName && { sourceName }),
        ...(category && { category }),
        ...(confidence && { confidence }),
        tags,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Failed to save brewery item:", error);

    return NextResponse.json(
      {
        error: "Failed to save to brewery",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

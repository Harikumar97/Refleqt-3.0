/**
 * Individual Brewery Item API
 * Update and delete specific brewery items
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

interface UpdateBreweryItemRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  writerStatus?: string;
}

/**
 * GET /api/brewery/[itemId]
 * Get a specific brewery item
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { itemId } = await params;

    const item = await prisma.breweryItem.findFirst({
      where: {
        id: itemId,
        userId, // Ensure user can only access their own items
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Failed to fetch brewery item:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch item",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/brewery/[itemId]
 * Update a brewery item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { itemId } = await params;
    const body: UpdateBreweryItemRequest = await request.json();

    // Verify ownership
    const existing = await prisma.breweryItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update item
    const item = await prisma.breweryItem.update({
      where: { id: itemId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.writerStatus !== undefined && {
          writerStatus: body.writerStatus,
        }),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Failed to update brewery item:", error);

    return NextResponse.json(
      {
        error: "Failed to update item",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/brewery/[itemId]
 * Delete a brewery item
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { itemId } = await params;

    // Verify ownership
    const existing = await prisma.breweryItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete item
    await prisma.breweryItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete brewery item:", error);

    return NextResponse.json(
      {
        error: "Failed to delete item",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

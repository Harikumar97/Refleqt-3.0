/**
 * Create Writer Token Request
 * Generate a token request for the Expert Writers platform
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

interface CreateTokenRequest {
  breweryItemIds: string[];
  platform: string; // 'linkedin', 'twitter', 'blog', etc.
  contentType: string; // 'article', 'thread', 'post', 'video-script'
  deadline?: string;
  brief?: string;
}

/**
 * POST /api/brewery/create-token
 * Create a writer request token
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const body: CreateTokenRequest = await request.json();
    const { breweryItemIds, platform, contentType, deadline, brief } = body;

    // Validation
    if (!breweryItemIds?.length) {
      return NextResponse.json(
        { error: "At least one brewery item is required" },
        { status: 400 }
      );
    }

    if (!platform || !contentType) {
      return NextResponse.json(
        { error: "Platform and content type are required" },
        { status: 400 }
      );
    }

    // Verify all items belong to user
    const items = await prisma.breweryItem.findMany({
      where: {
        id: { in: breweryItemIds },
        userId,
      },
    });

    if (items.length !== breweryItemIds.length) {
      return NextResponse.json(
        { error: "Some items not found or do not belong to you" },
        { status: 404 }
      );
    }

    // Generate unique token for writer platform
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Send to external Writer Platform API
    // For now, we'll just create a mock request record
    const writerRequest = {
      id: `req_${Date.now()}`,
      token,
      userId,
      breweryItemIds,
      platform,
      contentType,
      deadline: deadline ? new Date(deadline) : null,
      brief: brief || "",
      status: "pending",
      createdAt: new Date(),
    };

    // Update brewery items with request status
    await prisma.breweryItem.updateMany({
      where: {
        id: { in: breweryItemIds },
      },
      data: {
        writerStatus: "request-created",
        writerRequestId: writerRequest.id,
      },
    });

    // TODO: In production, send to Writer Platform API:
    // await fetch('https://writers.refleqt.com/api/requests', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${WRITER_PLATFORM_API_KEY}` },
    //   body: JSON.stringify({
    //     token,
    //     userId,
    //     content: items.map(i => ({ title: i.title, content: i.content })),
    //     platform,
    //     contentType,
    //     deadline,
    //     brief,
    //   }),
    // });

    console.log("Writer request created:", writerRequest);

    return NextResponse.json({
      success: true,
      request: writerRequest,
      message:
        "Writer request created successfully. You will be notified when a writer is assigned.",
    });
  } catch (error) {
    console.error("Failed to create writer request:", error);

    return NextResponse.json(
      {
        error: "Failed to create writer request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

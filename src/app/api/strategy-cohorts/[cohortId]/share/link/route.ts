/**
 * Share Link API - Generate shareable links with permissions
 * POST /api/strategy-cohorts/[cohortId]/share/link
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { randomBytes } from "crypto";

type Permission = "view" | "edit" | "admin";

interface ShareLinkRequest {
  permission: Permission;
}

/**
 * POST /api/strategy-cohorts/[cohortId]/share/link
 * Generate a shareable link with specified permissions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { cohortId } = params;
    const body: ShareLinkRequest = await request.json();
    const { permission } = body;

    // Verify ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // Generate unique share token
    const shareToken = randomBytes(32).toString("hex");

    // TODO: Store share token in database with expiration and permissions
    // For now, we'll create a simple share link
    // In production, you'd want to store this in a CohortShare table

    const baseUrl =
      process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000";
    const shareLink = `${baseUrl}/shared/strategy-cohorts/${cohortId}?token=${shareToken}&permission=${permission}`;

    // TODO: Store share record in database
    // await prisma.cohortShare.create({
    //   data: {
    //     cohortId,
    //     token: shareToken,
    //     permission,
    //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    //   },
    // });

    return NextResponse.json({
      shareLink,
      token: shareToken,
      permission,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
  } catch (error) {
    console.error("Failed to generate share link:", error);

    return NextResponse.json(
      {
        error: "Failed to generate share link",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Share Email API - Send email invitations to collaborate
 * POST /api/strategy-cohorts/[cohortId]/share/email
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

type Permission = "view" | "edit" | "admin";

interface ShareEmailRequest {
  email: string;
  permission: Permission;
}

/**
 * POST /api/strategy-cohorts/[cohortId]/share/email
 * Send email invitation to collaborate on cohort
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = "demo-user-id";

    const { cohortId } = params;
    const body: ShareEmailRequest = await request.json();
    const { email, permission } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Verify ownership
    const cohort = await prisma.strategyCohort.findFirst({
      where: { id: cohortId, userId },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    // TODO: Store share record in database
    // await prisma.cohortShare.create({
    //   data: {
    //     cohortId,
    //     email,
    //     permission,
    //     invitedBy: userId,
    //   },
    // });

    // TODO: Send email invitation using email service (SendGrid, Resend, etc.)
    // For now, we'll just log the invitation
    console.log(
      `Sending invitation to ${email} for cohort ${cohort.name} with ${permission} permission`
    );

    // TODO: In production, send actual email:
    // await sendEmail({
    //   to: email,
    //   subject: `You've been invited to collaborate on ${cohort.name}`,
    //   body: `
    //     You've been invited to collaborate on the Strategy Cohort "${cohort.name}".
    //     Permission level: ${permission}
    //     Click here to accept: ${baseUrl}/shared/strategy-cohorts/${cohortId}?invite=${inviteToken}
    //   `,
    // });

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      email,
      permission,
      cohortName: cohort.name,
    });
  } catch (error) {
    console.error("Failed to send email invitation:", error);

    return NextResponse.json(
      {
        error: "Failed to send invitation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

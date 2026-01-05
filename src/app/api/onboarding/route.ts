/**
 * Onboarding API Endpoint
 * Handles new user onboarding and profile setup
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// Webhook configuration - can be set via environment variables
const N8N_WEBHOOK_URL = process.env["N8N_ONBOARDING_WEBHOOK_URL"];

interface OnboardingData {
  companyName: string;
  industry: string;
  companyStage: string;
  operationRegion: string;
  operationScope: "local" | "national" | "international";
  challenges: string[];
  competitors: string[];
  goals: string;
  teamSize?: string;
  hasExistingData: boolean | null;
  targetRegions?: string;
  needsRegionalIntel?: boolean | null;
  completedAt: string;
}

/**
 * POST /api/onboarding
 * Creates a new user profile with onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    const data: OnboardingData = await request.json();

    // Validate required fields
    if (!data.companyName || !data.industry || !data.companyStage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a temporary user ID for demo purposes
    // In production, this would integrate with NextAuth
    const tempEmail = `demo-${Date.now()}@refleqt.app`;
    const tempName = data.companyName;

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: tempEmail,
          name: tempName,
        },
      });

      // Create user profile with onboarding data
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          companyName: data.companyName,
          industry: data.industry,
          businessChallenge: data.challenges.join("; "),
          obsessionScore: 5.0, // Starting score
          companyStage: data.companyStage,
          operationRegion: data.operationRegion,
          operationScope: data.operationScope,
          teamSize: data.teamSize ?? null,
          hasExistingData: data.hasExistingData ?? null,
          targetRegions: data.targetRegions ?? null,
          needsRegionalIntel: data.needsRegionalIntel ?? null,
          goals: data.goals,
          onboardingCompletedAt: new Date(),
        },
      });

      // Create competitors
      const competitorPromises = data.competitors
        .filter((c) => c.trim() !== "")
        .map((name) =>
          tx.competitor.create({
            data: {
              userId: user.id,
              name: name,
            },
          })
        );
      await Promise.all(competitorPromises);

      return { user, profile };
    });

    // Send to n8n webhook if configured
    if (N8N_WEBHOOK_URL) {
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "onboarding_complete",
            userId: result.user.id,
            ...data,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (webhookError) {
        // Log but don't fail the request if webhook fails
        console.error("n8n webhook error:", webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      message: "Onboarding completed successfully",
      profile: {
        companyName: data.companyName,
        industry: data.industry,
        stage: data.companyStage,
        region: data.operationRegion,
        competitorsTracked: data.competitors.filter((c) => c.trim() !== "")
          .length,
        challenges: data.challenges.length,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding
 * Check onboarding status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            competitors: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { completed: false, message: "Onboarding not completed" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      completed: true,
      profile: {
        companyName: profile.companyName,
        industry: profile.industry,
        businessChallenge: profile.businessChallenge,
        obsessionScore: profile.obsessionScore,
        competitors: profile.user.competitors.map((c) => c.name),
      },
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}

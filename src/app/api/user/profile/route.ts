/**
 * User Profile API
 * GET /api/user/profile - Get current user's profile
 * PUT /api/user/profile - Update user profile
 *
 * Backend Parameters:
 * - Uses test user ID for now (TODO: integrate NextAuth session)
 * - Returns User + UserProfile from Prisma
 * - Validates input data
 * - Handles errors gracefully
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCached, invalidateUser } from "@/lib/cache/redis-cache";
import { CacheKeys, CacheTTL } from "@/lib/cache/cache-config";

// ============================================================================
// GET /api/user/profile
// Returns current user and their profile
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params or use test user ID
    const searchParams = request.nextUrl.searchParams;
    const userId =
      searchParams.get("userId") || "00000000-0000-0000-0000-000000000001";

    // Generate cache key
    const cacheKey = CacheKeys.userProfile(userId);

    // Fetch user with profile (with caching)
    const user = await getCached(
      cacheKey,
      async () => {
        return await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            profile: {
              select: {
                id: true,
                companyName: true,
                industry: true,
                businessChallenge: true,
                obsessionScore: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        });
      },
      CacheTTL.USER_PROFILE
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Create default profile if it doesn't exist
    if (!user.profile) {
      const newProfile = await prisma.userProfile.create({
        data: {
          userId,
          obsessionScore: 5.0, // Default obsession score
          companyName: "",
          industry: "",
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
          },
          profile: {
            ...newProfile,
            obsessionScore: Number(newProfile.obsessionScore),
            createdAt: newProfile.createdAt.toISOString(),
            updatedAt: newProfile.updatedAt.toISOString(),
          },
        },
      });
    }

    // Convert Decimal to number for JSON serialization
    const profileData = {
      ...user.profile,
      obsessionScore: Number(user.profile.obsessionScore),
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt.toISOString(),
        },
        profile: {
          ...profileData,
          createdAt: user.profile.createdAt.toISOString(),
          updatedAt: user.profile.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("[API] GET /api/user/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/user/profile
// Updates user profile
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from NextAuth session
    const userId = "00000000-0000-0000-0000-000000000001";

    // Parse request body
    const body = await request.json();

    // Validate allowed fields
    const allowedFields = [
      "companyName",
      "industry",
      "businessChallenge",
    ] as const;
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Validate companyName if provided
    if (
      "companyName" in updates &&
      (typeof updates["companyName"] !== "string" ||
        (updates["companyName"] as string).length < 1)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Company name must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Validate industry if provided
    if (
      "industry" in updates &&
      (typeof updates["industry"] !== "string" ||
        (updates["industry"] as string).length < 1)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Industry must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: updates,
      select: {
        id: true,
        companyName: true,
        industry: true,
        businessChallenge: true,
        obsessionScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate user cache
    await invalidateUser(userId);

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...updatedProfile,
          obsessionScore: Number(updatedProfile.obsessionScore),
          createdAt: updatedProfile.createdAt.toISOString(),
          updatedAt: updatedProfile.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("[API] PUT /api/user/profile error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 }
    );
  }
}

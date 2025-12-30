import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/research-swarm/templates
 * Get available swarm templates (system and user templates)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    // Fetch system templates (userId is null) and user's custom templates
    const templates = await prisma.swarmTemplate.findMany({
      where: {
        OR: [
          { userId: null }, // System templates
          ...(userId ? [{ userId, isPublic: true }] : []), // User's public templates
        ],
      },
      orderBy: [
        { userId: "asc" }, // System templates first (null userId)
        { usageCount: "desc" }, // Then by popularity
      ],
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        query: true,
        swarmType: true,
        usageCount: true,
        isPublic: true,
      },
    });

    return NextResponse.json({
      success: true,
      templates: templates.map(
        (template: {
          id: string;
          title: string;
          description: string;
          icon: string;
          query: string;
          swarmType: string;
          usageCount: number;
          isPublic: boolean;
        }) => ({
          id: template.id,
          title: template.title,
          description: template.description,
          icon: template.icon,
          query: template.query,
          type: template.swarmType,
          usageCount: template.usageCount,
          isSystem: !template.isPublic,
        })
      ),
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch templates",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/research-swarm/templates
 * Create a new custom template
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, title, description, icon, query, swarmType, isPublic } =
      body;

    // Validate
    if (!userId || !title || !query || !swarmType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const template = await prisma.swarmTemplate.create({
      data: {
        userId,
        title,
        description: description || "",
        icon: icon || "🔬",
        query,
        swarmType,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        icon: template.icon,
        query: template.query,
        type: template.swarmType,
      },
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create template",
      },
      { status: 500 }
    );
  }
}

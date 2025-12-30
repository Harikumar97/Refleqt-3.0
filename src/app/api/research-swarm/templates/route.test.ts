/**
 * Test Suite for Research Swarm Templates API
 * Tests /api/research-swarm/templates endpoint (GET and POST)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { type NextRequest } from "next/server";
import { GET, POST } from "@/app/api/research-swarm/templates/route";
import prisma from "@/lib/db/prisma";

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  default: {
    swarmTemplate: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("GET /api/research-swarm/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return system templates", async () => {
    const mockTemplates = [
      {
        id: "template-1",
        title: "Competitor Analysis",
        description: "Analyze top competitors",
        icon: "🎯",
        query: "Compare features against competitors",
        swarmType: "competitive",
        usageCount: 10,
        isPublic: false,
      },
      {
        id: "template-2",
        title: "Market Research",
        description: "Research market opportunities",
        icon: "📈",
        query: "Identify market trends and opportunities",
        swarmType: "market",
        usageCount: 5,
        isPublic: false,
      },
    ];

    (
      prisma.swarmTemplate.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockTemplates);

    const url = new URL("http://localhost:3000/api/research-swarm/templates");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.templates).toHaveLength(2);
    expect(data.templates[0].title).toBe("Competitor Analysis");
    expect(data.templates[0].isSystem).toBe(true);
  });

  it("should include user templates when userId provided", async () => {
    const mockTemplates = [
      {
        id: "sys-1",
        title: "System Template",
        description: "Built-in template",
        icon: "🔧",
        query: "System query",
        swarmType: "competitive",
        usageCount: 20,
        isPublic: false,
      },
      {
        id: "user-1",
        title: "User Template",
        description: "Custom template",
        icon: "👤",
        query: "User query",
        swarmType: "market",
        usageCount: 3,
        isPublic: true,
      },
    ];

    (
      prisma.swarmTemplate.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockTemplates);

    const url = new URL("http://localhost:3000/api/research-swarm/templates");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.templates).toHaveLength(2);
  });

  it("should handle empty template list", async () => {
    (
      prisma.swarmTemplate.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const url = new URL("http://localhost:3000/api/research-swarm/templates");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.templates).toEqual([]);
  });

  it("should handle database errors gracefully", async () => {
    (
      prisma.swarmTemplate.findMany as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("Database error"));

    const url = new URL("http://localhost:3000/api/research-swarm/templates");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch templates");
  });
});

describe("POST /api/research-swarm/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create custom template with valid input", async () => {
    const mockTemplate = {
      id: "template-123",
      userId: "user-123",
      title: "Custom Template",
      description: "My custom template",
      icon: "🚀",
      query: "Custom research query",
      swarmType: "product",
      isPublic: true,
    };

    (prisma.swarmTemplate.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockTemplate
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Custom Template",
          description: "My custom template",
          icon: "🚀",
          query: "Custom research query",
          swarmType: "product",
          isPublic: true,
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.template.title).toBe("Custom Template");
    expect(data.template.type).toBe("product");
  });

  it("should use default icon when not provided", async () => {
    const mockTemplate = {
      id: "template-123",
      userId: "user-123",
      title: "Template",
      description: "Description",
      icon: "🔬",
      query: "Query",
      swarmType: "market",
      isPublic: false,
    };

    (prisma.swarmTemplate.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockTemplate
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Template",
          query: "Query",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    await POST(request);

    expect(prisma.swarmTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        icon: "🔬",
      }),
    });
  });

  it("should use empty description when not provided", async () => {
    const mockTemplate = {
      id: "template-123",
      userId: "user-123",
      title: "Template",
      description: "",
      icon: "🔬",
      query: "Query",
      swarmType: "market",
      isPublic: false,
    };

    (prisma.swarmTemplate.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockTemplate
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Template",
          query: "Query",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    await POST(request);

    expect(prisma.swarmTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: "",
      }),
    });
  });

  it("should default isPublic to false when not provided", async () => {
    const mockTemplate = {
      id: "template-123",
      userId: "user-123",
      title: "Template",
      description: "",
      icon: "🔬",
      query: "Query",
      swarmType: "market",
      isPublic: false,
    };

    (prisma.swarmTemplate.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockTemplate
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Template",
          query: "Query",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    await POST(request);

    expect(prisma.swarmTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isPublic: false,
      }),
    });
  });

  it("should require userId", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Template",
          query: "Query",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Missing required fields");
  });

  it("should require title", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: "Query",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Missing required fields");
  });

  it("should require query", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Template",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Missing required fields");
  });

  it("should require swarmType", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Template",
          query: "Query",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Missing required fields");
  });

  it("should handle database errors gracefully", async () => {
    (prisma.swarmTemplate.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Database error")
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/templates",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          title: "Template",
          query: "Query",
          swarmType: "market",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to create template");
  });
});

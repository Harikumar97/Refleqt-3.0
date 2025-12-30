/**
 * Test Suite for Active Research Swarms List API
 * Tests /api/research-swarm/active endpoint
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { type NextRequest } from "next/server";
import { GET } from "@/app/api/research-swarm/active/route";
import prisma from "@/lib/db/prisma";

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  default: {
    researchSwarm: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/research-swarm/active", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return active swarms for user", async () => {
    const mockSwarms = [
      {
        id: "swarm-1",
        query: "Competitive analysis query",
        swarmType: "competitive",
        status: "running",
        progressPct: 50,
        timeRemaining: "2 min",
        createdAt: new Date("2025-01-01T10:00:00Z"),
        startedAt: new Date("2025-01-01T10:00:10Z"),
        completedAt: null,
        executionTimeMs: null,
      },
      {
        id: "swarm-2",
        query: "Market research query",
        swarmType: "market",
        status: "completed",
        progressPct: 100,
        timeRemaining: null,
        createdAt: new Date("2025-01-01T09:00:00Z"),
        startedAt: new Date("2025-01-01T09:00:05Z"),
        completedAt: new Date("2025-01-01T09:05:00Z"),
        executionTimeMs: 295000,
      },
    ];

    (
      prisma.researchSwarm.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSwarms);

    const url = new URL("http://localhost:3000/api/research-swarm/active");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.swarms).toHaveLength(2);
    expect(data.swarms[0].id).toBe("swarm-1");
    expect(data.swarms[0].type).toBe("competitive");
    expect(data.swarms[0].typeName).toBe("Competitive Analysis");
    expect(data.swarms[0].progress).toBe(50);
    expect(data.swarms[1].typeName).toBe("Market Research");
  });

  it("should require userId", async () => {
    const url = new URL("http://localhost:3000/api/research-swarm/active");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("userId is required");
  });

  it("should limit results to 20 swarms", async () => {
    (
      prisma.researchSwarm.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const url = new URL("http://localhost:3000/api/research-swarm/active");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    await GET(request);

    expect(prisma.researchSwarm.findMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: expect.any(Object),
    });
  });

  it("should order swarms by creation date descending", async () => {
    (
      prisma.researchSwarm.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const url = new URL("http://localhost:3000/api/research-swarm/active");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    await GET(request);

    expect(prisma.researchSwarm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("should map all swarm types to display names", async () => {
    const mockSwarms = [
      {
        id: "1",
        query: "Test 1",
        swarmType: "competitive",
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        executionTimeMs: null,
      },
      {
        id: "2",
        query: "Test 2",
        swarmType: "market",
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        executionTimeMs: null,
      },
      {
        id: "3",
        query: "Test 3",
        swarmType: "customer",
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        executionTimeMs: null,
      },
      {
        id: "4",
        query: "Test 4",
        swarmType: "product",
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        executionTimeMs: null,
      },
    ];

    (
      prisma.researchSwarm.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockSwarms);

    const url = new URL("http://localhost:3000/api/research-swarm/active");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(data.swarms[0].typeName).toBe("Competitive Analysis");
    expect(data.swarms[1].typeName).toBe("Market Research");
    expect(data.swarms[2].typeName).toBe("Customer Intelligence");
    expect(data.swarms[3].typeName).toBe("Product Research");
  });

  it("should return empty array when no swarms exist", async () => {
    (
      prisma.researchSwarm.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const url = new URL("http://localhost:3000/api/research-swarm/active");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.swarms).toEqual([]);
  });

  it("should handle database errors gracefully", async () => {
    (
      prisma.researchSwarm.findMany as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("Database connection failed"));

    const url = new URL("http://localhost:3000/api/research-swarm/active");
    url.searchParams.set("userId", "user-123");

    const request = new Request(url.toString(), {
      method: "GET",
    }) as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database connection failed");
  });
});

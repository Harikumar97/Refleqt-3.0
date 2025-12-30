/**
 * Test Suite for Research Swarm Creation API
 * Tests /api/research-swarm/create endpoint
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { type NextRequest } from "next/server";
import { POST } from "@/app/api/research-swarm/create/route";
import prisma from "@/lib/db/prisma";

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  default: {
    researchSwarm: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("POST /api/research-swarm/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create swarm with valid input", async () => {
    const mockSwarm = {
      id: "swarm-123",
      goalId: null,
      userId: "user-123",
      query: "Analyze top 5 competitors in AI agent space",
      swarmType: "competitive",
      swarmSize: "small",
      status: "pending",
      progressPct: 0,
      timeRemaining: "5 min",
      mcpChainUsed: null,
      agentResults: null,
      synthesisApplied: false,
      executionTimeMs: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date("2024-01-01T10:00:00Z"),
    };

    (prisma.researchSwarm.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockSwarm
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: "Analyze top 5 competitors in AI agent space",
          swarmType: "competitive",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("swarm-123");
    expect(data.data.status).toBe("pending");
    expect(data.data.type).toBe("competitive");
    expect(prisma.researchSwarm.create).toHaveBeenCalled();
  });

  it("should reject query shorter than 10 characters", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: "short",
          swarmType: "competitive",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Query must be between 10 and 500 characters");
  });

  it("should reject query longer than 500 characters", async () => {
    const longQuery = "a".repeat(501);

    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: longQuery,
          swarmType: "competitive",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Query must be between 10 and 500 characters");
  });

  it("should reject invalid swarm type", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: "This is a valid query with sufficient length",
          swarmType: "invalid_type",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid swarmType");
  });

  it("should validate all swarm types", async () => {
    const validTypes = ["competitive", "market", "customer", "product"];

    for (const type of validTypes) {
      const mockSwarm = {
        id: `swarm-${type}`,
        goalId: null,
        userId: "user-123",
        query: "Valid query for testing swarm type",
        swarmType: type,
        swarmSize: "small",
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
        mcpChainUsed: null,
        agentResults: null,
        synthesisApplied: false,
        executionTimeMs: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
      };

      (
        prisma.researchSwarm.create as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockSwarm);

      const request = new Request(
        "http://localhost:3000/api/research-swarm/create",
        {
          method: "POST",
          body: JSON.stringify({
            userId: "user-123",
            query: "Valid query for testing swarm type",
            swarmType: type,
          }),
        }
      ) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.type).toBe(type);
    }
  });

  it("should require userId", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          query: "Valid query without userId",
          swarmType: "competitive",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("userId is required");
  });

  it("should require query", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          swarmType: "competitive",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("query is required");
  });

  it("should require swarmType", async () => {
    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: "Valid query without swarmType",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("swarmType is required");
  });

  it("should handle database errors gracefully", async () => {
    (prisma.researchSwarm.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new Request(
      "http://localhost:3000/api/research-swarm/create",
      {
        method: "POST",
        body: JSON.stringify({
          userId: "user-123",
          query: "Valid query that will fail",
          swarmType: "competitive",
        }),
      }
    ) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database connection failed");
  });
});

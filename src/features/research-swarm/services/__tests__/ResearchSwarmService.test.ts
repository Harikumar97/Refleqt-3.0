/**
 * ResearchSwarmService Unit Tests
 *
 * Purpose: Test business logic for research swarm operations
 *
 * Test Coverage:
 * - createSwarm: Validation, DTO transformation, repository interaction
 * - getActiveSwarms: User filtering, pagination, mapping
 * - getSwarmResults: Ownership verification, completion check, result transformation
 * - getSwarmStats: Statistics calculation
 * - Error handling: Validation errors, not found errors, ownership errors
 *
 * Mocking Strategy:
 * - Mock SwarmRepository to isolate service logic from database
 * - Test validation without database dependency
 * - Verify repository calls with correct parameters
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResearchSwarmService } from "../ResearchSwarmService";
import type { CreateSwarmDto } from "../../types/dtos";
import type { ResearchSwarm } from "@prisma/client";

describe("ResearchSwarmService", () => {
  let service: ResearchSwarmService;
  let mockRepository: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock repository
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findActiveByUserId: vi.fn(),
      findWithResultsByUserId: vi.fn(),
      getStatsByUserId: vi.fn(),
      findByUserIdAndStatus: vi.fn(),
    };

    // Create service with mocked repository
    service = new ResearchSwarmService(mockRepository);
  });

  describe("createSwarm", () => {
    it("should create a swarm with valid input", async () => {
      const dto: CreateSwarmDto = {
        userId: "user-123",
        query: "Analyze competitor pricing strategies",
        swarmType: "competitive",
      };

      const mockSwarm: ResearchSwarm = {
        id: "swarm-123",
        goalId: null,
        userId: "user-123",
        query: "Analyze competitor pricing strategies",
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
        createdAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockSwarm);

      const result = await service.createSwarm(dto);

      expect(result).toMatchObject({
        id: "swarm-123",
        query: "Analyze competitor pricing strategies",
        type: "competitive",
        status: "pending",
        progress: 0,
      });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          query: dto.query,
          swarmType: dto.swarmType,
          status: "pending",
          progressPct: 0,
        })
      );
    });

    it("should throw error if userId is missing", async () => {
      const dto: CreateSwarmDto = {
        userId: "",
        query: "Valid query here",
        swarmType: "competitive",
      };

      await expect(service.createSwarm(dto)).rejects.toThrow(
        "userId is required"
      );
    });

    it("should throw error if query is too short", async () => {
      const dto: CreateSwarmDto = {
        userId: "user-123",
        query: "Short",
        swarmType: "competitive",
      };

      await expect(service.createSwarm(dto)).rejects.toThrow(
        "Query must be between 10 and 500 characters"
      );
    });

    it("should throw error if query is too long", async () => {
      const dto: CreateSwarmDto = {
        userId: "user-123",
        query: "a".repeat(501),
        swarmType: "competitive",
      };

      await expect(service.createSwarm(dto)).rejects.toThrow(
        "Query must be between 10 and 500 characters"
      );
    });

    it("should throw error if swarmType is invalid", async () => {
      const dto: CreateSwarmDto = {
        userId: "user-123",
        query: "Valid query here",
        swarmType: "invalid" as any,
      };

      await expect(service.createSwarm(dto)).rejects.toThrow(
        "Invalid swarmType"
      );
    });

    it("should create swarm with custom swarmSize", async () => {
      const dto: CreateSwarmDto = {
        userId: "user-123",
        query: "Analyze market trends",
        swarmType: "market",
        swarmSize: "large",
      };

      const mockSwarm: ResearchSwarm = {
        id: "swarm-123",
        goalId: null,
        userId: "user-123",
        query: "Analyze market trends",
        swarmType: "market",
        swarmSize: "large",
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

      mockRepository.create.mockResolvedValue(mockSwarm);

      const result = await service.createSwarm(dto);

      expect(result.id).toBe("swarm-123");
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          swarmSize: "large",
        })
      );
    });
  });

  describe("getActiveSwarms", () => {
    it("should return active swarms for a user", async () => {
      const mockSwarms: ResearchSwarm[] = [
        {
          id: "swarm-1",
          goalId: null,
          userId: "user-123",
          query: "Query 1",
          swarmType: "competitive",
          swarmSize: "small",
          status: "completed",
          progressPct: 100,
          timeRemaining: null,
          mcpChainUsed: null,
          agentResults: null,
          synthesisApplied: false,
          executionTimeMs: 5000,
          startedAt: new Date(),
          completedAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockRepository.findActiveByUserId.mockResolvedValue(mockSwarms);

      const result = await service.getActiveSwarms("user-123", 20);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "swarm-1",
        query: "Query 1",
        type: "competitive",
        typeName: "Competitive Analysis",
      });

      expect(mockRepository.findActiveByUserId).toHaveBeenCalledWith(
        "user-123",
        20
      );
    });

    it("should throw error if userId is missing", async () => {
      await expect(service.getActiveSwarms("", 20)).rejects.toThrow(
        "userId is required"
      );
    });

    it("should use default limit if not provided", async () => {
      mockRepository.findActiveByUserId.mockResolvedValue([]);

      await service.getActiveSwarms("user-123");

      expect(mockRepository.findActiveByUserId).toHaveBeenCalledWith(
        "user-123",
        20
      );
    });
  });

  describe("getSwarmResults", () => {
    it("should return results for a completed swarm", async () => {
      const mockSwarm = {
        id: "swarm-123",
        userId: "user-123",
        query: "Test query",
        swarmType: "competitive",
        swarmSize: "small",
        status: "completed",
        completedAt: new Date(),
        executionTimeMs: 5000,
        findings: [
          {
            id: "finding-1",
            swarmId: "swarm-123",
            agentId: "agent-1",
            findingType: "insight",
            title: "Finding 1",
            content: "Content 1",
            confidenceScore: null,
            sources: ["source1.com"],
            createdAt: new Date(),
          },
        ],
        recommendations: [
          {
            id: "rec-1",
            swarmId: "swarm-123",
            action: "Action 1",
            impact: "High impact",
            priority: "HIGH",
            timeline: "1 month",
            effort: "Medium",
            revenueImpact: "$10k",
            createdAt: new Date(),
          },
        ],
      };

      mockRepository.findWithResultsByUserId.mockResolvedValue(mockSwarm);

      const result = await service.getSwarmResults("swarm-123", "user-123");

      expect(result).toMatchObject({
        swarmId: "swarm-123",
        query: "Test query",
        type: "competitive",
        status: "completed",
      });

      expect(result.keyFindings).toHaveLength(1);
      expect(result.recommendations).toHaveLength(1);
      expect(result.sources).toContain("source1.com");
    });

    it("should throw error if swarm not found", async () => {
      mockRepository.findWithResultsByUserId.mockResolvedValue(null);

      await expect(
        service.getSwarmResults("swarm-123", "user-123")
      ).rejects.toThrow("Swarm not found or unauthorized");
    });

    it("should throw error if swarm not completed", async () => {
      const mockSwarm = {
        id: "swarm-123",
        userId: "user-123",
        status: "running",
        findings: [],
        recommendations: [],
      };

      mockRepository.findWithResultsByUserId.mockResolvedValue(mockSwarm);

      await expect(
        service.getSwarmResults("swarm-123", "user-123")
      ).rejects.toThrow("Swarm is not yet completed");
    });
  });

  describe("getSwarmStats", () => {
    it("should return statistics for a user", async () => {
      const mockStats = {
        total: 10,
        completed: 7,
        pending: 2,
        failed: 1,
        byType: {
          competitive: 5,
          market: 3,
          customer: 2,
        },
      };

      const mockCompletedSwarms: ResearchSwarm[] = [
        {
          id: "swarm-1",
          executionTimeMs: 5000,
        } as ResearchSwarm,
        {
          id: "swarm-2",
          executionTimeMs: 3000,
        } as ResearchSwarm,
      ];

      mockRepository.getStatsByUserId.mockResolvedValue(mockStats);
      mockRepository.findByUserIdAndStatus.mockResolvedValue(
        mockCompletedSwarms
      );

      const result = await service.getSwarmStats("user-123");

      expect(result).toMatchObject({
        totalSwarms: 10,
        completedSwarms: 7,
        pendingSwarms: 2,
        failedSwarms: 1,
        averageExecutionTimeMs: 4000,
      });
    });

    it("should handle zero completed swarms", async () => {
      const mockStats = {
        total: 2,
        completed: 0,
        pending: 2,
        failed: 0,
        byType: {},
      };

      mockRepository.getStatsByUserId.mockResolvedValue(mockStats);
      mockRepository.findByUserIdAndStatus.mockResolvedValue([]);

      const result = await service.getSwarmStats("user-123");

      expect(result.totalSwarms).toBe(2);
      expect(result.averageExecutionTimeMs).toBe(0);
    });
  });
});

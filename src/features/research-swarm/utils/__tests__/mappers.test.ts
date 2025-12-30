/**
 * Mapper Function Unit Tests
 *
 * Purpose: Test data transformation from Prisma models to DTOs
 *
 * Test Coverage:
 * - toSwarmListItemDto: Transforms ResearchSwarm to list item format
 * - toRecommendationDto: Transforms SwarmRecommendation to DTO
 * - toSwarmResultDto: Transforms ResearchSwarm with relations to result DTO
 * - getTypeDisplayName: Returns user-friendly type names
 *
 * Testing Strategy:
 * - Test each mapper function independently
 * - Verify all fields are correctly mapped
 * - Test edge cases (null values, empty arrays)
 * - Ensure type safety and consistency
 */

import { describe, it, expect } from "vitest";
import {
  toSwarmListItemDto,
  toRecommendationDto,
  toSwarmResultDto,
  getTypeDisplayName,
} from "../mappers";
import type {
  ResearchSwarm,
  SwarmFinding,
  SwarmRecommendation,
} from "@prisma/client";

describe("Mappers", () => {
  describe("getTypeDisplayName", () => {
    it("should return correct display names for all types", () => {
      expect(getTypeDisplayName("competitive")).toBe("Competitive Analysis");
      expect(getTypeDisplayName("market")).toBe("Market Research");
      expect(getTypeDisplayName("customer")).toBe("Customer Intelligence");
      expect(getTypeDisplayName("product")).toBe("Product Research");
    });
  });

  describe("toSwarmListItemDto", () => {
    it("should transform ResearchSwarm to SwarmListItemDto", () => {
      const swarm: ResearchSwarm = {
        id: "swarm-123",
        goalId: null,
        userId: "user-123",
        query: "Test query",
        swarmType: "competitive",
        swarmSize: "small",
        status: "completed",
        progressPct: 100,
        timeRemaining: null,
        mcpChainUsed: null,
        agentResults: null,
        synthesisApplied: false,
        executionTimeMs: 5000,
        startedAt: new Date("2024-01-01T10:00:00Z"),
        completedAt: new Date("2024-01-01T10:05:00Z"),
        createdAt: new Date("2024-01-01T09:55:00Z"),
      };

      const result = toSwarmListItemDto(swarm);

      expect(result).toMatchObject({
        id: "swarm-123",
        query: "Test query",
        type: "competitive",
        typeName: "Competitive Analysis",
        status: "completed",
        progress: 100,
        timeRemaining: null,
      });

      expect(result.timestamp).toBe(swarm.createdAt.getTime());
      expect(result.createdAt).toEqual(swarm.createdAt);
      expect(result.executionTimeMs).toBe(5000);
    });

    it("should handle pending swarm with timeRemaining", () => {
      const swarm: ResearchSwarm = {
        id: "swarm-456",
        goalId: null,
        userId: "user-123",
        query: "Pending query",
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
        createdAt: new Date("2024-01-01T10:00:00Z"),
      };

      const result = toSwarmListItemDto(swarm);

      expect(result).toMatchObject({
        status: "pending",
        progress: 0,
        timeRemaining: "5 min",
        typeName: "Market Research",
      });
    });
  });

  describe("toRecommendationDto", () => {
    it("should transform SwarmRecommendation to RecommendationDto", () => {
      const recommendation: SwarmRecommendation = {
        id: "rec-123",
        swarmId: "swarm-123",
        action: "Implement new pricing strategy",
        impact: "Increase revenue by 15%",
        priority: "HIGH",
        timeline: "3 months",
        effort: "Medium",
        revenueImpact: "$50k",
        createdAt: new Date(),
      };

      const result = toRecommendationDto(recommendation);

      expect(result).toEqual({
        action: "Implement new pricing strategy",
        impact: "Increase revenue by 15%",
        priority: "HIGH",
        timeline: "3 months",
        effort: "Medium",
        revenueImpact: "$50k",
      });
    });

    it("should handle null revenueImpact", () => {
      const recommendation: SwarmRecommendation = {
        id: "rec-456",
        swarmId: "swarm-123",
        action: "Test action",
        impact: "Test impact",
        priority: "MEDIUM",
        timeline: "1 month",
        effort: "Low",
        revenueImpact: null,
        createdAt: new Date(),
      };

      const result = toRecommendationDto(recommendation);

      expect(result).toEqual({
        action: "Test action",
        impact: "Test impact",
        priority: "MEDIUM",
        timeline: "1 month",
        effort: "Low",
      });

      // Ensure revenueImpact is not present (not just undefined)
      expect("revenueImpact" in result).toBe(false);
    });
  });

  describe("toSwarmResultDto", () => {
    it("should transform ResearchSwarm with relations to SwarmResultDto", () => {
      const swarm = {
        id: "swarm-123",
        goalId: null,
        userId: "user-123",
        query: "Test query",
        swarmType: "competitive",
        swarmSize: "small",
        status: "completed",
        progressPct: 100,
        timeRemaining: null,
        mcpChainUsed: null,
        agentResults: null,
        synthesisApplied: false,
        executionTimeMs: 5000,
        startedAt: new Date("2024-01-01T10:00:00Z"),
        completedAt: new Date("2024-01-01T10:05:00Z"),
        createdAt: new Date("2024-01-01T09:55:00Z"),
        findings: [
          {
            id: "finding-1",
            swarmId: "swarm-123",
            agentId: "agent-1",
            findingType: "insight",
            title: "Finding 1",
            content: "Content 1",
            confidenceScore: null,
            sources: ["source1.com", "source2.com"],
            createdAt: new Date(),
          },
          {
            id: "finding-2",
            swarmId: "swarm-123",
            agentId: "agent-2",
            findingType: "trend",
            title: "Finding 2",
            content: "Content 2",
            confidenceScore: null,
            sources: ["source2.com", "source3.com"],
            createdAt: new Date(),
          },
        ] as SwarmFinding[],
        recommendations: [
          {
            id: "rec-1",
            swarmId: "swarm-123",
            action: "Action 1",
            impact: "Impact 1",
            priority: "HIGH",
            timeline: "1 month",
            effort: "Medium",
            revenueImpact: "$10k",
            createdAt: new Date(),
          },
          {
            id: "rec-2",
            swarmId: "swarm-123",
            action: "Action 2",
            impact: "Impact 2",
            priority: "MEDIUM",
            timeline: "2 months",
            effort: "High",
            revenueImpact: null,
            createdAt: new Date(),
          },
        ] as SwarmRecommendation[],
      } as ResearchSwarm & {
        findings: SwarmFinding[];
        recommendations: SwarmRecommendation[];
      };

      const result = toSwarmResultDto(swarm);

      expect(result).toMatchObject({
        swarmId: "swarm-123",
        query: "Test query",
        type: "competitive",
        status: "completed",
        executionTimeMs: 5000,
      });

      // Check key findings
      expect(result.keyFindings).toEqual(["Content 1", "Content 2"]);

      // Check recommendations
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0]).toMatchObject({
        action: "Action 1",
        priority: "HIGH",
        revenueImpact: "$10k",
      });

      // Check unique sources
      expect(result.sources).toHaveLength(3);
      expect(result.sources).toContain("source1.com");
      expect(result.sources).toContain("source2.com");
      expect(result.sources).toContain("source3.com");

      // Check metadata
      expect(result.metadata).toMatchObject({
        swarmSize: "small",
        agentCount: 2,
        findingsCount: 2,
        recommendationsCount: 2,
      });
    });

    it("should handle empty findings and recommendations", () => {
      const swarm = {
        id: "swarm-456",
        goalId: null,
        userId: "user-123",
        query: "Empty query",
        swarmType: "market",
        swarmSize: "large",
        status: "completed",
        progressPct: 100,
        timeRemaining: null,
        mcpChainUsed: null,
        agentResults: null,
        synthesisApplied: false,
        executionTimeMs: 1000,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        findings: [],
        recommendations: [],
      } as ResearchSwarm & {
        findings: SwarmFinding[];
        recommendations: SwarmRecommendation[];
      };

      const result = toSwarmResultDto(swarm);

      expect(result.keyFindings).toEqual([]);
      expect(result.recommendations).toEqual([]);
      expect(result.sources).toEqual([]);
      expect(result.metadata).toMatchObject({
        agentCount: 0,
        findingsCount: 0,
        recommendationsCount: 0,
      });
    });

    it("should handle findings without sources", () => {
      const swarm = {
        id: "swarm-789",
        goalId: null,
        userId: "user-123",
        query: "Test query",
        swarmType: "customer",
        swarmSize: "small",
        status: "completed",
        progressPct: 100,
        timeRemaining: null,
        mcpChainUsed: null,
        agentResults: null,
        synthesisApplied: false,
        executionTimeMs: 2000,
        startedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        findings: [
          {
            id: "finding-1",
            content: "Content 1",
            sources: null,
          },
          {
            id: "finding-2",
            content: "Content 2",
            sources: [],
          },
        ] as SwarmFinding[],
        recommendations: [],
      } as ResearchSwarm & {
        findings: SwarmFinding[];
        recommendations: SwarmRecommendation[];
      };

      const result = toSwarmResultDto(swarm);

      expect(result.sources).toEqual([]);
      expect(result.keyFindings).toEqual(["Content 1", "Content 2"]);
    });
  });
});

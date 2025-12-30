/**
 * Research Swarm Service
 *
 * Purpose: Business logic layer for research swarm operations
 *
 * Features:
 * - Extends BaseService for common validation utilities
 * - Validates business rules (query length, swarm type, ownership)
 * - Orchestrates repository operations
 * - Transforms data using mappers
 *
 * Usage:
 * ```typescript
 * // In API route
 * const service = new ResearchSwarmService();
 *
 * const dto: CreateSwarmDto = {
 *   userId: session.user.id,
 *   query: "Analyze competitor pricing",
 *   swarmType: "competitive"
 * };
 *
 * const swarm = await service.createSwarm(dto);
 * return apiResponse.success(swarm);
 * ```
 *
 * Benefits:
 * - Centralizes business logic
 * - Consistent validation across API routes
 * - Testable without database (mock repository)
 * - Clear separation of concerns
 */

import { BaseService } from "@/services/BaseService";
import { SwarmRepository } from "../repositories/SwarmRepository";
import { toSwarmListItemDto, toSwarmResultDto } from "../utils/mappers";
import type {
  CreateSwarmDto,
  SwarmListItemDto,
  SwarmResultDto,
  SwarmStatsDto,
} from "../types/dtos";
import { assert } from "@/utils/assert";

/**
 * Service for research swarm business logic
 */
export class ResearchSwarmService extends BaseService {
  private swarmRepository: SwarmRepository;

  constructor(swarmRepository?: SwarmRepository) {
    super();
    this.swarmRepository = swarmRepository || new SwarmRepository();
  }

  /**
   * Create a new research swarm
   * @param dto - CreateSwarmDto with userId, query, swarmType
   * @returns Created swarm as DTO
   */
  async createSwarm(dto: CreateSwarmDto): Promise<SwarmListItemDto> {
    try {
      // Validate userId
      this.validateUserId(dto.userId);

      // Validate query
      assert(!!dto.query, "query is required");
      this.validateLength(dto.query, 10, 500, "Query");

      // Validate swarm type
      assert(!!dto.swarmType, "swarmType is required");
      const validTypes: readonly string[] = [
        "competitive",
        "market",
        "customer",
        "product",
      ];
      this.validateEnum(dto.swarmType, validTypes, "swarmType");

      // Validate swarm size if provided
      if (dto.swarmSize) {
        const validSizes: readonly string[] = ["small", "large"];
        this.validateEnum(dto.swarmSize, validSizes, "swarmSize");
      }

      // Create swarm in database
      const swarm = await this.swarmRepository.create({
        user: {
          connect: { id: dto.userId },
        },
        query: dto.query,
        swarmType: dto.swarmType,
        swarmSize: dto.swarmSize || "small",
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
        ...(dto.goalId && {
          goal: {
            connect: { id: dto.goalId },
          },
        }),
      });

      this.logInfo(`Created swarm ${swarm.id} for user ${dto.userId}`);

      // TODO: Enqueue swarm execution job with BullMQ
      // await this.enqueueSwarmJob(swarm.id);

      return toSwarmListItemDto(swarm);
    } catch (error) {
      this.handleError(error, "Failed to create swarm");
    }
  }

  /**
   * Get active swarms for a user
   * @param userId - User ID
   * @param limit - Maximum number of swarms (default: 20, max: 100)
   * @returns Array of swarm list items
   */
  async getActiveSwarms(
    userId: string,
    limit?: number
  ): Promise<SwarmListItemDto[]> {
    try {
      // Validate userId
      this.validateUserId(userId);

      // Validate pagination
      const { limit: validatedLimit } = this.validatePagination(limit);

      // Fetch swarms from repository
      const swarms = await this.swarmRepository.findActiveByUserId(
        userId,
        validatedLimit
      );

      // Transform to DTOs
      return swarms.map(toSwarmListItemDto);
    } catch (error) {
      this.handleError(error, "Failed to fetch active swarms");
    }
  }

  /**
   * Get swarm results by ID
   * @param swarmId - Swarm UUID
   * @param userId - User ID for ownership verification
   * @returns Swarm results DTO
   */
  async getSwarmResults(
    swarmId: string,
    userId: string
  ): Promise<SwarmResultDto> {
    try {
      // Validate inputs
      this.validateUserId(userId);
      assert(!!swarmId, "swarmId is required");

      // Fetch swarm with results and verify ownership
      const swarm = await this.swarmRepository.findWithResultsByUserId(
        swarmId,
        userId
      );

      // Verify swarm exists and user has access
      assert(!!swarm, "Swarm not found or unauthorized");

      // Verify swarm is completed
      assert(
        swarm.status === "completed",
        "Swarm is not yet completed. Current status: " + swarm.status
      );

      this.logInfo(`Fetched results for swarm ${swarmId}`);

      // Transform to DTO
      return toSwarmResultDto(swarm);
    } catch (error) {
      this.handleError(error, "Failed to fetch swarm results");
    }
  }

  /**
   * Get swarm statistics for a user
   * @param userId - User ID
   * @returns Statistics DTO
   */
  async getSwarmStats(userId: string): Promise<SwarmStatsDto> {
    try {
      // Validate userId
      this.validateUserId(userId);

      // Get stats from repository
      const stats = await this.swarmRepository.getStatsByUserId(userId);

      // Get completed swarms to calculate average execution time
      const completedSwarms = await this.swarmRepository.findByUserIdAndStatus(
        userId,
        "completed",
        100
      );

      const totalExecutionTime = completedSwarms.reduce(
        (sum, swarm) => sum + (swarm.executionTimeMs || 0),
        0
      );
      const averageExecutionTimeMs =
        completedSwarms.length > 0
          ? Math.round(totalExecutionTime / completedSwarms.length)
          : 0;

      return {
        totalSwarms: stats.total,
        completedSwarms: stats.completed,
        pendingSwarms: stats.pending,
        failedSwarms: stats.failed,
        averageExecutionTimeMs,
        swarmsByType: stats.byType as Record<
          "competitive" | "market" | "customer" | "product",
          number
        >,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch swarm statistics");
    }
  }

  /**
   * Get swarm by ID (without results)
   * @param swarmId - Swarm UUID
   * @param userId - User ID for ownership verification
   * @returns Swarm list item DTO
   */
  async getSwarmById(
    swarmId: string,
    userId: string
  ): Promise<SwarmListItemDto> {
    try {
      // Validate inputs
      this.validateUserId(userId);
      assert(!!swarmId, "swarmId is required");

      // Fetch swarm
      const swarm = await this.swarmRepository.findById(swarmId);

      // Verify swarm exists
      assert(!!swarm, "Swarm not found");

      // Verify ownership
      this.validateOwnership(swarm.userId, userId);

      return toSwarmListItemDto(swarm);
    } catch (error) {
      this.handleError(error, "Failed to fetch swarm");
    }
  }

  /**
   * Update swarm status
   * @param swarmId - Swarm UUID
   * @param status - New status
   * @param userId - User ID for ownership verification
   * @param progressPct - Optional progress percentage
   * @returns Updated swarm DTO
   */
  async updateSwarmStatus(
    swarmId: string,
    status: string,
    userId: string,
    progressPct?: number
  ): Promise<SwarmListItemDto> {
    try {
      // Validate inputs
      this.validateUserId(userId);
      assert(!!swarmId, "swarmId is required");

      // Validate status
      const validStatuses: readonly string[] = [
        "pending",
        "running",
        "processing",
        "completed",
        "failed",
      ];
      this.validateEnum(status, validStatuses, "status");

      // Verify ownership
      const existingSwarm = await this.swarmRepository.findById(swarmId);
      assert(!!existingSwarm, "Swarm not found");
      this.validateOwnership(existingSwarm.userId, userId);

      // Update status
      const updatedSwarm = await this.swarmRepository.updateStatus(
        swarmId,
        status,
        progressPct
      );

      this.logInfo(
        `Updated swarm ${swarmId} status to ${status}`,
        progressPct ? { progressPct } : undefined
      );

      return toSwarmListItemDto(updatedSwarm);
    } catch (error) {
      this.handleError(error, "Failed to update swarm status");
    }
  }

  /**
   * Delete a swarm
   * @param swarmId - Swarm UUID
   * @param userId - User ID for ownership verification
   */
  async deleteSwarm(swarmId: string, userId: string): Promise<void> {
    try {
      // Validate inputs
      this.validateUserId(userId);
      assert(!!swarmId, "swarmId is required");

      // Verify ownership
      const swarm = await this.swarmRepository.findById(swarmId);
      assert(!!swarm, "Swarm not found");
      this.validateOwnership(swarm.userId, userId);

      // Delete swarm (cascade will delete findings and recommendations)
      await this.swarmRepository.delete(swarmId);

      this.logInfo(`Deleted swarm ${swarmId}`);
    } catch (error) {
      this.handleError(error, "Failed to delete swarm");
    }
  }
}

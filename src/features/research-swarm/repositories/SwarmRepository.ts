/**
 * Swarm Repository
 *
 * Purpose: Data access layer for ResearchSwarm operations
 *
 * Features:
 * - Extends BaseRepository for common CRUD operations
 * - Feature-specific queries (findActiveByUserId, findWithResults)
 * - Type-safe with Prisma types
 * - Centralizes all database access for research swarms
 *
 * Usage:
 * ```typescript
 * const swarmRepository = new SwarmRepository();
 *
 * // Get active swarms for a user
 * const swarms = await swarmRepository.findActiveByUserId(userId, 20);
 *
 * // Get swarm with all findings and recommendations
 * const swarm = await swarmRepository.findWithResults(swarmId);
 * ```
 *
 * Benefits:
 * - DRY - Inherits common operations from BaseRepository
 * - Testable - Easy to mock for service layer tests
 * - Maintainable - All data access in one place
 * - Type-safe - Leverages Prisma types
 */

import { BaseRepository } from "@/repositories/BaseRepository";
import prisma from "@/lib/db/prisma";
import type {
  ResearchSwarm,
  Prisma,
  SwarmFinding,
  SwarmRecommendation,
} from "@prisma/client";

/**
 * Type for swarm with all related data (findings + recommendations)
 */
export type SwarmWithResults = ResearchSwarm & {
  findings: SwarmFinding[];
  recommendations: SwarmRecommendation[];
};

/**
 * Repository for ResearchSwarm operations
 */
export class SwarmRepository extends BaseRepository<
  ResearchSwarm,
  Prisma.ResearchSwarmCreateInput,
  Prisma.ResearchSwarmUpdateInput
> {
  protected get model() {
    return prisma.researchSwarm;
  }

  /**
   * Find active swarms for a user, ordered by creation date
   * @param userId - User ID
   * @param limit - Maximum number of swarms to return (default: 20)
   * @returns Array of swarms
   */
  async findActiveByUserId(
    userId: string,
    limit: number = 20
  ): Promise<ResearchSwarm[]> {
    return await this.model.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  /**
   * Find swarm with all findings and recommendations
   * @param id - Swarm UUID
   * @returns Swarm with relations or null
   */
  async findWithResults(id: string): Promise<SwarmWithResults | null> {
    return await this.model.findUnique({
      where: { id },
      include: {
        findings: {
          orderBy: {
            createdAt: "asc",
          },
        },
        recommendations: {
          orderBy: {
            priority: "desc",
          },
        },
      },
    });
  }

  /**
   * Find swarm with results, filtered by user for ownership verification
   * @param id - Swarm UUID
   * @param userId - User ID for ownership check
   * @returns Swarm with relations or null
   */
  async findWithResultsByUserId(
    id: string,
    userId: string
  ): Promise<SwarmWithResults | null> {
    return await this.model.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        findings: {
          orderBy: {
            createdAt: "asc",
          },
        },
        recommendations: {
          orderBy: {
            priority: "desc",
          },
        },
      },
    });
  }

  /**
   * Find swarms by status and user
   * @param userId - User ID
   * @param status - Swarm status
   * @param limit - Maximum number of swarms
   * @returns Array of swarms
   */
  async findByUserIdAndStatus(
    userId: string,
    status: string,
    limit?: number
  ): Promise<ResearchSwarm[]> {
    return await this.findMany(
      {
        userId,
        status,
      },
      {
        orderBy: { createdAt: "desc" },
        ...(limit !== undefined && { take: limit }),
      }
    );
  }

  /**
   * Count swarms by user and status
   * @param userId - User ID
   * @param status - Optional status filter
   * @returns Count of swarms
   */
  async countByUserId(userId: string, status?: string): Promise<number> {
    return await this.count({
      userId,
      ...(status && { status }),
    });
  }

  /**
   * Get swarm statistics for a user
   * @param userId - User ID
   * @returns Statistics object
   */
  async getStatsByUserId(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    byType: Record<string, number>;
  }> {
    const [total, completed, pending, failed, allSwarms] = await Promise.all([
      this.countByUserId(userId),
      this.countByUserId(userId, "completed"),
      this.countByUserId(userId, "pending"),
      this.countByUserId(userId, "failed"),
      this.findMany(
        { userId },
        {
          orderBy: { createdAt: "desc" },
        }
      ),
    ]);

    // Count by type
    const byType: Record<string, number> = {};
    allSwarms.forEach((swarm) => {
      byType[swarm.swarmType] = (byType[swarm.swarmType] || 0) + 1;
    });

    return {
      total,
      completed,
      pending,
      failed,
      byType,
    };
  }

  /**
   * Update swarm status
   * @param id - Swarm UUID
   * @param status - New status
   * @param progressPct - Optional progress percentage
   * @returns Updated swarm
   */
  async updateStatus(
    id: string,
    status: string,
    progressPct?: number
  ): Promise<ResearchSwarm> {
    const updateData: Prisma.ResearchSwarmUpdateInput = {
      status,
      ...(progressPct !== undefined && { progressPct }),
      ...(status === "running" && !progressPct && { startedAt: new Date() }),
      ...(status === "completed" && { completedAt: new Date() }),
    };

    return await this.update(id, updateData);
  }
}

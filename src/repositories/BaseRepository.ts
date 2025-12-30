/**
 * Base Repository Pattern
 *
 * Purpose: Abstract data access layer providing common CRUD operations
 *
 * Features:
 * - Generic CRUD operations (findById, findMany, create, update, delete)
 * - Type-safe with TypeScript generics
 * - Extensible for feature-specific queries
 * - Centralizes Prisma access
 *
 * Usage:
 * ```typescript
 * export class SwarmRepository extends BaseRepository<
 *   ResearchSwarm,
 *   Prisma.ResearchSwarmCreateInput,
 *   Prisma.ResearchSwarmUpdateInput
 * > {
 *   protected get model() {
 *     return prisma.researchSwarm;
 *   }
 *
 *   async findActiveByUserId(userId: string): Promise<ResearchSwarm[]> {
 *     return await this.model.findMany({
 *       where: { userId, status: 'active' }
 *     });
 *   }
 * }
 * ```
 *
 * Benefits:
 * - DRY - Common operations defined once
 * - Testable - Easy to mock for testing
 * - Maintainable - Changes to data access in one place
 * - Type-safe - Leverages TypeScript generics
 */

export abstract class BaseRepository<
  T,
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
> {
  /**
   * Abstract property that child classes must implement
   * Returns the Prisma model for this repository
   */
  protected abstract get model(): any;

  /**
   * Find a single entity by ID
   * @param id - Entity UUID
   * @returns Entity or null if not found
   */
  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
    });
  }

  /**
   * Find multiple entities matching criteria
   * @param where - Prisma where clause
   * @param options - Additional query options (orderBy, take, skip, include)
   * @returns Array of matching entities
   */
  async findMany(
    where?: any,
    options?: {
      orderBy?: any;
      take?: number;
      skip?: number;
      include?: any;
    }
  ): Promise<T[]> {
    return await this.model.findMany({
      where,
      ...(options?.orderBy && { orderBy: options.orderBy }),
      ...(options?.take !== undefined && { take: options.take }),
      ...(options?.skip !== undefined && { skip: options.skip }),
      ...(options?.include && { include: options.include }),
    });
  }

  /**
   * Find first entity matching criteria
   * @param where - Prisma where clause
   * @param options - Additional query options
   * @returns First matching entity or null
   */
  async findFirst(
    where: any,
    options?: {
      orderBy?: any;
      include?: any;
    }
  ): Promise<T | null> {
    return await this.model.findFirst({
      where,
      ...options,
    });
  }

  /**
   * Create a new entity
   * @param data - Entity creation data
   * @returns Created entity
   */
  async create(data: TCreate): Promise<T> {
    return await this.model.create({
      data,
    });
  }

  /**
   * Update an existing entity
   * @param id - Entity UUID
   * @param data - Update data
   * @returns Updated entity
   */
  async update(id: string, data: TUpdate): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an entity
   * @param id - Entity UUID
   * @returns Deleted entity
   */
  async delete(id: string): Promise<T> {
    return await this.model.delete({
      where: { id },
    });
  }

  /**
   * Count entities matching criteria
   * @param where - Prisma where clause
   * @returns Count of matching entities
   */
  async count(where?: any): Promise<number> {
    return await this.model.count({
      where,
    });
  }

  /**
   * Check if entity exists
   * @param id - Entity UUID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Delete multiple entities matching criteria
   * @param where - Prisma where clause
   * @returns Count of deleted entities
   */
  async deleteMany(where: any): Promise<number> {
    const result = await this.model.deleteMany({
      where,
    });
    return result.count;
  }

  /**
   * Update multiple entities matching criteria
   * @param where - Prisma where clause
   * @param data - Update data
   * @returns Count of updated entities
   */
  async updateMany(where: any, data: TUpdate): Promise<number> {
    const result = await this.model.updateMany({
      where,
      data,
    });
    return result.count;
  }
}

/**
 * Base Service Pattern
 *
 * Purpose: Provides common business logic utilities for all services
 *
 * Features:
 * - User ID validation
 * - Standardized error handling
 * - Common validation helpers
 * - Logging utilities
 *
 * Usage:
 * ```typescript
 * export class ResearchSwarmService extends BaseService {
 *   async createSwarm(dto: CreateSwarmDto): Promise<ResearchSwarm> {
 *     this.validateUserId(dto.userId);
 *     assert(dto.query.length >= 10, "Query too short");
 *
 *     try {
 *       return await this.swarmRepository.create(dto);
 *     } catch (error) {
 *       this.handleError(error, 'Failed to create swarm');
 *     }
 *   }
 * }
 * ```
 *
 * Benefits:
 * - Consistent validation across services
 * - Standardized error handling
 * - Reusable utility methods
 * - Easier testing with common patterns
 */

import { assert } from "@/utils/assert";

export abstract class BaseService {
  /**
   * Validate that userId is present and not null
   * @param userId - User ID to validate
   * @throws AssertionError if userId is null or empty
   */
  protected validateUserId(userId: string | null | undefined): void {
    assert(!!userId, "userId is required");
  }

  /**
   * Validate that an array is not empty
   * @param array - Array to validate
   * @param fieldName - Name of field for error message
   * @throws AssertionError if array is empty
   */
  protected validateNotEmpty<T>(array: T[], fieldName: string): void {
    assert(array.length > 0, `${fieldName} cannot be empty`);
  }

  /**
   * Validate string length constraints
   * @param value - String to validate
   * @param min - Minimum length
   * @param max - Maximum length
   * @param fieldName - Name of field for error message
   * @throws AssertionError if length constraints violated
   */
  protected validateLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): void {
    assert(
      value.length >= min && value.length <= max,
      `${fieldName} must be between ${min} and ${max} characters`
    );
  }

  /**
   * Validate that value is in allowed list
   * @param value - Value to validate
   * @param allowed - Array of allowed values
   * @param fieldName - Name of field for error message
   * @throws AssertionError if value not in allowed list
   */
  protected validateEnum<T>(
    value: T,
    allowed: readonly T[],
    fieldName: string
  ): void {
    assert(
      allowed.includes(value),
      `Invalid ${fieldName}. Must be one of: ${allowed.join(", ")}`
    );
  }

  /**
   * Validate ownership - ensures entity belongs to user
   * @param entityUserId - User ID from entity
   * @param requestUserId - User ID from request
   * @throws AssertionError if user IDs don't match
   */
  protected validateOwnership(
    entityUserId: string,
    requestUserId: string
  ): void {
    assert(
      entityUserId === requestUserId,
      "Unauthorized: You do not own this resource"
    );
  }

  /**
   * Handle errors with context and logging
   * @param error - Error object
   * @param context - Context string for logging
   * @throws Original error or wrapped error
   */
  protected handleError(error: unknown, context: string): never {
    if (error instanceof Error) {
      console.error(`[${context}]:`, error.message, error.stack);
      throw error;
    }

    const unknownError = new Error(`${context}: Unknown error occurred`);
    console.error(`[${context}]:`, unknownError);
    throw unknownError;
  }

  /**
   * Log informational message
   * @param message - Log message
   * @param data - Optional data to log
   */
  protected logInfo(message: string, data?: any): void {
    console.log(`[${this.constructor.name}] ${message}`, data || "");
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param data - Optional data to log
   */
  protected logWarning(message: string, data?: any): void {
    console.warn(`[${this.constructor.name}] ${message}`, data || "");
  }

  /**
   * Log error message
   * @param message - Error message
   * @param error - Error object
   */
  protected logError(message: string, error: unknown): void {
    console.error(
      `[${this.constructor.name}] ${message}`,
      error instanceof Error ? error.message : error
    );
  }

  /**
   * Validate pagination parameters
   * @param limit - Maximum number of items
   * @param offset - Number of items to skip
   * @returns Validated pagination params
   */
  protected validatePagination(
    limit?: number,
    offset?: number
  ): {
    limit: number;
    offset: number;
  } {
    const validatedLimit = limit && limit > 0 && limit <= 100 ? limit : 20;
    const validatedOffset = offset && offset >= 0 ? offset : 0;

    return {
      limit: validatedLimit,
      offset: validatedOffset,
    };
  }
}

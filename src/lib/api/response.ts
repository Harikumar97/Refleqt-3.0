/**
 * API Response Utilities
 *
 * Purpose: Standardized API response helpers for consistent response structure
 *
 * Features:
 * - Success responses with data and optional metadata
 * - Error responses with status codes
 * - Validation error responses
 * - Not found responses
 * - Unauthorized responses
 *
 * Usage:
 * ```typescript
 * // In API route
 * import { apiResponse } from '@/lib/api/response';
 *
 * export async function GET(request: NextRequest) {
 *   try {
 *     const data = await service.getData();
 *     return apiResponse.success(data, { page: 1, total: 100 });
 *   } catch (error) {
 *     return apiResponse.error(error as Error);
 *   }
 * }
 * ```
 *
 * Response Format:
 * Success: { success: true, data: {...}, meta?: {...} }
 * Error: { success: false, error: "message", code: "ErrorType" }
 */

import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export const apiResponse = {
  /**
   * Success response with data and optional metadata
   * @param data - Response data
   * @param meta - Optional metadata (pagination, etc.)
   * @returns NextResponse with success structure
   */
  success: <T>(data: T, meta?: Record<string, any>): NextResponse => {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(meta && { meta }),
    };

    return NextResponse.json(response, { status: 200 });
  },

  /**
   * Error response with status code
   * @param error - Error object or message
   * @param status - HTTP status code (default: 500)
   * @returns NextResponse with error structure
   */
  error: (error: Error | string, status: number = 500): NextResponse => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorCode = error instanceof Error ? error.name : "Error";

    const response: ApiErrorResponse = {
      success: false,
      error: errorMessage,
      code: errorCode,
    };

    return NextResponse.json(response, { status });
  },

  /**
   * Validation error response
   * @param errors - Array of validation errors
   * @returns NextResponse with 400 status
   */
  validationError: (errors: ValidationErrorDetail[]): NextResponse => {
    const response: ApiErrorResponse = {
      success: false,
      error: "Validation failed",
      code: "ValidationError",
      details: errors,
    };

    return NextResponse.json(response, { status: 400 });
  },

  /**
   * Not found error response
   * @param resource - Name of resource not found
   * @returns NextResponse with 404 status
   */
  notFound: (resource: string = "Resource"): NextResponse => {
    const response: ApiErrorResponse = {
      success: false,
      error: `${resource} not found`,
      code: "NotFoundError",
    };

    return NextResponse.json(response, { status: 404 });
  },

  /**
   * Unauthorized error response
   * @param message - Optional custom message
   * @returns NextResponse with 401 status
   */
  unauthorized: (message: string = "Unauthorized"): NextResponse => {
    const response: ApiErrorResponse = {
      success: false,
      error: message,
      code: "UnauthorizedError",
    };

    return NextResponse.json(response, { status: 401 });
  },

  /**
   * Forbidden error response
   * @param message - Optional custom message
   * @returns NextResponse with 403 status
   */
  forbidden: (message: string = "Forbidden"): NextResponse => {
    const response: ApiErrorResponse = {
      success: false,
      error: message,
      code: "ForbiddenError",
    };

    return NextResponse.json(response, { status: 403 });
  },

  /**
   * Bad request error response
   * @param message - Error message
   * @returns NextResponse with 400 status
   */
  badRequest: (message: string): NextResponse => {
    const response: ApiErrorResponse = {
      success: false,
      error: message,
      code: "BadRequestError",
    };

    return NextResponse.json(response, { status: 400 });
  },
};

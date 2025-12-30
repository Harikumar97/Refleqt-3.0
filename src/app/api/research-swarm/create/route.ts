/**
 * Research Swarm Creation API
 *
 * POST /api/research-swarm/create
 *
 * Purpose: Creates a new research swarm for multi-agent competitive intelligence gathering
 *
 * Functionality:
 * - Validates user input (query length, swarm type)
 * - Creates swarm record in database with pending status
 * - Returns swarm metadata for frontend tracking
 *
 * Validation:
 * - userId: Required (string)
 * - query: Required, 10-500 characters
 * - swarmType: Required, must be 'competitive' | 'market' | 'customer' | 'product'
 *
 * Security:
 * - Input validation via assert() utility
 * - No authorization yet (TODO: add NextAuth session verification)
 *
 * Future: Will enqueue BullMQ job for background processing with LangGraph
 */

import { type NextRequest } from "next/server";
import { ResearchSwarmService } from "@/features/research-swarm/services/ResearchSwarmService";
import { apiResponse } from "@/lib/api/response";
import type { CreateSwarmDto } from "@/features/research-swarm/types/dtos";

const swarmService = new ResearchSwarmService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, swarmType, swarmSize, goalId } = body;

    // Create DTO
    const dto: CreateSwarmDto = {
      userId,
      query,
      swarmType,
      swarmSize,
      goalId,
    };

    // Call service layer
    const swarm = await swarmService.createSwarm(dto);

    return apiResponse.success(swarm);
  } catch (error) {
    return apiResponse.error(error as Error, 400);
  }
}

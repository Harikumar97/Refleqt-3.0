# Refleqt 3.0 - Architecture Reorganization Plan

**Date**: 2025-12-30
**Status**: APPROVED - Implementation Starting
**Priority**: CRITICAL - Foundation for Phase 2

---

## Executive Summary

The codebase analysis reveals critical architectural inconsistencies that must be addressed before implementing Phase 2 features (BullMQ, LangGraph, WebSocket). This document outlines a comprehensive reorganization plan following systems engineering principles.

### Key Issues Identified

1. **Missing Layered Architecture** - No service/repository pattern
2. **Inconsistent Feature Organization** - Research Swarms ✅, Strategy Cohorts ❌
3. **Monolithic Components** - 4 pages > 500 lines
4. **Type System Fragmentation** - 3 different type definition locations
5. **Limited Test Coverage** - Only 4 actual test files

### Solution Approach

Implement **Feature-First Architecture** with proper layering:

```
Presentation Layer (Components)
       ↓
Service Layer (Business Logic)
       ↓
Repository Layer (Data Access)
       ↓
Database (Prisma + PostgreSQL)
```

---

## New Directory Structure

### Phase 1: Foundation (Weeks 1-2) - CRITICAL

```
/src/
├── features/                    # Feature-first organization
│   ├── research-swarm/          # Template for all features
│   │   ├── components/          # UI components
│   │   │   ├── SwarmDashboard.tsx
│   │   │   ├── CreateSwarmModal.tsx
│   │   │   ├── SwarmResultsPanel.tsx
│   │   │   └── index.ts
│   │   ├── services/            # Business logic
│   │   │   ├── ResearchSwarmService.ts
│   │   │   ├── SwarmExecutionService.ts
│   │   │   ├── SynthesisService.ts
│   │   │   └── index.ts
│   │   ├── repositories/        # Data access
│   │   │   ├── SwarmRepository.ts
│   │   │   ├── FindingRepository.ts
│   │   │   ├── RecommendationRepository.ts
│   │   │   └── index.ts
│   │   ├── hooks/               # Feature hooks
│   │   │   ├── useSwarmData.ts
│   │   │   ├── useSwarmActions.ts
│   │   │   └── index.ts
│   │   ├── types/               # Feature types
│   │   │   ├── models.ts
│   │   │   ├── dtos.ts
│   │   │   └── index.ts
│   │   ├── utils/               # Feature utilities
│   │   │   └── swarm-helpers.ts
│   │   └── index.ts             # Public API
│   │
│   ├── intelligence-feed/       # Refactor existing
│   ├── strategy-cohorts/        # Extract from monolith
│   ├── smart-trackers/          # Extract from monolith
│   ├── psychographics/          # Implement properly
│   ├── brewery/                 # Implement properly
│   └── user-profile/            # Extract user features
│
├── services/                    # Shared services
│   ├── BaseService.ts
│   ├── NotificationService.ts
│   ├── ValidationService.ts
│   └── index.ts
│
├── repositories/                # Shared repositories
│   ├── BaseRepository.ts
│   └── index.ts
│
├── lib/
│   ├── api/                     # API utilities
│   │   ├── response.ts          # Standardized responses
│   │   ├── validation.ts        # Request validation
│   │   ├── error-handler.ts     # Error handling
│   │   ├── middleware.ts        # Auth, rate limiting
│   │   └── types.ts
│   ├── db/
│   │   ├── prisma.ts            # Prisma client
│   │   └── migrations.ts
│   ├── llm/                     # Keep existing LLM router
│   └── jobs/                    # Keep existing job queue
│
├── types/                       # Consolidated types
│   ├── models/                  # Database models
│   ├── dtos/                    # API contracts
│   │   ├── requests/
│   │   └── responses/
│   ├── domain/                  # Business domain
│   ├── ui/                      # Component props
│   └── shared/                  # Cross-cutting
│
├── components/                  # Shared components only
│   ├── shared/                  # NEW - Cross-feature
│   │   ├── data-display/
│   │   ├── feedback/
│   │   ├── forms/
│   │   └── overlays/
│   ├── layout/                  # Layout components
│   └── ui/                      # UI primitives
│
├── app/
│   ├── api/                     # Thin API controllers
│   │   └── [feature]/
│   │       └── route.ts         # Delegates to services
│   └── portal/                  # Page components
│       └── [feature]/
│           └── page.tsx         # Uses feature components
│
└── tests/                       # Comprehensive tests
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Implementation Roadmap

### Week 1: Foundation - Service & Repository Layers

#### Day 1-2: Create Base Infrastructure

**1. Base Repository Pattern**

```typescript
// /src/repositories/BaseRepository.ts
export abstract class BaseRepository<T, TCreate, TUpdate> {
  protected abstract get model(): any;

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findMany(where?: any): Promise<T[]> {
    return await this.model.findMany({ where });
  }

  async create(data: TCreate): Promise<T> {
    return await this.model.create({ data });
  }

  async update(id: string, data: TUpdate): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({ where: { id } });
  }

  async count(where?: any): Promise<number> {
    return await this.model.count({ where });
  }
}
```

**2. Base Service Pattern**

```typescript
// /src/services/BaseService.ts
export abstract class BaseService {
  protected validateUserId(userId: string | null): void {
    assert(!!userId, "userId is required");
  }

  protected handleError(error: unknown, context: string): never {
    if (error instanceof Error) {
      console.error(`${context}:`, error);
      throw error;
    }
    throw new Error(`${context}: Unknown error`);
  }
}
```

**3. API Response Utilities**

```typescript
// /src/lib/api/response.ts
export const apiResponse = {
  success: <T>(data: T, meta?: any) =>
    NextResponse.json({ success: true, data, meta }),

  error: (error: Error, status: number = 500) =>
    NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.name,
      },
      { status }
    ),

  validationError: (errors: ValidationError[]) =>
    NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: errors,
      },
      { status: 400 }
    ),
};
```

#### Day 3-4: Implement Research Swarm Layers

**4. SwarmRepository**

```typescript
// /src/features/research-swarm/repositories/SwarmRepository.ts
import { BaseRepository } from "@/repositories/BaseRepository";
import prisma from "@/lib/db/prisma";
import { ResearchSwarm, Prisma } from "@prisma/client";

export class SwarmRepository extends BaseRepository<
  ResearchSwarm,
  Prisma.ResearchSwarmCreateInput,
  Prisma.ResearchSwarmUpdateInput
> {
  protected get model() {
    return prisma.researchSwarm;
  }

  async findByUserIdWithPagination(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ResearchSwarm[]> {
    return await this.model.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        findings: true,
        recommendations: true,
      },
    });
  }

  async findActiveByUserId(userId: string): Promise<ResearchSwarm[]> {
    return await this.model.findMany({
      where: {
        userId,
        status: { in: ["pending", "running", "processing"] },
      },
    });
  }

  async updateProgress(
    id: string,
    progressPct: number,
    timeRemaining: string
  ): Promise<ResearchSwarm> {
    return await this.model.update({
      where: { id },
      data: { progressPct, timeRemaining },
    });
  }
}
```

**5. ResearchSwarmService**

```typescript
// /src/features/research-swarm/services/ResearchSwarmService.ts
import { BaseService } from "@/services/BaseService";
import { SwarmRepository } from "../repositories/SwarmRepository";
import { CreateSwarmDto, SwarmResultDto } from "../types/dtos";
import { assert } from "@/utils/assert";

export class ResearchSwarmService extends BaseService {
  private swarmRepository: SwarmRepository;

  constructor() {
    super();
    this.swarmRepository = new SwarmRepository();
  }

  async createSwarm(dto: CreateSwarmDto): Promise<ResearchSwarm> {
    // Validation
    this.validateUserId(dto.userId);
    assert(
      dto.query.length >= 10 && dto.query.length <= 500,
      "Query must be between 10 and 500 characters"
    );

    const validTypes = ["competitive", "market", "customer", "product"];
    assert(
      validTypes.includes(dto.swarmType),
      `Invalid swarmType. Must be one of: ${validTypes.join(", ")}`
    );

    try {
      // Create swarm
      const swarm = await this.swarmRepository.create({
        user: { connect: { id: dto.userId } },
        query: dto.query,
        swarmType: dto.swarmType,
        status: "pending",
        progressPct: 0,
        timeRemaining: "5 min",
      });

      // TODO: Enqueue job with BullMQ

      return swarm;
    } catch (error) {
      this.handleError(error, "Failed to create research swarm");
    }
  }

  async getSwarmsByUser(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<ResearchSwarm[]> {
    this.validateUserId(userId);

    try {
      return await this.swarmRepository.findByUserIdWithPagination(
        userId,
        limit,
        offset
      );
    } catch (error) {
      this.handleError(error, "Failed to fetch swarms");
    }
  }

  async getSwarmResults(
    swarmId: string,
    userId: string
  ): Promise<SwarmResultDto> {
    this.validateUserId(userId);

    try {
      const swarm = await this.swarmRepository.findById(swarmId);

      assert(!!swarm, "Swarm not found");
      assert(swarm.userId === userId, "Unauthorized");
      assert(swarm.status === "completed", "Swarm not completed");

      // Transform to DTO
      return {
        swarmId: swarm.id,
        query: swarm.query,
        type: swarm.swarmType,
        completedAt: swarm.completedAt,
        keyFindings: swarm.findings.map((f) => f.content),
        recommendations: swarm.recommendations.map((r) => ({
          action: r.action,
          impact: r.impact,
          priority: r.priority,
        })),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch swarm results");
    }
  }
}
```

**6. Refactor API Routes**

```typescript
// /src/app/api/research-swarm/create/route.ts
import { type NextRequest } from "next/server";
import { apiResponse } from "@/lib/api/response";
import { ResearchSwarmService } from "@/features/research-swarm/services/ResearchSwarmService";
import { CreateSwarmDto } from "@/features/research-swarm/types/dtos";

const swarmService = new ResearchSwarmService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto: CreateSwarmDto = {
      userId: body.userId,
      query: body.query,
      swarmType: body.swarmType,
    };

    const swarm = await swarmService.createSwarm(dto);

    return apiResponse.success({
      id: swarm.id,
      query: swarm.query,
      type: swarm.swarmType,
      status: swarm.status,
      progress: swarm.progressPct,
      timeRemaining: swarm.timeRemaining,
      createdAt: swarm.createdAt,
    });
  } catch (error) {
    return apiResponse.error(error as Error, 400);
  }
}
```

#### Day 5: Create DTOs and Mappers

**7. Type Definitions**

```typescript
// /src/features/research-swarm/types/dtos.ts
export interface CreateSwarmDto {
  userId: string;
  query: string;
  swarmType: "competitive" | "market" | "customer" | "product";
  goalId?: string;
}

export interface SwarmResultDto {
  swarmId: string;
  query: string;
  type: string;
  completedAt: Date | null;
  executionTimeMs: number | null;
  keyFindings: string[];
  recommendations: RecommendationDto[];
  sources: string[];
}

export interface RecommendationDto {
  action: string;
  impact: string;
  priority: string;
  timeline?: string;
  effort?: string;
  revenueImpact?: string;
}
```

**8. Mappers**

```typescript
// /src/features/research-swarm/types/mappers.ts
import { ResearchSwarm } from "@prisma/client";
import { SwarmResultDto } from "./dtos";

export function toSwarmResultDto(
  swarm: ResearchSwarm & {
    findings: any[];
    recommendations: any[];
  }
): SwarmResultDto {
  return {
    swarmId: swarm.id,
    query: swarm.query,
    type: swarm.swarmType,
    completedAt: swarm.completedAt,
    executionTimeMs: swarm.executionTimeMs,
    keyFindings: swarm.findings.map((f) => f.content),
    recommendations: swarm.recommendations.map((r) => ({
      action: r.action,
      impact: r.impact,
      priority: r.priority,
      timeline: r.timeline,
      effort: r.effort,
      revenueImpact: r.revenueImpact,
    })),
    sources: [], // Extract from findings
  };
}
```

---

### Week 2: Feature Migration & Testing

#### Day 6-7: Migrate Intelligence Feed

Apply same pattern:

- Create `IntelligenceRepository`
- Create `IntelligenceFeedService`
- Refactor API routes
- Create DTOs and mappers

#### Day 8-9: Refactor Monolithic Pages

**Strategy Cohorts** (620 lines → modular):

```typescript
// Extract to:
/src/features/strategy-cohorts/
  ├── components/
  │   ├── CohortsListView.tsx
  │   ├── CohortCard.tsx
  │   ├── CreateCohortDialog.tsx
  │   └── CohortAnalysisPanel.tsx
  ├── services/
  │   └── CohortService.ts
  ├── repositories/
  │   └── CohortRepository.ts
  └── hooks/
      ├── useCohortsData.ts
      └── useCohortActions.ts
```

#### Day 10: Add Comprehensive Tests

```typescript
// /src/features/research-swarm/services/ResearchSwarmService.test.ts
describe("ResearchSwarmService", () => {
  let service: ResearchSwarmService;
  let mockRepository: jest.Mocked<SwarmRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new ResearchSwarmService(mockRepository);
  });

  describe("createSwarm", () => {
    it("should create swarm with valid data", async () => {
      const dto = {
        userId: "user-123",
        query: "Test query with sufficient length",
        swarmType: "competitive" as const,
      };

      const result = await service.createSwarm(dto);

      expect(result.status).toBe("pending");
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ query: dto.query })
      );
    });

    it("should reject query shorter than 10 characters", async () => {
      const dto = {
        userId: "user-123",
        query: "short",
        swarmType: "competitive" as const,
      };

      await expect(service.createSwarm(dto)).rejects.toThrow(
        "Query must be between 10 and 500 characters"
      );
    });
  });
});
```

---

## Migration Guide

### For Each Feature

1. **Create feature directory**

   ```bash
   mkdir -p src/features/[feature-name]/{components,services,repositories,hooks,types,utils}
   ```

2. **Extract types**
   - Move from `/src/types/index.ts` to `/src/features/[feature]/types/`
   - Create DTOs for API contracts
   - Create mappers

3. **Create repository**
   - Extend `BaseRepository`
   - Implement feature-specific queries
   - Remove Prisma calls from API routes

4. **Create service**
   - Extend `BaseService`
   - Implement business logic
   - Validate inputs
   - Handle errors

5. **Refactor API routes**
   - Make routes thin controllers
   - Delegate to service layer
   - Use `apiResponse` helpers
   - Remove direct Prisma access

6. **Extract components**
   - Break down large page components
   - Create feature-specific components
   - Use feature hooks

7. **Create hooks**
   - Extract data fetching to hooks
   - Extract actions to hooks
   - Simplify page components

8. **Add tests**
   - Service unit tests
   - Repository unit tests
   - Component tests
   - Integration tests

---

## Success Criteria

### Code Quality Metrics

- ✅ All API routes < 50 lines (thin controllers)
- ✅ All page components < 200 lines
- ✅ All services have 80%+ test coverage
- ✅ No direct Prisma access outside repositories
- ✅ All features follow same organizational pattern
- ✅ Type definitions consolidated in feature modules
- ✅ DTOs separate from database models

### Architecture Compliance

- ✅ Clear separation of concerns (Presentation → Service → Repository → DB)
- ✅ Feature-first directory structure
- ✅ Dependency injection enabled
- ✅ Testable components and services
- ✅ Consistent error handling
- ✅ Standardized API responses

---

## Phase 2 Integration

Once architectural foundation is complete:

### BullMQ Integration

```typescript
// /src/features/research-swarm/services/SwarmExecutionService.ts
export class SwarmExecutionService {
  async executeSwarm(swarmId: string): Promise<void> {
    // Business logic for swarm execution
    // Called by BullMQ worker
  }
}

// /src/lib/jobs/workers/swarm-worker.ts
import { SwarmExecutionService } from "@/features/research-swarm/services/SwarmExecutionService";

worker.process(async (job) => {
  const service = new SwarmExecutionService();
  await service.executeSwarm(job.data.swarmId);
});
```

### LangGraph Integration

```typescript
// /src/features/research-swarm/services/LangGraphOrchestrator.ts
export class LangGraphOrchestrator {
  async orchestrateResearch(swarm: ResearchSwarm): Promise<SwarmResults> {
    // Multi-agent orchestration logic
    // Uses LLM router
    // Returns structured results
  }
}
```

### WebSocket Integration

```typescript
// /src/features/research-swarm/services/SwarmProgressService.ts
export class SwarmProgressService {
  async updateProgress(swarmId: string, progress: number): Promise<void> {
    // Update DB via repository
    await this.swarmRepository.updateProgress(swarmId, progress);

    // Broadcast via WebSocket
    await this.wsService.broadcast(`swarm:${swarmId}`, { progress });
  }
}
```

---

## Next Steps

1. **Approve Plan** - Review and approve architecture
2. **Create Foundation** - Implement base classes (Day 1-2)
3. **Migrate Research Swarms** - Template for others (Day 3-5)
4. **Migrate Intelligence Feed** - Prove pattern works (Day 6-7)
5. **Refactor Monoliths** - Break down large pages (Day 8-9)
6. **Add Tests** - Achieve 80% coverage (Day 10+)
7. **Phase 2 Implementation** - BullMQ, LangGraph, WebSocket

**Total Time**: 2 weeks for foundation + feature migrations
**Estimated Effort**: 80 hours

---

## Appendix: Code Examples

See `/docs/examples/` for:

- `BaseRepository.example.ts`
- `BaseService.example.ts`
- `FeatureStructure.example/`
- `API-Route-Refactor.example.ts`
- `Component-Extraction.example.tsx`

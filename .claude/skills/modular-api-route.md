# Skill: Implementing Modular API Routes in Refleqt 3.0

## Overview

This skill teaches you how to implement modular, type-safe API routes in the Refleqt 3.0 codebase using Next.js 16.1 App Router with TypeScript.

## Architecture Pattern

Refleqt uses a feature-based modular routing structure:

```
src/app/api/
├── feature-name/
│   ├── route.ts              # Collection endpoints (GET, POST list)
│   ├── [id]/
│   │   └── route.ts          # Item endpoints (GET, PUT, DELETE single item)
│   ├── create/
│   │   └── route.ts          # Dedicated creation endpoint
│   ├── stats/
│   │   └── route.ts          # Statistics/analytics endpoint
│   └── route.test.ts         # Unit tests for endpoints
```

## Step-by-Step Implementation Guide

### Step 1: Create File Structure

```bash
# For a new feature called "example-feature"
mkdir -p src/app/api/example-feature/{[id],create,stats}
```

### Step 2: Add File Header Comments

**CRITICAL**: Every API route file MUST start with comprehensive header comments explaining:

- Purpose of the endpoint
- HTTP methods supported
- Functionality overview
- Request parameters (query, body, URL params)
- Response structure
- Validation rules
- Security considerations
- TODO items for future work

**Example**:

```typescript
/**
 * Example Feature API
 *
 * GET /api/example-feature
 * POST /api/example-feature
 *
 * Purpose: Manages example feature resources
 *
 * GET Functionality:
 * - Returns list of items for authenticated user
 * - Supports pagination (default: 20 items)
 * - Filtered by user ownership
 *
 * POST Functionality:
 * - Creates new item with validation
 * - Validates required fields
 * - Returns created item metadata
 *
 * Validation:
 * - userId: Required (string)
 * - name: Required, 3-100 characters
 * - type: Required, must be 'typeA' | 'typeB'
 *
 * Security:
 * - User ownership verified via userId parameter
 * - TODO: Replace with NextAuth session verification
 *
 * Future: Add pagination support, filtering, sorting
 */
```

### Step 3: Define Type-Safe Route Handlers

```typescript
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";

// GET endpoint - List items
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    // Validate required parameters
    assert(!!userId, "userId is required");

    // Query database with user ownership filter
    const items = await prisma.exampleModel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    // Return standardized response
    return NextResponse.json({
      success: true,
      items: items.map((item: { id: string; name: string; type: string }) => ({
        id: item.id,
        name: item.name,
        type: item.type,
      })),
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch items",
      },
      { status: 400 }
    );
  }
}

// POST endpoint - Create item
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId, name, type } = body;

    // Validate required fields
    assert(userId, "userId is required");
    assert(name, "name is required");
    assert(type, "type is required");

    // Validate field constraints
    assert(
      name.length >= 3 && name.length <= 100,
      "Name must be between 3 and 100 characters"
    );

    const validTypes = ["typeA", "typeB"];
    assert(
      validTypes.includes(type),
      `Invalid type. Must be one of: ${validTypes.join(", ")}`
    );

    // Create in database
    const item = await prisma.exampleModel.create({
      data: {
        userId,
        name,
        type,
        status: "pending",
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item",
      },
      { status: 400 }
    );
  }
}
```

### Step 4: Implement Dynamic Route for Single Item

Create `src/app/api/example-feature/[id]/route.ts`:

```typescript
/**
 * Example Feature Item API
 *
 * GET /api/example-feature/[id]
 *
 * Purpose: Retrieves single item by ID with ownership verification
 *
 * ... (full header documentation)
 */

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { assert } from "@/utils/assert";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    assert(!!userId, "userId is required");

    // Fetch with ownership verification
    const item = await prisma.exampleModel.findFirst({
      where: {
        id,
        userId, // Ensures user owns this item
      },
      include: {
        relatedData: true, // Include relations as needed
      },
    });

    assert(!!item, "Item not found or unauthorized");

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch item",
      },
      {
        status:
          error instanceof Error && error.message.includes("not found")
            ? 404
            : 400,
      }
    );
  }
}
```

### Step 5: Write Unit Tests

Create `src/app/api/example-feature/route.test.ts`:

```typescript
/**
 * Test Suite for Example Feature API
 * Tests /api/example-feature endpoints
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { type NextRequest } from "next/server";
import { GET, POST } from "@/app/api/example-feature/route";
import prisma from "@/lib/db/prisma";

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  default: {
    exampleModel: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("POST /api/example-feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create item with valid input", async () => {
    const mockItem = {
      id: "item-123",
      userId: "user-123",
      name: "Test Item",
      type: "typeA",
      status: "pending",
      createdAt: new Date(),
    };

    (prisma.exampleModel.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockItem
    );

    const request = new Request("http://localhost:3000/api/example-feature", {
      method: "POST",
      body: JSON.stringify({
        userId: "user-123",
        name: "Test Item",
        type: "typeA",
      }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.item.name).toBe("Test Item");
  });

  it("should require userId", async () => {
    const request = new Request("http://localhost:3000/api/example-feature", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Item",
        type: "typeA",
      }),
    }) as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("userId is required");
  });

  // Add more test cases for all validation rules
});
```

## Validation Best Practices

### Use the assert() Utility

```typescript
import { assert } from "@/utils/assert";

// Required field validation
assert(userId, "userId is required");
assert(!!userId, "userId is required"); // For potentially falsy values

// String length validation
assert(
  name.length >= 3 && name.length <= 100,
  "Name must be between 3 and 100 characters"
);

// Enum validation
const validTypes = ["typeA", "typeB", "typeC"];
assert(
  validTypes.includes(type),
  `Invalid type. Must be one of: ${validTypes.join(", ")}`
);

// Range validation
assert(count >= 1 && count <= 100, "Count must be between 1 and 100");

// Custom validation
assert(isValidEmail(email), "Invalid email format");
```

### Type Safety for Prisma Results

Always add explicit type annotations to map/filter/reduce callbacks:

```typescript
// CORRECT
const items = swarms.map((swarm: { id: string; name: string }) => ({
  id: swarm.id,
  name: swarm.name,
}));

// INCORRECT (will cause TS errors)
const items = swarms.map((swarm) => ({
  id: swarm.id,
  name: swarm.name,
}));
```

## Security Checklist

- [ ] User ownership verification in WHERE clause
- [ ] Input validation for all required fields
- [ ] String length constraints enforced
- [ ] Enum values validated against whitelist
- [ ] Proper error handling with appropriate HTTP status codes
- [ ] No sensitive data exposed in error messages
- [ ] TODO comment for NextAuth session integration

## Database Query Patterns

### List Query with Pagination

```typescript
const items = await prisma.model.findMany({
  where: { userId }, // User ownership filter
  orderBy: { createdAt: "desc" }, // Most recent first
  take: 20, // Limit results
  skip: offset || 0, // For pagination
  select: {
    // Only fetch needed fields
    id: true,
    name: true,
    status: true,
    createdAt: true,
  },
});
```

### Single Item with Relations

```typescript
const item = await prisma.model.findFirst({
  where: {
    id,
    userId, // CRITICAL: User ownership
  },
  include: {
    relatedModel: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

### Aggregations

```typescript
const [total, active, completed] = await Promise.all([
  prisma.model.count({ where: { userId } }),
  prisma.model.count({ where: { userId, status: "active" } }),
  prisma.model.count({ where: { userId, status: "completed" } }),
]);
```

## Response Format Standards

### Success Response

```typescript
return NextResponse.json({
  success: true,
  item: {
    // ... item data
  },
});
```

### Error Response

```typescript
return NextResponse.json(
  {
    success: false,
    error: error instanceof Error ? error.message : "Generic error message",
  },
  { status: 400 } // Or 404, 500 as appropriate
);
```

### List Response

```typescript
return NextResponse.json({
  success: true,
  items: [...],
  pagination: {
    total: totalCount,
    page: currentPage,
    perPage: 20,
  }, // Optional
});
```

## Common Patterns Reference

See `src/app/api/research-swarm/` for complete examples:

- `create/route.ts` - POST with validation
- `active/route.ts` - GET list with filtering
- `[id]/results/route.ts` - GET single with relations
- `templates/route.ts` - GET and POST in same file
- `stats/route.ts` - Aggregations and calculations

## Checklist for New API Route

- [ ] Create directory structure under `src/app/api/`
- [ ] Add comprehensive file header comment
- [ ] Import NextRequest, NextResponse, prisma, assert
- [ ] Implement HTTP method handlers (GET, POST, etc.)
- [ ] Add input validation with assert()
- [ ] Include user ownership filter in queries
- [ ] Add explicit types to Prisma result transformations
- [ ] Implement proper error handling
- [ ] Return standardized JSON responses
- [ ] Write unit tests with Vitest
- [ ] Run `npx tsc --noEmit` to verify no type errors
- [ ] Test endpoints manually or with test script

## Performance Considerations

1. **Select only needed fields**: Use `select` to avoid fetching entire objects
2. **Limit results**: Always use `take` for list queries (default: 20)
3. **Use Promise.all**: For parallel database queries
4. **Avoid N+1 queries**: Use `include` with proper relations
5. **Index frequently queried fields**: Ensure userId, createdAt are indexed

## Migration to NextAuth

Currently, all endpoints use client-provided `userId` for ownership verification. Future migration:

```typescript
// Current (Phase 1)
const userId = searchParams.get("userId");
assert(!!userId, "userId is required");

// Future (Phase 2 - with NextAuth)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
assert(session?.user?.id, "Unauthorized");
const userId = session.user.id;
```

Add TODO comments in all routes:

```typescript
// TODO: Replace with NextAuth session verification
```

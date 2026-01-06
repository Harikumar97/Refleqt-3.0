# Refleqt 3.0 → 3.5 Migration Guide

## Overview

Refleqt 3.5 is a reorganized version of the codebase using a Turborepo monorepo structure. The new structure provides:

- **Clear package boundaries** with explicit dependencies
- **Parallel builds** via Turborepo for faster development
- **Shared components** in dedicated packages
- **Type safety** with strict TypeScript configuration
- **Multi-provider LLM support** with unified router

## New Directory Structure

```
Refleqt-3.5/
├── apps/
│   └── web/                    # Next.js 15 application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # App-specific components
│       │   └── lib/            # App utilities
│       └── package.json
│
├── packages/
│   ├── core/                   # Business logic
│   │   ├── src/
│   │   │   ├── llm/           # Multi-provider LLM router
│   │   │   ├── research-swarm/ # Multi-agent research
│   │   │   ├── intelligence/   # Scoring algorithms
│   │   │   └── analytics/      # Tracking & metrics
│   │   └── package.json
│   │
│   ├── database/              # Prisma ORM
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Utility functions
│   ├── ui/                    # Reusable React components
│   └── tsconfig/              # Shared TS configurations
│
├── package.json               # Workspace root
├── turbo.json                 # Turborepo configuration
└── tsconfig.json              # Base TypeScript config
```

## Migration Steps

### 1. Environment Setup

Copy your environment variables:

```bash
cp ~/Refleqt-3.0/.env.local ~/Refleqt-3.5/.env.local
```

### 2. Install Dependencies

```bash
cd ~/Refleqt-3.5
pnpm install
```

### 3. Generate Prisma Client

```bash
pnpm --filter @refleqt/database prisma generate
```

### 4. Run Development Server

```bash
pnpm dev
```

## Key Changes

### LLM Router

The new architecture uses a unified LLM router supporting multiple providers:

```typescript
import { initializeLLMRouter, getLLMRouter } from '@refleqt/core/llm';

// Initialize once
initializeLLMRouter({
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  openai: { apiKey: process.env.OPENAI_API_KEY },
  google: { apiKey: process.env.GOOGLE_AI_API_KEY },
  defaultProvider: 'anthropic',
});

// Use anywhere
const router = getLLMRouter();
const result = await router.complete(messages, { provider: 'openai' });
```

### Research Swarm

Multi-agent research with role-based agents:

```typescript
import { initializeSwarm, getSwarm } from '@refleqt/core/research-swarm';

const swarm = initializeSwarm();
const task = await swarm.startResearch('Your research query');
```

### Shared UI Components

Import reusable components from the UI package:

```typescript
import { Card, Button, PageHeader, Modal, LoadingSpinner } from '@refleqt/ui';
```

### Database Access

Use the singleton Prisma client:

```typescript
import { prisma } from '@refleqt/database';

const users = await prisma.user.findMany();
```

## Package Dependencies

```
@refleqt/web
  ├── @refleqt/core
  │     ├── @refleqt/database
  │     ├── @refleqt/types
  │     └── @refleqt/utils
  ├── @refleqt/ui
  └── @refleqt/types
```

## Turborepo Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run tests across all packages |
| `pnpm --filter @refleqt/web dev` | Start only the web app |
| `pnpm --filter @refleqt/database prisma studio` | Open Prisma Studio |

## Notes

- The Refleqt-3.5 structure is located at `~/Refleqt-3.5/`
- Both codebases can run simultaneously on different ports
- Gradual migration: move features one at a time from 3.0 to 3.5

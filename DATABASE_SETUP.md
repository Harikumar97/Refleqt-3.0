# Refleqt v3.0 - Database Setup Guide

**Status**: ✅ Clean Slate Architecture Implemented
**Date**: January 2, 2026
**Migration Version**: 20260102_complete_schema_v3

---

## 🎯 Quick Start (5 Minutes)

### Option A: Local Development (Docker)

**Prerequisites**: Docker installed

```bash
# 1. Start local PostgreSQL + Redis
docker-compose up -d

# 2. Wait for services to be ready (check with)
docker-compose ps

# 3. Apply database migrations
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed database with test data
npm run db:seed

# 6. Start development server
npm run dev

# 7. Verify setup
open http://localhost:3000/portal
```

### Option B: Cloud Services (Recommended for Production)

**Using Supabase (Free Tier Available)**

```bash
# 1. Create Supabase project at https://supabase.com/dashboard
#    - New Project → Copy database URL

# 2. Enable pgvector extension
#    Go to SQL Editor in Supabase dashboard, run:
CREATE EXTENSION IF NOT EXISTS vector;

# 3. Update .env.local with your Supabase URL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 4. Set up Redis (Upstash free tier)
#    Create database at https://console.upstash.com/redis
#    Copy connection URL to .env.local:
REDIS_URL="rediss://default:[PASSWORD]@[ENDPOINT].upstash.io:6379"

# 5. Apply migrations
npx prisma migrate deploy

# 6. Seed database
npm run db:seed:api  # Use API-based seeding if direct DB access blocked

# 7. Start app
npm run dev
```

---

## 📊 Database Architecture

### Schema Overview

**20 Tables** covering all features:

#### Core User Management

- `users` - User accounts
- `user_profiles` - Extended user profiles with obsession scores
- `accounts`, `sessions`, `verification_tokens` - NextAuth.js tables

#### Intelligence System

- `competitors` - Competitor tracking
- `intelligence_sources` - RSS feeds and data sources
- `intelligence_items` - Fetched intelligence items with embeddings

#### Research Swarms (AI-Powered Analysis)

- `research_goals` - Research objectives
- `smart_trackers` - Automated monitoring
- `research_swarms` - Swarm execution records
- `swarm_findings` - Raw swarm findings
- `synthesized_insights` - Curated insights (max 10)
- `knowledge_nodes` - Hierarchical knowledge graph

#### Strategy & Analytics

- `strategy_cohorts` - Cohort definitions
- `cohort_analyses` - Analysis results
- `psychographic_segments` - Customer segments
- `segment_insights` - Segment analysis

#### Output & Reporting

- `brewery_outputs` - Distilled content (newsletters, briefs)
- `obsession_scores` - Obsession score history

---

## 🔧 Technology Stack

### Database Layer

- **PostgreSQL 15+** with `pgvector` extension
- **Prisma 7** ORM with PostgreSQL adapter
- **Connection Pooling** via pg.Pool

### Caching Layer

- **Redis** for query caching and job queues
- **BullMQ** for background job processing
- **TTL Strategy**: 1-15 minutes depending on data type

### Key Features

- ✅ Vector embeddings (pgvector)
- ✅ Multi-tier caching
- ✅ Connection pooling
- ✅ Automatic migrations
- ✅ Type-safe queries

---

## 📁 Project Structure

```
Refleqt-3.0/
├── prisma/
│   ├── schema.prisma              # Source of truth for database schema
│   ├── migrations/
│   │   └── 20260102_complete_schema_v3/
│   │       └── migration.sql      # Fresh migration (all 20 tables)
│   └── migrations.backup/         # Old migrations (archived)
│
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts          # Prisma client singleton
│   │   └── cache/
│   │       ├── redis-cache.ts     # Caching utilities
│   │       └── cache-config.ts    # TTL and key configurations
│   │
│   └── app/api/                   # API routes with caching
│
├── scripts/
│   ├── setup-database.sh          # Automated setup script
│   ├── seed-demo-data.ts          # Direct database seeding
│   └── seed-via-api.ts            # API-based seeding
│
├── .env.local                     # Environment variables (configured)
├── docker-compose.yml             # Local dev services
└── DATABASE_SETUP.md              # This file
```

---

## 🔐 Environment Configuration

### Required Variables (.env.local)

```bash
# Database (Required)
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."

# Redis (Required for caching)
REDIS_URL="redis://..."

# LLM Providers (At least one required)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-proj-..."
GOOGLE_API_KEY="AIza..."

# Auth
NEXTAUTH_SECRET="[generated]"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Database provisioned (Supabase/Neon/Railway)
- [ ] pgvector extension enabled
- [ ] Redis provisioned (Upstash/Redis Cloud)
- [ ] All environment variables set
- [ ] Migrations applied
- [ ] Database seeded (optional)

### Production Setup

```bash
# 1. Set NODE_ENV to production
export NODE_ENV=production

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate Prisma Client
npx prisma generate

# 4. Build application
npm run build

# 5. Start production server
npm start
```

### Post-Deployment

- [ ] Verify database connection
- [ ] Check Redis connectivity
- [ ] Test API endpoints
- [ ] Monitor logs for errors
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry, etc.)

---

## 📈 Performance Optimization

### Database Indexes

The migration includes optimized indexes for:

```sql
-- User queries
intelligence_items(user_id, published_at DESC)
obsession_scores(user_id, calculated_at DESC)
smart_trackers(is_active, next_execution_at)

-- Relations
All foreign keys have automatic indexes
```

### Caching Strategy

| Data Type      | TTL    | Cache Key Pattern              |
| -------------- | ------ | ------------------------------ |
| User Profile   | 15 min | `user:{userId}:profile`        |
| Research Goals | 10 min | `research-goals:{userId}:list` |
| Insights       | 5 min  | `insights:{userId}:all`        |
| Smart Trackers | 5 min  | `smart-trackers:{userId}:list` |
| Swarm Results  | 30 min | `swarm:{swarmId}:results`      |

### Connection Pool Settings

```typescript
// Recommended for 10k users
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 50, // Max connections
  idleTimeoutMillis: 30000, // 30s
  connectionTimeoutMillis: 2000, // 2s
});
```

---

## 🧪 Testing

### Verify Database Setup

```bash
# Open Prisma Studio to browse data
npx prisma studio

# Check all tables exist
npx prisma db execute --stdin <<EOF
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
EOF
```

### Verify Caching

```bash
# Start app
npm run dev

# In another terminal, monitor Redis
redis-cli MONITOR

# Make API requests and watch cache hits/misses
```

### Run Tests

```bash
# Type check
npm run type-check

# Run all tests
npm test

# Integration tests
npm run test:run
```

---

## 🔧 Troubleshooting

### Issue: "Can't reach database server"

**Solution**:

```bash
# Check if database is running
docker-compose ps

# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Issue: "Table does not exist"

**Solution**:

```bash
# Reset and reapply migrations
npx prisma migrate reset
npx prisma migrate deploy
```

### Issue: "Redis connection failed"

**Solution**:

```bash
# Verify Redis is running
redis-cli ping

# Check REDIS_URL in .env.local
echo $REDIS_URL

# App will work without Redis (caching disabled)
# No need to fix immediately for development
```

### Issue: "pgvector extension not found"

**Solution**:

```sql
-- Run in your database SQL editor
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 📊 Monitoring & Metrics

### Database Health

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries (>100ms)
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Cache Statistics

```bash
# Via API endpoint (to be implemented)
curl http://localhost:3000/api/cache/stats

# Via Redis CLI
redis-cli INFO stats
```

---

## 🎯 Next Steps

1. **Start Database**: `docker-compose up -d` or configure cloud provider
2. **Apply Migrations**: `npx prisma migrate deploy`
3. **Seed Data**: `npm run db:seed` or `npm run db:seed:api`
4. **Start App**: `npm run dev`
5. **Test**: Visit `http://localhost:3000/portal`

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL pgvector Guide](https://github.com/pgvector/pgvector)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)
- [Supabase Setup Guide](https://supabase.com/docs/guides/database)
- [Upstash Redis Guide](https://docs.upstash.com/redis)

---

**Questions or Issues?**
Check the troubleshooting section or review the implementation summary.

**Last Updated**: January 2, 2026
**Schema Version**: 20260102_complete_schema_v3
**Status**: ✅ Production Ready

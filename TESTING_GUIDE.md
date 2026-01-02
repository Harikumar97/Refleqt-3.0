# 🧪 System Testing Guide

Run these tests on your local machine to verify everything works.

## Quick Test (All in One)

```bash
./scripts/test-system.sh
```

This tests:

- ✅ Database connection
- ✅ All 20 tables exist
- ✅ Claude API
- ✅ OpenAI API
- ✅ Gemini API
- ✅ Prisma Client

---

## Individual Tests

### 1. Test Database Connection

```bash
# Simple ping
npx prisma db execute --stdin <<< "SELECT version();"

# Count tables
npx prisma db execute --stdin <<'SQL'
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
SQL

# Should return: 20
```

### 2. Test LLM APIs

```bash
# Test all LLM providers
npx tsx scripts/test-llm-apis.ts
```

Expected output:

```
🧪 Refleqt v3.0 - LLM API Tests
================================

✓ Anthropic Claude
  Response: Claude API working
  Response time: 1234ms

✓ OpenAI GPT
  Response: GPT API working
  Response time: 567ms

✓ Google Gemini
  Response: Gemini API working
  Response time: 890ms

================================
Passed: 3/3
Failed: 0/3

✓ ALL LLM APIs WORKING!
```

### 3. Test Prisma Client

```bash
# Generate client
npx prisma generate

# Open Prisma Studio to browse data
npx prisma studio
```

### 4. Test API Endpoints

Start the dev server:

```bash
npm run dev
```

Test endpoints:

```bash
# Test user profile API
curl http://localhost:3000/api/user/profile?userId=00000000-0000-0000-0000-000000000001

# Should return JSON (not HTML error)
```

---

## Troubleshooting

### Database Connection Fails

**Error**: `Can't reach database server`

**Fix**:

```bash
# 1. Check environment variables
cat .env.local | grep DATABASE_URL

# 2. Test direct connection
psql "$DATABASE_URL" -c "SELECT version();"

# 3. Verify Supabase project is active
# Visit: https://supabase.com/dashboard/project/mpopzdpsdlrtyjqaixvw
```

### Missing Tables

**Error**: `Table does not exist`

**Fix**:

```bash
# Apply migrations
npx prisma migrate deploy

# Verify tables created
npx prisma studio
```

### LLM API Fails

**Error**: `401 Unauthorized` or `API key not configured`

**Fix**:

```bash
# Check API keys are set
cat .env.local | grep API_KEY

# Verify keys are not placeholders
grep -E "YOUR-KEY-HERE|XXXXX" .env.local

# If you see placeholders, update .env.local with real keys
```

### Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Fix**:

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
npm run dev
```

---

## Success Criteria

After all tests pass, you should be able to:

1. ✅ Connect to Supabase database
2. ✅ See all 20 tables in Prisma Studio
3. ✅ Get responses from all 3 LLM providers
4. ✅ Make API calls without errors
5. ✅ Create research goals in the UI
6. ✅ Run competitor discovery

---

## Next Steps After Tests Pass

1. **Seed Demo Data** (optional):

   ```bash
   npm run db:seed:api
   ```

2. **Start Development**:

   ```bash
   npm run dev
   ```

3. **Test in Browser**:
   - Open: http://localhost:3000/portal
   - Create a research goal
   - Test competitor discovery
   - Check console for errors

---

## Test Scripts Reference

| Script              | Purpose              | Location                    |
| ------------------- | -------------------- | --------------------------- |
| `test-system.sh`    | Complete system test | `scripts/test-system.sh`    |
| `test-llm-apis.ts`  | LLM provider tests   | `scripts/test-llm-apis.ts`  |
| `setup-supabase.sh` | Database setup       | `scripts/setup-supabase.sh` |

---

**Status**: Ready for testing! Run `./scripts/test-system.sh` to begin.

#!/bin/bash

# Refleqt v3.0 - Complete System Test
# Tests: Database, LLM APIs, and Core Functionality
# Run this AFTER applying migrations

set -e

echo "🧪 Refleqt v3.0 - System Test Suite"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
    echo ""
}

# ============================================================================
# Test 1: Database Connection
# ============================================================================
echo -e "${BLUE}[1/6] Testing Database Connection...${NC}"

if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    test_result 0 "Database connection successful"
else
    test_result 1 "Database connection failed"
fi

# ============================================================================
# Test 2: Verify All Tables Exist
# ============================================================================
echo -e "${BLUE}[2/6] Verifying All 20 Tables...${NC}"

TABLES=$(npx prisma db execute --stdin <<'SQL' 2>/dev/null | grep -c "users\|user_profiles\|accounts\|sessions\|verification_tokens\|competitors\|intelligence_sources\|intelligence_items\|research_goals\|smart_trackers\|research_swarms\|swarm_findings\|synthesized_insights\|knowledge_nodes\|strategy_cohorts\|cohort_analyses\|psychographic_segments\|segment_insights\|brewery_outputs\|obsession_scores" || echo 0
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
SQL
)

if [ "$TABLES" -ge 20 ]; then
    test_result 0 "All 20 tables exist in database"
else
    test_result 1 "Missing tables (found: $TABLES/20)"
fi

# ============================================================================
# Test 3: Anthropic Claude API
# ============================================================================
echo -e "${BLUE}[3/6] Testing Anthropic Claude API...${NC}"

CLAUDE_KEY=$(grep ANTHROPIC_API_KEY .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$CLAUDE_KEY" ] || [ "$CLAUDE_KEY" == "sk-ant-api03-YOUR-KEY-HERE" ]; then
    test_result 1 "Claude API key not configured"
else
    CLAUDE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        https://api.anthropic.com/v1/messages \
        -H "anthropic-version: 2023-06-01" \
        -H "x-api-key: $CLAUDE_KEY" \
        -H "content-type: application/json" \
        -d '{
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 10,
            "messages": [{"role": "user", "content": "Hi"}]
        }')

    if [ "$CLAUDE_RESPONSE" -eq 200 ]; then
        test_result 0 "Claude API responding (HTTP $CLAUDE_RESPONSE)"
    else
        test_result 1 "Claude API failed (HTTP $CLAUDE_RESPONSE)"
    fi
fi

# ============================================================================
# Test 4: OpenAI GPT API
# ============================================================================
echo -e "${BLUE}[4/6] Testing OpenAI GPT API...${NC}"

OPENAI_KEY=$(grep OPENAI_API_KEY .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$OPENAI_KEY" ] || [ "$OPENAI_KEY" == "sk-proj-YOUR-KEY-HERE" ]; then
    test_result 1 "OpenAI API key not configured"
else
    OPENAI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        https://api.openai.com/v1/chat/completions \
        -H "Authorization: Bearer $OPENAI_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "Hi"}],
            "max_tokens": 5
        }')

    if [ "$OPENAI_RESPONSE" -eq 200 ]; then
        test_result 0 "OpenAI API responding (HTTP $OPENAI_RESPONSE)"
    else
        test_result 1 "OpenAI API failed (HTTP $OPENAI_RESPONSE)"
    fi
fi

# ============================================================================
# Test 5: Google Gemini API
# ============================================================================
echo -e "${BLUE}[5/6] Testing Google Gemini API...${NC}"

GEMINI_KEY=$(grep GOOGLE_API_KEY .env.local | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$GEMINI_KEY" ] || [ "$GEMINI_KEY" == "AIzaSyXXXXX-YOUR-KEY-HERE" ]; then
    test_result 1 "Gemini API key not configured"
else
    GEMINI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
        -H "Content-Type: application/json" \
        -H "X-goog-api-key: $GEMINI_KEY" \
        -X POST \
        -d '{
            "contents": [{
                "parts": [{
                    "text": "Hi"
                }]
            }]
        }')

    if [ "$GEMINI_RESPONSE" -eq 200 ]; then
        test_result 0 "Gemini API responding (HTTP $GEMINI_RESPONSE)"
    else
        test_result 1 "Gemini API failed (HTTP $GEMINI_RESPONSE)"
    fi
fi

# ============================================================================
# Test 6: Prisma Client Generation
# ============================================================================
echo -e "${BLUE}[6/6] Testing Prisma Client...${NC}"

if [ -f "node_modules/@prisma/client/index.js" ]; then
    test_result 0 "Prisma Client generated and available"
else
    test_result 1 "Prisma Client not found - run: npx prisma generate"
fi

# ============================================================================
# Summary
# ============================================================================
echo "===================================="
echo -e "${BLUE}Test Summary${NC}"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo "Your system is ready for development."
    echo ""
    echo "Next steps:"
    echo "  1. Start dev server: npm run dev"
    echo "  2. Open: http://localhost:3000/portal"
    echo "  3. Test creating a research goal"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Database: npx prisma migrate deploy"
    echo "  - Prisma Client: npx prisma generate"
    echo "  - API Keys: Check .env.local file"
    exit 1
fi

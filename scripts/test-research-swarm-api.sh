#!/bin/bash

# Research Swarms API Testing Script
# Usage: ./scripts/test-research-swarm-api.sh
# Requires: Development server running on http://localhost:3000

set -e

BASE_URL="http://localhost:3000"
USER_ID="test-user-$(date +%s)"
SWARM_ID=""

echo "🧪 Testing Research Swarms API Endpoints"
echo "========================================="
echo "User ID: $USER_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get Templates
echo -e "${YELLOW}Test 1: GET /api/research-swarm/templates${NC}"
response=$(curl -s "$BASE_URL/api/research-swarm/templates?userId=$USER_ID")
template_count=$(echo "$response" | jq '.templates | length')
if [ "$template_count" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $template_count templates${NC}"
else
    echo -e "${RED}✗ No templates found (run seed script first)${NC}"
fi
echo ""

# Test 2: Create Research Swarm
echo -e "${YELLOW}Test 2: POST /api/research-swarm/create${NC}"
create_response=$(curl -s -X POST "$BASE_URL/api/research-swarm/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"query\": \"Analyze top 5 competitors in AI agent space and identify key differentiators\",
    \"swarmType\": \"competitive\"
  }")

success=$(echo "$create_response" | jq -r '.success')
if [ "$success" = "true" ]; then
    SWARM_ID=$(echo "$create_response" | jq -r '.swarm.id')
    echo -e "${GREEN}✓ Created swarm: $SWARM_ID${NC}"
    echo "$create_response" | jq '.swarm'
else
    echo -e "${RED}✗ Failed to create swarm${NC}"
    echo "$create_response" | jq '.'
fi
echo ""

# Test 3: Get Active Swarms
echo -e "${YELLOW}Test 3: GET /api/research-swarm/active${NC}"
active_response=$(curl -s "$BASE_URL/api/research-swarm/active?userId=$USER_ID")
active_count=$(echo "$active_response" | jq '.swarms | length')
echo -e "${GREEN}✓ Found $active_count active/recent swarms${NC}"
echo "$active_response" | jq '.swarms[0:3]'
echo ""

# Test 4: Get User Stats
echo -e "${YELLOW}Test 4: GET /api/research-swarm/stats${NC}"
stats_response=$(curl -s "$BASE_URL/api/research-swarm/stats?userId=$USER_ID")
stats_success=$(echo "$stats_response" | jq -r '.success')
if [ "$stats_success" = "true" ]; then
    echo -e "${GREEN}✓ Retrieved user stats${NC}"
    echo "$stats_response" | jq '.stats'
else
    echo -e "${RED}✗ Failed to get stats${NC}"
    echo "$stats_response" | jq '.'
fi
echo ""

# Test 5: Get Swarm Results (will fail if swarm is not completed)
if [ -n "$SWARM_ID" ]; then
    echo -e "${YELLOW}Test 5: GET /api/research-swarm/$SWARM_ID/results${NC}"
    results_response=$(curl -s "$BASE_URL/api/research-swarm/$SWARM_ID/results?userId=$USER_ID")
    results_success=$(echo "$results_response" | jq -r '.success')
    if [ "$results_success" = "true" ]; then
        echo -e "${GREEN}✓ Retrieved swarm results${NC}"
        echo "$results_response" | jq '.results'
    else
        error_msg=$(echo "$results_response" | jq -r '.error')
        echo -e "${YELLOW}⚠ Expected failure: $error_msg${NC}"
        echo "(This is normal - swarm needs to be completed first)"
    fi
    echo ""
fi

# Test 6: Create Custom Template
echo -e "${YELLOW}Test 6: POST /api/research-swarm/templates${NC}"
template_response=$(curl -s -X POST "$BASE_URL/api/research-swarm/templates" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"title\": \"Custom Test Template\",
    \"description\": \"A test template created by API test script\",
    \"icon\": \"🧪\",
    \"query\": \"This is a test query for custom template creation\",
    \"swarmType\": \"market\",
    \"isPublic\": true
  }")

template_success=$(echo "$template_response" | jq -r '.success')
if [ "$template_success" = "true" ]; then
    echo -e "${GREEN}✓ Created custom template${NC}"
    echo "$template_response" | jq '.template'
else
    echo -e "${RED}✗ Failed to create template${NC}"
    echo "$template_response" | jq '.'
fi
echo ""

# Test 7: Validation Tests
echo -e "${YELLOW}Test 7: Validation Tests${NC}"

# 7a: Query too short
echo "  7a: Query too short (should fail)"
short_query_response=$(curl -s -X POST "$BASE_URL/api/research-swarm/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"query\": \"short\",
    \"swarmType\": \"competitive\"
  }")
short_query_success=$(echo "$short_query_response" | jq -r '.success')
if [ "$short_query_success" = "false" ]; then
    echo -e "  ${GREEN}✓ Correctly rejected short query${NC}"
else
    echo -e "  ${RED}✗ Validation failed - accepted short query${NC}"
fi

# 7b: Invalid swarm type
echo "  7b: Invalid swarm type (should fail)"
invalid_type_response=$(curl -s -X POST "$BASE_URL/api/research-swarm/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"query\": \"This is a valid query with sufficient length\",
    \"swarmType\": \"invalid_type\"
  }")
invalid_type_success=$(echo "$invalid_type_response" | jq -r '.success')
if [ "$invalid_type_success" = "false" ]; then
    echo -e "  ${GREEN}✓ Correctly rejected invalid swarm type${NC}"
else
    echo -e "  ${RED}✗ Validation failed - accepted invalid type${NC}"
fi

# 7c: Missing userId
echo "  7c: Missing userId (should fail)"
missing_user_response=$(curl -s -X POST "$BASE_URL/api/research-swarm/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"This is a valid query with sufficient length\",
    \"swarmType\": \"competitive\"
  }")
missing_user_success=$(echo "$missing_user_response" | jq -r '.success')
if [ "$missing_user_success" = "false" ]; then
    echo -e "  ${GREEN}✓ Correctly rejected request without userId${NC}"
else
    echo -e "  ${RED}✗ Validation failed - accepted request without userId${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Implement BullMQ job queue to actually process swarms"
echo "2. Integrate LangGraph for multi-agent orchestration"
echo "3. Build frontend dashboard to consume these APIs"
echo ""

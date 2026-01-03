# 🔐 LLM Security Architecture

## ✅ Secure Pattern: Backend Proxy

Your API keys are **NEVER exposed to the client**. All LLM calls go through your backend proxy.

```
┌─────────────┐
│   Browser   │
│  (Frontend) │
└──────┬──────┘
       │
       │ POST /api/llm/proxy
       │ { provider: 'claude', messages: [...] }
       ▼
┌─────────────────────────┐
│   Your Next.js Server   │
│   /api/llm/proxy        │
│                         │
│  - Authenticates user   │
│  - Reads API keys from  │
│    process.env (server) │
│  - Calls LLM provider   │
└──────┬──────────────────┘
       │
       │ API key in headers
       ▼
┌─────────────────────────┐
│  Claude / OpenAI /      │
│  Gemini API             │
└─────────────────────────┘
```

---

## 🚨 What NOT to Do

**❌ NEVER do this (exposes keys to client):**

```typescript
// ❌ BAD - Frontend component
const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY; // EXPOSED!

fetch("https://api.anthropic.com/v1/messages", {
  headers: {
    "x-api-key": apiKey, // ❌ Key visible in browser DevTools!
  },
});
```

---

## ✅ What TO Do

**✓ Use the backend proxy:**

```typescript
// ✓ GOOD - Frontend component
import { callClaude } from "@/lib/llm/client";

const response = await callClaude([{ role: "user", content: "Hello!" }]);

// Keys stay on server ✓
// Client only sees the response ✓
```

---

## 🔧 Implementation

### 1. Backend Proxy (Server-Side Only)

**File**: `src/app/api/llm/proxy/route.ts`

- Reads `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` from `process.env`
- Keys **NEVER** sent to client
- Authenticates user (TODO: add NextAuth check)
- Forwards request to LLM provider

### 2. Client Library (Safe for Frontend)

**File**: `src/lib/llm/client.ts`

```typescript
import { callLLM, callClaude, callGPT, callGemini } from "@/lib/llm/client";

// Use in any component - completely safe
const response = await callClaude([
  { role: "user", content: "Analyze this..." },
]);
```

---

## 🔒 Security Checklist

- [x] ✅ API keys in `.env.local` (not `.env`)
- [x] ✅ `.env.local` in `.gitignore`
- [x] ✅ Keys accessed via `process.env["KEY"]` (server-side only)
- [x] ✅ Backend proxy endpoint created (`/api/llm/proxy`)
- [x] ✅ Client library calls proxy (not LLM APIs directly)
- [ ] ⏳ Add NextAuth authentication to proxy
- [ ] ⏳ Add rate limiting per user
- [ ] ⏳ Add request logging for security audit

---

## 🧪 Testing the Proxy

### Test from Frontend

```typescript
// In any React component
const handleTest = async () => {
  const response = await callClaude([{ role: "user", content: "Say hello!" }]);

  console.log(response.response); // "Hello!"
};
```

### Test from Terminal

```bash
# Test Claude
curl http://localhost:3000/api/llm/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "claude",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Test OpenAI
curl http://localhost:3000/api/llm/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Test Gemini
curl http://localhost:3000/api/llm/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📊 Environment Variables

**IMPORTANT**: Use standard env vars, NOT `NEXT_PUBLIC_*`

```bash
# ✅ CORRECT - Server-side only
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-proj-..."
GOOGLE_API_KEY="AIza..."

# ❌ WRONG - These are exposed to client!
NEXT_PUBLIC_ANTHROPIC_API_KEY="sk-ant-..."  # DON'T DO THIS!
NEXT_PUBLIC_OPENAI_API_KEY="sk-proj-..."    # DON'T DO THIS!
```

---

## 🎯 Usage in Existing Code

### Update Research Swarms

```typescript
// OLD (if any direct calls exist)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// NEW
import { callClaude } from "@/lib/llm/client";

const response = await callClaude([{ role: "user", content: query }]);
```

### Update Competitor Discovery

```typescript
// Use the proxy
import { callGPT } from "@/lib/llm/client";

const analysis = await callGPT([
  { role: "user", content: `Analyze competitors: ${query}` },
]);
```

---

## 🔐 Adding Authentication

To prevent unauthorized LLM usage, add NextAuth:

```typescript
// src/app/api/llm/proxy/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Authenticate user
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Continue with LLM call...
}
```

---

## 📈 Rate Limiting (Future)

Add per-user rate limiting:

```typescript
// Pseudo-code
const userLimits = await getRateLimits(session.user.id);

if (userLimits.exceeded) {
  return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
}
```

---

## ✅ Benefits of This Approach

1. **Security**: API keys never exposed to client
2. **Control**: Add auth, rate limiting, logging at one point
3. **Flexibility**: Switch LLM providers without changing frontend
4. **Cost Management**: Track usage per user
5. **Debugging**: Log all LLM calls in one place

---

**Status**: ✅ Secure backend proxy implemented
**Next**: Add authentication and rate limiting

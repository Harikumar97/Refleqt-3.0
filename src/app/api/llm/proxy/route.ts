/**
 * LLM Proxy API - Secure Backend for LLM Calls
 *
 * SECURITY: All API keys stay server-side. Frontend calls this proxy.
 * This endpoint authenticates requests and forwards to LLM providers.
 *
 * POST /api/llm/proxy
 *
 * Body:
 * {
 *   provider: 'claude' | 'openai' | 'gemini',
 *   model?: string,
 *   messages: Array<{role: string, content: string}>,
 *   max_tokens?: number,
 *   temperature?: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Type Definitions
// ============================================================================

interface LLMRequest {
  provider: "claude" | "openai" | "gemini";
  model?: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function callClaude(
  messages: Array<{ role: string; content: string }>,
  model: string = "claude-3-5-sonnet-20241022",
  maxTokens: number = 1024,
  temperature: number = 0.7
) {
  const apiKey = process.env["ANTHROPIC_API_KEY"];

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  return await response.json();
}

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  model: string = "gpt-4o-mini",
  maxTokens: number = 1024,
  temperature: number = 0.7
) {
  const apiKey = process.env["OPENAI_API_KEY"];

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  return await response.json();
}

async function callGemini(
  messages: Array<{ role: string; content: string }>,
  model: string = "gemini-2.0-flash",
  temperature: number = 0.7
) {
  const apiKey = process.env["GOOGLE_API_KEY"];

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  // Convert messages to Gemini format
  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  return await response.json();
}

// ============================================================================
// API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: LLMRequest = await request.json();

    // Validate request
    if (!body.provider || !body.messages || body.messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request. Required: provider, messages",
        },
        { status: 400 }
      );
    }

    // TODO: Add user authentication here
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const maxTokens = body.max_tokens || 1024;
    const temperature = body.temperature || 0.7;

    let result;

    // Route to appropriate LLM provider
    switch (body.provider) {
      case "claude":
        result = await callClaude(
          body.messages,
          body.model,
          maxTokens,
          temperature
        );
        return NextResponse.json({
          success: true,
          provider: "claude",
          response: result.content[0].text,
          usage: result.usage,
        });

      case "openai":
        result = await callOpenAI(
          body.messages,
          body.model,
          maxTokens,
          temperature
        );
        return NextResponse.json({
          success: true,
          provider: "openai",
          response: result.choices[0].message.content,
          usage: result.usage,
        });

      case "gemini":
        result = await callGemini(body.messages, body.model, temperature);
        return NextResponse.json({
          success: true,
          provider: "gemini",
          response: result.candidates[0].content.parts[0].text,
          usage: result.usageMetadata,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid provider. Must be: claude, openai, or gemini",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[LLM Proxy] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

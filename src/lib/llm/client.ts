/**
 * LLM Client Library
 *
 * SECURITY: This client calls our backend proxy, NOT LLM APIs directly.
 * API keys stay server-side where they belong.
 *
 * Usage:
 * ```typescript
 * import { callLLM } from '@/lib/llm/client';
 *
 * const response = await callLLM({
 *   provider: 'claude',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 * ```
 */

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMRequest {
  provider: "claude" | "openai" | "gemini";
  model?: string;
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  success: boolean;
  provider?: string;
  response?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: string;
}

/**
 * Call LLM via secure backend proxy
 *
 * SECURITY: This function calls /api/llm/proxy on YOUR server.
 * Your server holds the API keys and forwards requests to LLM providers.
 * Keys never exposed to the client.
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  try {
    const response = await fetch("/api/llm/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper: Call Claude specifically
 */
export async function callClaude(
  messages: LLMMessage[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }
): Promise<LLMResponse> {
  return callLLM({
    provider: "claude",
    messages,
    ...options,
  });
}

/**
 * Helper: Call OpenAI GPT specifically
 */
export async function callGPT(
  messages: LLMMessage[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }
): Promise<LLMResponse> {
  return callLLM({
    provider: "openai",
    messages,
    ...options,
  });
}

/**
 * Helper: Call Google Gemini specifically
 */
export async function callGemini(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<LLMResponse> {
  return callLLM({
    provider: "gemini",
    messages,
    ...options,
  });
}

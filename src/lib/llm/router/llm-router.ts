"use server";

/**
 * LLM Router
 * Intelligently routes requests to optimal providers with fallback
 *
 * @security This module MUST only be imported server-side (API routes).
 * The "use server" directive prevents client-side imports.
 *
 * For client-side LLM calls, use @/lib/llm/client instead.
 */

import { assert } from "@/utils/assert";
import { SafeResult } from "@/utils/safety";
import type {
  ILLMProvider,
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMTask,
  RouterConfig,
} from "../types";
import { AnthropicProvider } from "../providers/anthropic-provider";
import { OpenAIProvider } from "../providers/openai-provider";
import { GoogleProvider } from "../providers/google-provider";
import {
  DeepSeekProvider,
  PerplexityProvider,
  GrokProvider,
} from "../providers/stub-provider";

/**
 * Default task-to-provider mapping
 * Based on each model's strengths
 */
const DEFAULT_TASK_MAPPING: Map<LLMTask, LLMProvider> = new Map([
  ["competitive_analysis", "anthropic-claude"], // Claude excels at analysis
  ["insight_generation", "anthropic-claude"], // Claude excels at insights
  ["text_embeddings", "openai-gpt"], // OpenAI has best embedding support
  ["research_search", "perplexity"], // Perplexity designed for search
  ["social_media_analysis", "grok"], // Grok native to X/Twitter
  ["data_transformation", "deepseek"], // DeepSeek optimized for code
  ["long_document_summary", "google-gemini"], // Gemini has largest context
  ["content_filtering", "openai-gpt"], // GPT-3.5 fast and cheap
]);

/**
 * Default fallback chain
 * If primary fails, try these in order
 */
const DEFAULT_FALLBACK_CHAIN: LLMProvider[] = [
  "anthropic-claude",
  "openai-gpt",
  "google-gemini",
  "deepseek",
  "perplexity",
  "grok",
];

export class LLMRouter {
  private providers: Map<LLMProvider, ILLMProvider>;
  private config: RouterConfig;

  constructor(
    providers: Map<LLMProvider, ILLMProvider>,
    config?: Partial<RouterConfig>
  ) {
    assert(providers.size > 0, "At least one provider must be configured");

    this.providers = providers;
    this.config = {
      defaultProvider: config?.defaultProvider ?? "anthropic-claude",
      fallbackProviders: config?.fallbackProviders ?? DEFAULT_FALLBACK_CHAIN,
      enableAutoFallback: config?.enableAutoFallback ?? true,
      maxRetries: config?.maxRetries ?? 3,
      taskMapping: config?.taskMapping ?? DEFAULT_TASK_MAPPING,
    };
  }

  /**
   * Route request to optimal provider with fallback
   */
  async complete(request: LLMRequest): Promise<SafeResult<LLMResponse>> {
    // Get optimal provider for this task
    const primaryProvider = this.getProviderForTask(request.task);

    // Try primary provider first
    const primaryResult = await this.tryProvider(primaryProvider, request);
    if (primaryResult.success) {
      return primaryResult;
    }

    // If auto-fallback disabled, return error
    if (!this.config.enableAutoFallback) {
      return primaryResult;
    }

    // Try fallback providers
    const fallbackProviders =
      this.config.fallbackProviders?.filter((p) => p !== primaryProvider) ?? [];

    for (const fallbackProvider of fallbackProviders) {
      const fallbackResult = await this.tryProvider(fallbackProvider, request);

      if (fallbackResult.success) {
        console.log(
          `Fallback successful: ${primaryProvider} → ${fallbackProvider}`
        );
        return fallbackResult;
      }
    }

    // All providers failed
    return {
      success: false,
      error: new Error(
        `All providers failed for task: ${request.task}. Last error: ${primaryResult.error?.message}`
      ),
    };
  }

  /**
   * Generate embeddings (delegates to provider that supports it)
   */
  async embed(text: string): Promise<SafeResult<number[]>> {
    // OpenAI is best for embeddings
    const openaiProvider = this.providers.get("openai-gpt");
    if (openaiProvider && openaiProvider.isAvailable) {
      return openaiProvider.embed(text);
    }

    // Fallback to Google Gemini
    const googleProvider = this.providers.get("google-gemini");
    if (googleProvider && googleProvider.isAvailable) {
      return googleProvider.embed(text);
    }

    return {
      success: false,
      error: new Error("No embedding provider available"),
    };
  }

  /**
   * Get optimal provider for a task
   */
  private getProviderForTask(task: LLMTask): LLMProvider {
    const mappedProvider = this.config.taskMapping.get(task);

    if (mappedProvider && this.providers.has(mappedProvider)) {
      return mappedProvider;
    }

    // Fallback to default provider
    return this.config.defaultProvider ?? "anthropic-claude";
  }

  /**
   * Try a specific provider with error handling
   */
  private async tryProvider(
    providerName: LLMProvider,
    request: LLMRequest
  ): Promise<SafeResult<LLMResponse>> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      return {
        success: false,
        error: new Error(`Provider ${providerName} not configured`),
      };
    }

    if (!provider.isAvailable) {
      return {
        success: false,
        error: new Error(
          `Provider ${providerName} unavailable (quota exceeded)`
        ),
      };
    }

    return provider.complete(request);
  }

  /**
   * Get usage stats for all providers
   */
  async getUsageStats(): Promise<Map<LLMProvider, any>> {
    const stats = new Map();

    for (const [name, provider] of this.providers) {
      const usage = await provider.getUsage();
      stats.set(name, usage);
    }

    return stats;
  }

  /**
   * Create router from environment variables
   */
  static fromEnv(): LLMRouter {
    const providers = new Map<LLMProvider, ILLMProvider>();

    // Anthropic Claude
    const anthropicKey = process.env["ANTHROPIC_API_KEY"];
    if (anthropicKey) {
      providers.set("anthropic-claude", new AnthropicProvider(anthropicKey));
    }

    // OpenAI
    const openaiKey = process.env["OPENAI_API_KEY"];
    if (openaiKey) {
      providers.set("openai-gpt", new OpenAIProvider(openaiKey));
    }

    // Google Gemini
    const googleKey = process.env["GOOGLE_API_KEY"];
    if (googleKey) {
      providers.set("google-gemini", new GoogleProvider(googleKey));
    }

    // DeepSeek
    const deepseekKey = process.env["DEEPSEEK_API_KEY"];
    if (deepseekKey) {
      providers.set("deepseek", new DeepSeekProvider(deepseekKey));
    }

    // Perplexity
    const perplexityKey = process.env["PERPLEXITY_API_KEY"];
    if (perplexityKey) {
      providers.set("perplexity", new PerplexityProvider(perplexityKey));
    }

    // Grok
    const grokKey = process.env["GROK_API_KEY"];
    if (grokKey) {
      providers.set("grok", new GrokProvider(grokKey));
    }

    if (providers.size === 0) {
      throw new Error("No LLM providers configured. Set API keys in .env");
    }

    return new LLMRouter(providers);
  }
}

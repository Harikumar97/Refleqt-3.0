import type { LLMProvider, LLMProviderClient, LLMConfig, LLMMessage, LLMCompletionOptions, LLMCompletionResult } from './types';
import { createAnthropicClient } from './providers/anthropic';
import { createOpenAIClient } from './providers/openai';
import { createGoogleClient } from './providers/google';

interface RouterConfig {
  anthropic?: { apiKey: string; defaultModel?: string };
  openai?: { apiKey: string; defaultModel?: string };
  google?: { apiKey: string; defaultModel?: string };
  defaultProvider: LLMProvider;
}

export class LLMRouter {
  private clients: Map<LLMProvider, LLMProviderClient> = new Map();
  private defaultProvider: LLMProvider;

  constructor(config: RouterConfig) {
    this.defaultProvider = config.defaultProvider;

    if (config.anthropic?.apiKey) {
      this.clients.set('anthropic', createAnthropicClient(config.anthropic.apiKey));
    }
    if (config.openai?.apiKey) {
      this.clients.set('openai', createOpenAIClient(config.openai.apiKey));
    }
    if (config.google?.apiKey) {
      this.clients.set('google', createGoogleClient(config.google.apiKey));
    }
  }

  getClient(provider?: LLMProvider): LLMProviderClient {
    const targetProvider = provider ?? this.defaultProvider;
    const client = this.clients.get(targetProvider);

    if (!client) {
      throw new Error(`LLM provider "${targetProvider}" is not configured`);
    }

    return client;
  }

  async complete(
    messages: LLMMessage[],
    options?: LLMCompletionOptions & { provider?: LLMProvider }
  ): Promise<LLMCompletionResult> {
    const client = this.getClient(options?.provider);
    return client.complete(messages, options);
  }

  async *stream(
    messages: LLMMessage[],
    options?: LLMCompletionOptions & { provider?: LLMProvider }
  ): AsyncIterable<string> {
    const client = this.getClient(options?.provider);

    if (!client.stream) {
      throw new Error('Streaming not supported for this provider');
    }

    yield* client.stream(messages, options);
  }

  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.clients.keys());
  }

  isProviderAvailable(provider: LLMProvider): boolean {
    return this.clients.has(provider);
  }
}

let routerInstance: LLMRouter | null = null;

export function initializeLLMRouter(config: RouterConfig): LLMRouter {
  routerInstance = new LLMRouter(config);
  return routerInstance;
}

export function getLLMRouter(): LLMRouter {
  if (!routerInstance) {
    throw new Error('LLM Router not initialized. Call initializeLLMRouter first.');
  }
  return routerInstance;
}

/**
 * LLM Router and Orchestrator
 * Unified interface for all LLM providers
 */

import { claude, ClaudeService } from './claude';
import { openai, OpenAIService } from './openai';
import { gemini, GeminiService } from './gemini';
import type { LLMProvider, LLMService, LLMMessage, LLMCompletionOptions, LLMResponse } from './types';

export * from './types';
export { ClaudeService, OpenAIService, GeminiService };

class LLMRouter {
  private providers: Map<LLMProvider, LLMService>;
  private defaultProvider: LLMProvider = 'claude';

  constructor() {
    this.providers = new Map([
      ['claude', claude],
      ['openai', openai],
      ['gemini', gemini],
    ]);
  }

  /**
   * Get a specific LLM provider
   */
  getProvider(provider: LLMProvider): LLMService {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Provider ${provider} not found`);
    }
    return service;
  }

  /**
   * Complete a prompt using the specified provider (or default)
   */
  async complete(
    prompt: string,
    provider?: LLMProvider,
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    const llm = this.getProvider(provider || this.defaultProvider);
    return llm.complete(prompt, options);
  }

  /**
   * Chat with a provider using message history
   */
  async chat(
    messages: LLMMessage[],
    provider?: LLMProvider,
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    const llm = this.getProvider(provider || this.defaultProvider);
    return llm.chat(messages, options);
  }

  /**
   * Run the same prompt across multiple providers in parallel
   * Useful for ensemble approaches or comparison
   */
  async multiProviderCompletion(
    prompt: string,
    providers: LLMProvider[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse[]> {
    const promises = providers.map((provider) => this.complete(prompt, provider, options));
    return Promise.all(promises);
  }

  /**
   * Intelligent routing based on task type
   */
  async smartComplete(
    prompt: string,
    taskType: 'research' | 'analysis' | 'creative' | 'code',
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    let provider: LLMProvider;

    switch (taskType) {
      case 'research':
      case 'analysis':
        provider = 'claude'; // Claude excels at analysis
        break;
      case 'creative':
        provider = 'openai'; // GPT-4 great for creative tasks
        break;
      case 'code':
        provider = 'claude'; // Claude Sonnet is excellent at code
        break;
      default:
        provider = this.defaultProvider;
    }

    return this.complete(prompt, provider, options);
  }
}

// Export singleton instance
export const llm = new LLMRouter();

// Export individual providers for direct access
export { claude, openai, gemini };

/**
 * Claude (Anthropic) LLM Provider
 * Integration with Anthropic's Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMService, LLMMessage, LLMCompletionOptions, LLMResponse } from './types';

export class ClaudeService implements LLMService {
  private client: Anthropic;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(prompt: string, options?: LLMCompletionOptions): Promise<LLMResponse> {
    const messages: LLMMessage[] = [{ role: 'user', content: prompt }];
    return this.chat(messages, options);
  }

  async chat(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 4096;

    // Convert messages to Claude format
    const claudeMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Extract system prompt
    const systemMessage = messages.find((m) => m.role === 'system');
    const system = options?.systemPrompt || systemMessage?.content;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: claudeMessages,
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';

      return {
        content: text,
        provider: 'claude',
        model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Lazy-loaded singleton
let _instance: ClaudeService | null = null;
export const claude = {
  get instance(): ClaudeService {
    if (!_instance) {
      _instance = new ClaudeService();
    }
    return _instance;
  },
  complete: async (prompt: string, options?: LLMCompletionOptions) => {
    return claude.instance.complete(prompt, options);
  },
  chat: async (messages: LLMMessage[], options?: LLMCompletionOptions) => {
    return claude.instance.chat(messages, options);
  },
} as LLMService;

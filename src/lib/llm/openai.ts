/**
 * OpenAI (ChatGPT) LLM Provider  
 * Integration with OpenAI's GPT models
 */

import OpenAI from 'openai';
import type { LLMService, LLMMessage, LLMCompletionOptions, LLMResponse } from './types';

export class OpenAIService implements LLMService {
  private client: OpenAI;
  private defaultModel = 'gpt-4o';

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env['OPENAI_API_KEY'],
    });
  }

  async complete(prompt: string, options?: LLMCompletionOptions): Promise<LLMResponse> {
    const messages: LLMMessage[] = [{ role: 'user', content: prompt }];
    return this.chat(messages, options);
  }

  async chat(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMResponse> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens;

    // Convert to OpenAI format
    const openaiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add system message if provided in options
    if (options?.systemPrompt && !messages.some((m) => m.role === 'system')) {
      openaiMessages.unshift({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: openaiMessages as any,
        temperature,
        ...(maxTokens && { max_tokens: maxTokens }),
      });

      const choice = response.choices?.[0];
      if (!choice) {
        throw new Error('No response choices returned from OpenAI');
      }
      const content = choice.message.content || '';

      return {
        content,
        provider: 'openai',
        model,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
            },
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Lazy-loaded singleton
let _instance: OpenAIService | null = null;
export const openai: LLMService & { instance: OpenAIService } = {
  get instance(): OpenAIService {
    if (!_instance) {
      _instance = new OpenAIService();
    }
    return _instance;
  },
  complete: async (prompt: string, options?: LLMCompletionOptions) => {
    return openai.instance.complete(prompt, options);
  },
  chat: async (messages: LLMMessage[], options?: LLMCompletionOptions) => {
    return openai.instance.chat(messages, options);
  },
};

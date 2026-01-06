import Anthropic from '@anthropic-ai/sdk';
import type { LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMProviderClient } from '../types';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS_DEFAULT = 4096;

export function createAnthropicClient(apiKey: string): LLMProviderClient {
  const client = new Anthropic({ apiKey });

  return {
    async complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMCompletionResult> {
      const systemPrompt = options?.systemPrompt ?? messages.find(m => m.role === 'system')?.content;
      const nonSystemMessages = messages.filter(m => m.role !== 'system');

      const response = await client.messages.create({
        model: options?.model ?? DEFAULT_MODEL,
        max_tokens: options?.maxTokens ?? MAX_TOKENS_DEFAULT,
        temperature: options?.temperature,
        system: systemPrompt,
        messages: nonSystemMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      const textContent = response.content.find(c => c.type === 'text');

      return {
        content: textContent?.text ?? '',
        model: response.model,
        provider: 'anthropic',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    },

    async *stream(messages: LLMMessage[], options?: LLMCompletionOptions): AsyncIterable<string> {
      const systemPrompt = options?.systemPrompt ?? messages.find(m => m.role === 'system')?.content;
      const nonSystemMessages = messages.filter(m => m.role !== 'system');

      const stream = await client.messages.stream({
        model: options?.model ?? DEFAULT_MODEL,
        max_tokens: options?.maxTokens ?? MAX_TOKENS_DEFAULT,
        temperature: options?.temperature,
        system: systemPrompt,
        messages: nonSystemMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    },
  };
}

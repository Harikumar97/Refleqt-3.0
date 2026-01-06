import OpenAI from 'openai';
import type { LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMProviderClient } from '../types';

const DEFAULT_MODEL = 'gpt-4o';
const MAX_TOKENS_DEFAULT = 4096;

export function createOpenAIClient(apiKey: string): LLMProviderClient {
  const client = new OpenAI({ apiKey });

  return {
    async complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMCompletionResult> {
      const response = await client.chat.completions.create({
        model: options?.model ?? DEFAULT_MODEL,
        max_tokens: options?.maxTokens ?? MAX_TOKENS_DEFAULT,
        temperature: options?.temperature,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const choice = response.choices[0];

      return {
        content: choice?.message?.content ?? '',
        model: response.model,
        provider: 'openai',
        usage: response.usage ? {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens,
        } : undefined,
      };
    },

    async *stream(messages: LLMMessage[], options?: LLMCompletionOptions): AsyncIterable<string> {
      const stream = await client.chat.completions.create({
        model: options?.model ?? DEFAULT_MODEL,
        max_tokens: options?.maxTokens ?? MAX_TOKENS_DEFAULT,
        temperature: options?.temperature,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    },
  };
}

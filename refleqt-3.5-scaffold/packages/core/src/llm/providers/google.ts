import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMMessage, LLMCompletionOptions, LLMCompletionResult, LLMProviderClient } from '../types';

const DEFAULT_MODEL = 'gemini-1.5-pro';

export function createGoogleClient(apiKey: string): LLMProviderClient {
  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    async complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMCompletionResult> {
      const model = genAI.getGenerativeModel({
        model: options?.model ?? DEFAULT_MODEL,
        generationConfig: {
          maxOutputTokens: options?.maxTokens,
          temperature: options?.temperature,
        },
      });

      const systemInstruction = options?.systemPrompt ?? messages.find(m => m.role === 'system')?.content;
      const nonSystemMessages = messages.filter(m => m.role !== 'system');

      const chat = model.startChat({
        systemInstruction,
        history: nonSystemMessages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      });

      const lastMessage = nonSystemMessages[nonSystemMessages.length - 1];
      const result = await chat.sendMessage(lastMessage?.content ?? '');

      return {
        content: result.response.text(),
        model: options?.model ?? DEFAULT_MODEL,
        provider: 'google',
        usage: result.response.usageMetadata ? {
          inputTokens: result.response.usageMetadata.promptTokenCount ?? 0,
          outputTokens: result.response.usageMetadata.candidatesTokenCount ?? 0,
        } : undefined,
      };
    },

    async *stream(messages: LLMMessage[], options?: LLMCompletionOptions): AsyncIterable<string> {
      const model = genAI.getGenerativeModel({
        model: options?.model ?? DEFAULT_MODEL,
        generationConfig: {
          maxOutputTokens: options?.maxTokens,
          temperature: options?.temperature,
        },
      });

      const systemInstruction = options?.systemPrompt ?? messages.find(m => m.role === 'system')?.content;
      const nonSystemMessages = messages.filter(m => m.role !== 'system');

      const chat = model.startChat({
        systemInstruction,
        history: nonSystemMessages.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      });

      const lastMessage = nonSystemMessages[nonSystemMessages.length - 1];
      const result = await chat.sendMessageStream(lastMessage?.content ?? '');

      for await (const chunk of result.stream) {
        yield chunk.text();
      }
    },
  };
}

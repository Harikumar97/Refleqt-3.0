/**
 * Gemini (Google) LLM Provider
 * Integration with Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMService, LLMMessage, LLMCompletionOptions, LLMResponse } from './types';

export class GeminiService implements LLMService {
  private client: GoogleGenerativeAI;
  private defaultModel = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_API_KEY || '');
  }

  async complete(prompt: string, options?: LLMCompletionOptions): Promise<LLMResponse> {
    const messages: LLMMessage[] = [{ role: 'user', content: prompt }];
    return this.chat(messages, options);
  }

  async chat(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMResponse> {
    const modelName = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens || 4096;

    const model = this.client.getGenerativeModel({ model: modelName });

    // Extract system instruction
    const systemMessage = messages.find((m) => m.role === 'system');
    const systemInstruction = options?.systemPrompt || systemMessage?.content;

    // Convert messages to Gemini format (exclude system messages)
    const history = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    try {
      const chat = model.startChat({
        history: history.slice(0, -1), // All but last message
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
        ...(systemInstruction && { systemInstruction }),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const content = response.text();

      return {
        content,
        provider: 'gemini',
        model: modelName,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const gemini = new GeminiService();

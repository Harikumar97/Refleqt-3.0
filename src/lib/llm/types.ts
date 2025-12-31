/**
 * LLM Types and Interfaces
 * Unified types for all LLM providers
 */

export type LLMProvider = 'claude' | 'openai' | 'gemini';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMService {
  complete(prompt: string, options?: LLMCompletionOptions): Promise<LLMResponse>;
  chat(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMResponse>;
}

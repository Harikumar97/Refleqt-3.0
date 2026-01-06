export type LLMProvider = 'anthropic' | 'openai' | 'google';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMCompletionResult {
  content: string;
  model: string;
  provider: LLMProvider;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProviderClient {
  complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<LLMCompletionResult>;
  stream?(messages: LLMMessage[], options?: LLMCompletionOptions): AsyncIterable<string>;
}

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  defaultModel?: string;
}

/**
 * LLM Router Compatibility Layer
 * Provides backward compatibility for code using the old LLM router
 * @deprecated Use the new llm singleton from '@/lib/llm' instead
 */

import { llm } from '../index';

/**
 * @deprecated This is a compatibility wrapper. Use the new llm singleton instead.
 */
export class LLMRouter {
  /**
   * Create LLM router from environment variables (legacy compatibility)
   */
  static fromEnv(): LLMRouter {
    return new LLMRouter();
  }

  /**
   * Complete a prompt (legacy API wrapper)
   */
  async complete(request: {
    task?: string;
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{
    success: boolean;
    value?: { content: string };
    error?: { message: string };
  }> {
    try {
      // Map old task types to new smart routing
      const taskType = this.mapTaskType(request.task);

      const options: any = {};
      if (request.systemPrompt !== undefined) options.systemPrompt = request.systemPrompt;
      if (request.maxTokens !== undefined) options.maxTokens = request.maxTokens;
      if (request.temperature !== undefined) options.temperature = request.temperature;

      const result = await llm.smartComplete(request.prompt, taskType, options);

      return {
        success: true,
        value: {
          content: result.content,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Map old task types to new smart routing types
   */
  private mapTaskType(
    task?: string
  ): 'research' | 'analysis' | 'creative' | 'code' {
    switch (task) {
      case 'competitive_analysis':
      case 'insight_generation':
        return 'analysis';
      case 'text_embeddings':
      case 'research_search':
      case 'long_document_summary':
        return 'research';
      case 'social_media_analysis':
      case 'content_filtering':
        return 'creative';
      case 'data_transformation':
        return 'code';
      default:
        return 'research';
    }
  }
}

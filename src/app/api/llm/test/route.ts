/**
 * LLM Test Endpoint
 * Tests connectivity to all LLM providers
 */

import { NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import type { LLMProvider } from '@/lib/llm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = (searchParams.get('provider') as LLMProvider) || 'claude';
  const prompt = searchParams.get('prompt') || 'Say "Hello from AI!" in a friendly way.';

  try {
    const response = await llm.complete(prompt, provider, {
      temperature: 0.7,
      maxTokens: 100,
    });

    return NextResponse.json({
      success: true,
      provider: response.provider,
      model: response.model,
      content: response.content,
      usage: response.usage,
    });
  } catch (error) {
    console.error(`LLM test error (${provider}):`, error);
    return NextResponse.json(
      {
        success: false,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { providers, prompt } = await request.json();

    if (!Array.isArray(providers) || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing providers or prompt' },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      providers.map(async (provider: LLMProvider) => {
        const response = await llm.complete(prompt, provider, {
          temperature: 0.7,
          maxTokens: 100,
        });
        return {
          provider: response.provider,
          model: response.model,
          content: response.content,
          usage: response.usage,
        };
      })
    );

    const formatted = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, ...result.value };
      } else {
        return {
          success: false,
          provider: providers[index],
          error: result.reason?.message || 'Unknown error',
        };
      }
    });

    return NextResponse.json({
      success: true,
      results: formatted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { initLLM } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { messages, provider } = await request.json();

    const router = initLLM();

    const result = await router.complete(messages, { provider });

    return NextResponse.json({
      content: result.content,
      model: result.model,
      provider: result.provider,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

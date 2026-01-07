import { NextRequest, NextResponse } from 'next/server';
import { initSwarm } from '@/lib/swarm';

export async function POST(request: NextRequest) {
  try {
    const { query, provider } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const swarm = initSwarm();
    const task = await swarm.startResearch(query, { provider });

    // Poll for completion
    const maxWait = 120000;
    const pollInterval = 2000;
    let waited = 0;

    while (waited < maxWait) {
      const currentTask = swarm.getTask(task.id);

      if (currentTask?.status === 'completed') {
        return NextResponse.json({
          taskId: currentTask.id,
          status: currentTask.status,
          results: currentTask.results.map(r => ({
            role: r.role,
            content: r.content,
            confidence: r.confidence,
          })),
          synthesis: currentTask.synthesis,
        });
      }

      if (currentTask?.status === 'error') {
        return NextResponse.json(
          { error: 'Research task failed' },
          { status: 500 }
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      waited += pollInterval;
    }

    return NextResponse.json(
      { error: 'Research task timed out' },
      { status: 504 }
    );
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Failed to process research request' },
      { status: 500 }
    );
  }
}

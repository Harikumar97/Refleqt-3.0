/**
 * Strategy Cohort Execution API
 * Executes analysis with real-time progress streaming via Server-Sent Events
 */

import { NextRequest, NextResponse } from "next/server";
import { executeCohortAnalysis } from "@/lib/strategy-cohorts/cohort-executor";
import type { ExecuteCohortRequest } from "@/lib/strategy-cohorts/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/strategy-cohorts/[cohortId]/execute
 * Start cohort analysis with real-time progress updates
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  const { cohortId } = params;

  try {
    // Parse options from request body
    const body: ExecuteCohortRequest = await request.json().catch(() => ({}));

    const {
      enableMultiProvider = true,
      providers = ["claude", "openai", "gemini"],
      depth = "deep",
    } = body;

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    let isClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send progress events
        const sendProgress = (
          stage: string,
          progress: number,
          description: string
        ) => {
          if (isClosed) return;

          const data = JSON.stringify({
            type: "progress",
            stage,
            progress,
            description,
            timestamp: new Date().toISOString(),
          });

          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (error) {
            console.error("Error sending progress:", error);
            isClosed = true;
          }
        };

        try {
          // Execute analysis with progress callbacks
          const result = await executeCohortAnalysis(
            cohortId,
            {
              enableMultiProvider,
              providers,
              depth,
            },
            sendProgress
          );

          // Send completion event
          if (!isClosed) {
            const completeData = JSON.stringify({
              type: "complete",
              result: {
                cohortId: result.cohortId,
                status: result.status,
                executionTimeMs: result.executionTimeMs,
                confidence: result.confidence,
                insightCount: result.insightCount,
                swarmId: result.swarmId,
              },
              timestamp: new Date().toISOString(),
            });

            controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));
          }

          controller.close();
        } catch (error) {
          // Send error event
          if (!isClosed) {
            const errorData = JSON.stringify({
              type: "error",
              error: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date().toISOString(),
            });

            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          }

          controller.close();
        }
      },

      cancel() {
        isClosed = true;
      },
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error("Cohort execution error:", error);

    return NextResponse.json(
      {
        error: "Failed to start cohort analysis",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/strategy-cohorts/[cohortId]/execute
 * Get analysis status and results
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { cohortId: string } }
) {
  const { cohortId } = params;

  try {
    const { default: prisma } = await import("@/lib/db/prisma");

    const cohort = await prisma.strategyCohort.findUnique({
      where: { id: cohortId },
      include: {
        insights: {
          orderBy: { rank: "asc" },
        },
        competitors: true,
        contexts: true,
      },
    });

    if (!cohort) {
      return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
    }

    return NextResponse.json({
      cohort: {
        id: cohort.id,
        name: cohort.name,
        status: cohort.status,
        analysisType: cohort.analysisType,
        executionTimeMs: cohort.executionTimeMs,
        confidence: cohort.confidence,
        insightCount: cohort.insightCount,
        swarmId: cohort.swarmId,
        lastAnalyzedAt: cohort.lastAnalyzedAt,
        competitors: cohort.competitors,
        contexts: cohort.contexts,
        insights: cohort.insights,
      },
    });
  } catch (error) {
    console.error("Failed to get cohort status:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve cohort status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

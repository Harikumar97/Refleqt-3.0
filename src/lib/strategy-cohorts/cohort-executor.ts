/**
 * Strategy Cohort Executor
 * Executes competitive analysis using the multi-agent Research Swarms system
 * Integrates all 3 LLM providers (Claude, OpenAI, Gemini) for ensemble intelligence
 */

import { MCPOrchestrator } from "@/lib/research-swarm/mcp-orchestrator";
import { llm } from "@/lib/llm";
import prisma from "@/lib/db/prisma";
import type { LLMProvider } from "@/lib/llm/types";

// ============================================================================
// Types
// ============================================================================

export interface CohortExecutionOptions {
  enableMultiProvider?: boolean;
  providers?: LLMProvider[];
  depth?: "shallow" | "deep";
  maxInsights?: number;
}

export interface CohortExecutionResult {
  cohortId: string;
  status: "completed" | "partial" | "failed";
  executionTimeMs: number;
  confidence: number;
  insightCount: number;
  swarmId: string;
  insights: CohortInsightData[];
  error?: string;
}

export interface CohortInsightData {
  title: string;
  content: string;
  confidence: "high" | "medium" | "low";
  category: string;
  sources: string[];
  llmProvider?: string;
  llmModel?: string;
  rank: number;
}

export interface ProgressCallback {
  (stage: string, progress: number, description: string): void;
}

// ============================================================================
// Cohort Executor Class
// ============================================================================

export class CohortExecutor {
  private orchestrator: MCPOrchestrator;
  private options: CohortExecutionOptions;

  constructor(options: CohortExecutionOptions = {}) {
    this.options = {
      enableMultiProvider: options.enableMultiProvider ?? true,
      providers: options.providers ?? ["claude", "openai", "gemini"],
      depth: options.depth ?? "deep",
      maxInsights: options.maxInsights ?? 10,
    };

    // Initialize with multi-agent swarm system
    this.orchestrator = new MCPOrchestrator({
      enableMultiProvider: this.options.enableMultiProvider ?? true,
      providers: this.options.providers ?? ["claude", "openai", "gemini"],
    });
  }

  /**
   * Execute a complete cohort analysis
   */
  async execute(
    cohortId: string,
    onProgress?: ProgressCallback
  ): Promise<CohortExecutionResult> {
    const startTime = Date.now();

    try {
      // Stage 1: Load cohort data
      onProgress?.(
        "Initializing Analysis",
        0,
        "Loading cohort configuration..."
      );
      const cohort = await this.loadCohort(cohortId);

      if (!cohort) {
        throw new Error(`Cohort ${cohortId} not found`);
      }

      if (cohort.competitors.length === 0) {
        throw new Error("No competitors selected for analysis");
      }

      // Update cohort status
      await this.updateCohortStatus(cohortId, "analyzing");

      // Stage 2: Build analysis query
      onProgress?.(
        "Data Collection",
        15,
        "Preparing AI agents for competitor research..."
      );
      const query = this.buildAnalysisQuery(cohort);

      // Stage 3: Execute multi-agent swarm analysis
      onProgress?.(
        "AI Processing & Analysis",
        30,
        `Analyzing ${cohort.competitors.length} competitors with multi-LLM ensemble...`
      );

      const swarmResult = await this.orchestrator.executeStrategyCohort(query, {
        userId: cohort.userId,
        obsessionScore: 9, // Force multi-provider for cohorts
        goals: cohort.competitors.map((c) => `Analyze ${c.name}`),
        ...(cohort.contexts.length > 0 && {
          contexts: cohort.contexts.map((ctx) => ctx.contextLabel),
        }),
      });

      // Stage 4: Generate structured insights
      onProgress?.(
        "Generating Insights",
        70,
        "Synthesizing findings into actionable intelligence..."
      );

      const insights = await this.generateInsights(cohort, swarmResult);

      // Stage 5: Store insights in database
      onProgress?.(
        "Finalizing Results",
        90,
        "Storing insights and preparing visualizations..."
      );

      await this.storeInsights(cohortId, insights);

      // Calculate confidence score
      const confidence = this.calculateConfidence(insights);

      // Stage 6: Update cohort with results
      const executionTimeMs = Date.now() - startTime;
      await prisma.strategyCohort.update({
        where: { id: cohortId },
        data: {
          status: "completed",
          executionTimeMs,
          confidence,
          insightCount: insights.length,
          swarmId: swarmResult.swarmId,
          lastAnalyzedAt: new Date(),
        },
      });

      onProgress?.(
        "Analysis Complete",
        100,
        "Your strategic intelligence is ready!"
      );

      return {
        cohortId,
        status: swarmResult.status === "completed" ? "completed" : "partial",
        executionTimeMs,
        confidence,
        insightCount: insights.length,
        swarmId: swarmResult.swarmId,
        insights,
      };
    } catch (error) {
      // Mark as failed
      await this.updateCohortStatus(cohortId, "failed");

      const executionTimeMs = Date.now() - startTime;

      return {
        cohortId,
        status: "failed",
        executionTimeMs,
        confidence: 0,
        insightCount: 0,
        swarmId: "",
        insights: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Load cohort with all related data
   */
  private async loadCohort(cohortId: string) {
    return await prisma.strategyCohort.findUnique({
      where: { id: cohortId },
      include: {
        competitors: true,
        contexts: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Update cohort status
   */
  private async updateCohortStatus(
    cohortId: string,
    status: "draft" | "analyzing" | "completed" | "failed"
  ) {
    await prisma.strategyCohort.update({
      where: { id: cohortId },
      data: { status },
    });
  }

  /**
   * Build analysis query for the swarm system
   */
  private buildAnalysisQuery(cohort: any): string {
    const competitorNames = cohort.competitors
      .map((c: any) => c.name)
      .join(", ");
    const hasContexts = cohort.contexts.length > 0;
    const contextInfo = hasContexts
      ? ` Focus analysis on these customer behavioral segments: ${cohort.contexts
          .map((c: any) => c.contextLabel)
          .join(", ")}.`
      : "";

    const analysisTypeFocus = this.getAnalysisTypeFocus(cohort.analysisType);

    const optionsContext = this.buildOptionsContext(cohort);

    return `
Perform a comprehensive competitive analysis of: ${competitorNames}

Analysis Type: ${analysisTypeFocus}
${contextInfo}
${optionsContext}

Provide strategic insights focused on:
1. Competitive positioning and differentiation
2. Pricing strategies and market positioning
3. Product features and capabilities
4. Market opportunities and gaps
5. Customer sentiment and retention indicators
6. Technology stack and innovation trends

Return actionable, data-driven insights with confidence scoring.
    `.trim();
  }

  /**
   * Get focus description for analysis type
   */
  private getAnalysisTypeFocus(analysisType: string): string {
    const types: Record<string, string> = {
      insights:
        "Strategic Insights - Generate 8-10 key insights with high confidence scoring",
      scenarios:
        "Competitive Scenarios - What-if analysis and strategic scenario planning",
      opportunities:
        "Market Opportunities - Gap analysis and positioning opportunities",
      "deep-dive":
        "Deep Dive Report - Comprehensive analysis with detailed findings and visualizations",
    };
    return types[analysisType] || types["insights"] || "Strategic Analysis";
  }

  /**
   * Build context from analysis options
   */
  private buildOptionsContext(cohort: any): string {
    const options = [];
    if (cohort.includeFinancial) options.push("financial analysis");
    if (cohort.includeSocial) options.push("social media monitoring");
    if (cohort.includeTech) options.push("technology stack analysis");
    if (cohort.includeSentiment) options.push("customer sentiment analysis");

    if (options.length === 0) return "";

    return `Include analysis for: ${options.join(", ")}.`;
  }

  /**
   * Generate structured insights from swarm results
   */
  private async generateInsights(
    cohort: any,
    swarmResult: any
  ): Promise<CohortInsightData[]> {
    // Extract raw synthesis from swarm
    const rawInsights = swarmResult.insights?.insights || [];

    if (rawInsights.length === 0) {
      // Fallback: generate insights from swarm findings using LLM
      return await this.fallbackInsightGeneration(cohort, swarmResult);
    }

    // Transform synthesized insights into cohort format
    const insights: CohortInsightData[] = rawInsights
      .slice(0, this.options.maxInsights)
      .map((insight: any, index: number) => ({
        title: insight.title || `Insight ${index + 1}`,
        content: insight.content || "",
        confidence: this.mapConfidenceLevel(insight.relevanceScore || 0.7),
        category: this.inferCategory(insight.title, insight.content),
        sources: insight.sourceFindingIds || [],
        rank: index + 1,
      }));

    return insights;
  }

  /**
   * Fallback insight generation using direct LLM call
   */
  private async fallbackInsightGeneration(
    cohort: any,
    swarmResult: any
  ): Promise<CohortInsightData[]> {
    const competitorNames = cohort.competitors
      .map((c: any) => c.name)
      .join(", ");

    const prompt = `Given a competitive analysis of ${competitorNames}, generate ${this.options.maxInsights} strategic insights.

Research findings from AI agents:
${JSON.stringify(swarmResult, null, 2)}

Generate insights in JSON array format:
[
  {
    "title": "Clear, actionable insight title",
    "content": "Detailed 2-3 sentence insight with specific data points",
    "confidence": "high" | "medium" | "low",
    "category": "pricing" | "features" | "market" | "retention" | "product" | "integrations",
    "sources": ["source1", "source2"]
  }
]

Focus on:
- Pricing differentiation and strategies
- Product feature gaps and opportunities
- Market positioning and trends
- Customer retention indicators
- Technology and innovation
- Integration ecosystems

Return ONLY valid JSON array, no other text.`;

    try {
      const result = await llm.smartComplete(prompt, "analysis", {
        temperature: 0.3,
        maxTokens: 3000,
      });

      const insights = JSON.parse(result.content);

      return insights.map((insight: any, index: number) => ({
        ...insight,
        rank: index + 1,
        llmProvider: result.provider,
        llmModel: result.model,
      }));
    } catch (error) {
      console.error("Fallback insight generation failed:", error);
      return [];
    }
  }

  /**
   * Store insights in database
   */
  private async storeInsights(cohortId: string, insights: CohortInsightData[]) {
    // Delete existing insights for this cohort
    await prisma.cohortInsight.deleteMany({
      where: { cohortId },
    });

    // Create new insights
    await prisma.cohortInsight.createMany({
      data: insights.map((insight) => ({
        cohortId,
        title: insight.title,
        content: insight.content,
        confidence: insight.confidence,
        category: insight.category,
        sources: insight.sources,
        rank: insight.rank,
        llmProvider: insight.llmProvider || null,
        llmModel: insight.llmModel || null,
      })),
    });
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(insights: CohortInsightData[]): number {
    if (insights.length === 0) return 0;

    const confidenceScores = insights.map((insight) => {
      switch (insight.confidence) {
        case "high":
          return 95;
        case "medium":
          return 75;
        case "low":
          return 50;
        default:
          return 70;
      }
    });

    const average =
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length;

    return Math.round(average);
  }

  /**
   * Map numeric score to confidence level
   */
  private mapConfidenceLevel(score: number): "high" | "medium" | "low" {
    if (score >= 0.8) return "high";
    if (score >= 0.6) return "medium";
    return "low";
  }

  /**
   * Infer category from insight content
   */
  private inferCategory(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();

    if (text.includes("pric") || text.includes("cost") || text.includes("tier"))
      return "pricing";
    if (
      text.includes("feature") ||
      text.includes("functionality") ||
      text.includes("capability")
    )
      return "features";
    if (
      text.includes("market") ||
      text.includes("positioning") ||
      text.includes("segment")
    )
      return "market";
    if (
      text.includes("retention") ||
      text.includes("churn") ||
      text.includes("customer success")
    )
      return "retention";
    if (
      text.includes("product") ||
      text.includes("roadmap") ||
      text.includes("innovation")
    )
      return "product";
    if (
      text.includes("integration") ||
      text.includes("api") ||
      text.includes("ecosystem")
    )
      return "integrations";

    return "market"; // Default
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Execute a cohort analysis (convenience wrapper)
 */
export async function executeCohortAnalysis(
  cohortId: string,
  options?: CohortExecutionOptions,
  onProgress?: ProgressCallback
): Promise<CohortExecutionResult> {
  const executor = new CohortExecutor(options);
  return await executor.execute(cohortId, onProgress);
}

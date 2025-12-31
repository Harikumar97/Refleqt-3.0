/**
 * MCP Orchestrator
 * Main coordinator for Research Swarm system with multi-LLM support
 * Handles goal parsing, chain construction, swarm execution, and synthesis
 */

import type { LLMProvider } from "../llm/types";
import { MCPChainBuilder } from "./mcp-chain-builder";
import { SwarmExecutor } from "./swarm-executor";
import { SynthesisEngine } from "./synthesis-engine";
import type { UserContext, SynthesisResult, MCPChain } from "./types";

export interface StrategyConohortResult {
  swarmId: string;
  query: string;
  insights: SynthesisResult;
  executionTimeMs: number;
  status: "completed" | "partial" | "failed";
}

export class MCPOrchestrator {
  private swarmExecutor: SwarmExecutor;
  private synthesisEngine: SynthesisEngine;

  constructor(options?: {
    enableMultiProvider?: boolean;
    providers?: LLMProvider[];
  }) {
    this.swarmExecutor = new SwarmExecutor(options);
    this.synthesisEngine = new SynthesisEngine();
  }

  /**
   * Execute Strategy Cohort query
   * Main entry point for "Show me how competitors respond to X" type queries
   * Returns synthesized insights within 2 minutes
   */
  async executeStrategyCohort(
    query: string,
    userContext: UserContext
  ): Promise<StrategyConohortResult> {
    const startTime = Date.now();
    const swarmId = this.generateSwarmId();

    try {
      // Step 1: Parse goal and construct MCP chain
      const mcpChain = MCPChainBuilder.constructChain(query, userContext);

      // Step 2: Get swarm execution config
      const swarmConfig = MCPChainBuilder.getSwarmConfig(mcpChain);

      // Step 3: Activate swarm (parallel AI agents)
      const swarmResult = await this.swarmExecutor.executeSwarm(
        swarmId,
        mcpChain,
        swarmConfig
      );

      // Step 4: Mass synthesis discovery
      const synthesisResult = await this.synthesisEngine.synthesize(
        swarmResult.rawFindings,
        {
          maxInsights: mcpChain.maxOutput,
          relevanceThreshold: 0.7,
          prioritizeActionable: true,
        }
      );

      // Step 5: Package finite insights
      return {
        swarmId,
        query,
        insights: synthesisResult,
        executionTimeMs: Date.now() - startTime,
        status: swarmResult.status,
      };
    } catch (error) {
      console.error("Strategy cohort execution error:", error);
      return {
        swarmId,
        query,
        insights: {
          insights: [],
          hierarchyNodes: [],
          synthesisTimeMs: 0,
        },
        executionTimeMs: Date.now() - startTime,
        status: "failed",
      };
    }
  }

  /**
   * Execute Research Goal (continuous monitoring)
   * For Smart Trackers that run on schedule
   */
  async executeResearchGoal(
    _goalTitle: string,
    goalQuery: string,
    mcpChainConfig: MCPChain | null,
    userContext: UserContext
  ): Promise<StrategyConohortResult> {
    const swarmId = this.generateSwarmId();
    const startTime = Date.now();

    try {
      // Use provided MCP chain or build new one
      const mcpChain =
        mcpChainConfig ||
        MCPChainBuilder.constructChain(goalQuery, userContext);

      // Execute swarm
      const swarmConfig = MCPChainBuilder.getSwarmConfig(mcpChain);
      const swarmResult = await this.swarmExecutor.executeSwarm(
        swarmId,
        mcpChain,
        swarmConfig
      );

      // Synthesize results
      const synthesisResult = await this.synthesisEngine.synthesize(
        swarmResult.rawFindings,
        {
          maxInsights: mcpChain.maxOutput,
          relevanceThreshold: 0.6, // Slightly lower for continuous monitoring
          prioritizeActionable: true,
        }
      );

      return {
        swarmId,
        query: goalQuery,
        insights: synthesisResult,
        executionTimeMs: Date.now() - startTime,
        status: swarmResult.status,
      };
    } catch (error) {
      console.error("Research goal execution error:", error);
      return {
        swarmId,
        query: goalQuery,
        insights: {
          insights: [],
          hierarchyNodes: [],
          synthesisTimeMs: 0,
        },
        executionTimeMs: Date.now() - startTime,
        status: "failed",
      };
    }
  }

  /**
   * Calculate update frequency based on obsession score
   * Returns interval in seconds
   */
  static calculateUpdateFrequency(obsessionScore: number): {
    interval: number;
    maxItems: number;
  } {
    const frequencies: Record<string, { interval: number; maxItems: number }> =
      {
        low: { interval: 86400, maxItems: 5 }, // Daily, 5 items (score 1-3)
        medium: { interval: 3600, maxItems: 7 }, // Hourly, 7 items (score 4-6)
        high: { interval: 900, maxItems: 9 }, // 15 min, 9 items (score 7-8)
        extreme: { interval: 300, maxItems: 10 }, // 5 min, 10 items (score 9-10)
      };

    if (obsessionScore >= 9) return frequencies["extreme"]!;
    if (obsessionScore >= 7) return frequencies["high"]!;
    if (obsessionScore >= 4) return frequencies["medium"]!;
    return frequencies["low"]!;
  }

  /**
   * Generate unique swarm ID
   */
  private generateSwarmId(): string {
    return `swarm-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Estimate completion time based on swarm size
   */
  static estimateCompletionTime(swarmSize: "small" | "large"): number {
    // Return ETA in seconds
    return swarmSize === "small" ? 60 : 120; // 1-2 minutes
  }
}

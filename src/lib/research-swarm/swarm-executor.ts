/**
 * Swarm Executor
 * Executes parallel AI agent swarms for research with multi-LLM support
 */

import { llm } from "../llm";
import type { LLMProvider, LLMResponse } from "../llm/types";
import type {
  MCPChain,
  SwarmAgentConfig,
  AgentResult,
  SwarmResult,
  RawFinding,
} from "./types";

export class SwarmExecutor {
  private enableMultiProvider: boolean;
  private providers: LLMProvider[];

  constructor(options?: {
    enableMultiProvider?: boolean;
    providers?: LLMProvider[];
  }) {
    this.enableMultiProvider = options?.enableMultiProvider ?? false;
    this.providers = options?.providers ?? ["claude", "openai", "gemini"];
  }

  /**
   * Execute a research swarm with parallel AI agents
   * Supports multi-provider execution for ensemble intelligence
   */
  async executeSwarm(
    swarmId: string,
    chain: MCPChain,
    config: { agents: number; timeout: number; depth: "shallow" | "deep" }
  ): Promise<SwarmResult> {
    const startTime = Date.now();

    try {
      // Generate agent configurations
      const agents = this.generateAgentConfigs(chain, config);

      // Execute agents in parallel
      const agentResults = await Promise.all(
        agents.map((agent) => this.executeAgent(agent, chain))
      );

      // Extract raw findings from agent results
      const rawFindings = this.extractRawFindings(agentResults);

      const executionTimeMs = Date.now() - startTime;

      return {
        swarmId,
        query: chain.goal,
        agentResults,
        rawFindings,
        executionTimeMs,
        status: this.determineStatus(agentResults),
      };
    } catch (error) {
      return {
        swarmId,
        query: chain.goal,
        agentResults: [],
        rawFindings: [],
        executionTimeMs: Date.now() - startTime,
        status: "failed",
      };
    }
  }

  /**
   * Generate agent configurations based on chain and config
   */
  private generateAgentConfigs(
    _chain: MCPChain,
    config: { agents: number; timeout: number; depth: "shallow" | "deep" }
  ): SwarmAgentConfig[] {
    const agents: SwarmAgentConfig[] = [];

    // Distribute roles across agents
    const roles: Array<"fetcher" | "analyzer" | "synthesizer"> = [];

    // For small swarms (3 agents): 2 fetchers, 1 analyzer
    // For large swarms (8 agents): 4 fetchers, 3 analyzers, 1 synthesizer
    if (config.agents === 3) {
      roles.push("fetcher", "fetcher", "analyzer");
    } else if (config.agents === 8) {
      roles.push(
        "fetcher",
        "fetcher",
        "fetcher",
        "fetcher",
        "analyzer",
        "analyzer",
        "analyzer",
        "synthesizer"
      );
    } else {
      // Generic distribution
      const fetcherCount = Math.ceil(config.agents * 0.5);
      const analyzerCount = Math.floor(config.agents * 0.4);
      const synthesizerCount = config.agents - fetcherCount - analyzerCount;

      for (let i = 0; i < fetcherCount; i++) roles.push("fetcher");
      for (let i = 0; i < analyzerCount; i++) roles.push("analyzer");
      for (let i = 0; i < synthesizerCount; i++) roles.push("synthesizer");
    }

    roles.forEach((role, index) => {
      agents.push({
        agentId: `agent-${index + 1}`,
        role,
        timeout: config.timeout,
        depth: config.depth,
      });
    });

    return agents;
  }

  /**
   * Execute a single agent with optional multi-provider ensemble
   */
  private async executeAgent(
    agent: SwarmAgentConfig,
    chain: MCPChain
  ): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // Build prompt based on agent role and chain steps
      const prompt = this.buildAgentPrompt(agent, chain);

      // Build LLM options
      const options = {
        systemPrompt:
          "You are an expert research agent. Provide detailed, structured analysis.",
        maxTokens: agent.depth === "deep" ? 2000 : 1000,
        temperature: 0.7,
      };

      // Execute LLM call with timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Agent timeout")),
          agent.timeout * 1000
        )
      );

      let llmResult: LLMResponse | LLMResponse[];

      if (this.enableMultiProvider) {
        // Execute across all providers in parallel for ensemble intelligence
        const llmPromise = llm.multiProviderCompletion(
          prompt,
          this.providers,
          options
        );
        llmResult = await Promise.race([llmPromise, timeoutPromise]);
      } else {
        // Execute with smart routing based on task type
        const taskType =
          agent.role === "analyzer"
            ? "analysis"
            : agent.role === "synthesizer"
            ? "research"
            : "research";
        const llmPromise = llm.smartComplete(prompt, taskType, options);
        llmResult = await Promise.race([llmPromise, timeoutPromise]);
      }

      // Aggregate responses if multi-provider
      const aggregatedContent = Array.isArray(llmResult)
        ? this.aggregateMultiProviderResponses(llmResult)
        : llmResult.content;

      return {
        agentId: agent.agentId,
        role: agent.role,
        success: true,
        data: aggregatedContent,
        executionTimeMs: Date.now() - startTime,
        ...(Array.isArray(llmResult) && {
          metadata: {
            multiProvider: true,
            providers: llmResult.map((r) => r.provider),
            responseCounts: llmResult.length,
          },
        }),
      };
    } catch (error) {
      return {
        agentId: agent.agentId,
        role: agent.role,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Aggregate responses from multiple LLM providers into a single coherent response
   */
  private aggregateMultiProviderResponses(responses: LLMResponse[]): string {
    const header = `# Multi-Provider Ensemble Analysis\n\n`;
    const providerSections = responses
      .map(
        (response, index) =>
          `## Response ${index + 1}: ${response.provider.toUpperCase()} (${response.model})\n\n${response.content}\n`
      )
      .join("\n---\n\n");

    const synthesis = `\n---\n\n## Ensemble Synthesis\n\nThis analysis aggregates insights from ${responses.length} AI providers (${responses.map((r) => r.provider).join(", ")}). The diverse perspectives above can be synthesized to:\n\n1. **Cross-validate findings**: Compare consistent insights across providers\n2. **Identify unique perspectives**: Note where providers differ in their analysis\n3. **Build confidence**: Findings mentioned by multiple providers are more reliable\n4. **Reduce bias**: Multiple providers help mitigate individual model biases\n`;

    return header + providerSections + synthesis;
  }

  /**
   * Build agent-specific prompt based on role and chain
   */
  private buildAgentPrompt(agent: SwarmAgentConfig, chain: MCPChain): string {
    const baseContext = `Research Goal: ${chain.goal}\n\nYour Role: ${agent.role}\n\n`;

    switch (agent.role) {
      case "fetcher":
        return (
          baseContext +
          `As a fetcher agent, your task is to identify and gather relevant information sources for this research goal.

Focus on:
- Key websites and URLs to investigate
- Competitor sources
- Industry news outlets
- Relevant data points

Return a structured list of sources with brief descriptions of why they're relevant.

Depth Level: ${agent.depth}`
        );

      case "analyzer":
        return (
          baseContext +
          `As an analyzer agent, your task is to extract insights from the research goal.

Focus on:
- Key trends and patterns
- Competitive advantages/disadvantages
- Market opportunities
- Strategic implications

Return 3-5 key insights with confidence scores (0.0-1.0).

Depth Level: ${agent.depth}`
        );

      case "synthesizer":
        return (
          baseContext +
          `As a synthesizer agent, your task is to combine findings into actionable recommendations.

Focus on:
- Strategic recommendations
- Tactical next steps
- Potential risks and opportunities
- Priority actions

Return a synthesized analysis with clear action items.

Depth Level: ${agent.depth}`
        );

      default:
        return (
          baseContext +
          "Analyze the research goal and provide relevant insights."
        );
    }
  }

  /**
   * Extract raw findings from agent results
   */
  private extractRawFindings(agentResults: AgentResult[]): RawFinding[] {
    const findings: RawFinding[] = [];

    agentResults.forEach((result) => {
      if (result.success && typeof result.data === "string") {
        // Parse LLM response to extract insights
        // For MVP, we'll create a simple finding from the response
        findings.push({
          findingId: `finding-${result.agentId}-${Date.now()}`,
          agentId: result.agentId,
          findingType: this.inferFindingType(result.role),
          title: `${result.role} Analysis`,
          content: result.data,
          confidenceScore: 0.7, // Default confidence
          sources: [], // Will be populated by fetcher agents
        });
      }
    });

    return findings;
  }

  /**
   * Infer finding type from agent role
   */
  private inferFindingType(
    role: string
  ): "insight" | "trend" | "opportunity" | "threat" {
    switch (role) {
      case "analyzer":
        return "insight";
      case "synthesizer":
        return "opportunity";
      case "fetcher":
        return "trend";
      default:
        return "insight";
    }
  }

  /**
   * Determine swarm execution status
   */
  private determineStatus(
    agentResults: AgentResult[]
  ): "completed" | "partial" | "failed" {
    const successCount = agentResults.filter((r) => r.success).length;
    const totalCount = agentResults.length;

    if (successCount === 0) return "failed";
    if (successCount < totalCount * 0.5) return "partial";
    return "completed";
  }
}

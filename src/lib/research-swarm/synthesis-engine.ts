/**
 * Synthesis Engine
 * Applies RAG processing and finite introspect packaging
 * Converts raw findings into bounded, actionable insights (max 10)
 */

import { llm } from "../llm";
import type {
  RawFinding,
  SynthesizedInsight,
  KnowledgeHierarchyNode,
  SynthesisResult,
  FiniteIntrospectConfig,
} from "./types";

export class SynthesisEngine {
  constructor() {}

  /**
   * Synthesize raw findings into finite insights (max 10)
   */
  async synthesize(
    rawFindings: RawFinding[],
    config: FiniteIntrospectConfig
  ): Promise<SynthesisResult> {
    const startTime = Date.now();

    try {
      // Step 1: Mass synthesis - combine and deduplicate findings
      const combinedFindings = await this.massSynthesize(rawFindings);

      // Step 2: Apply finite introspect - limit to max insights
      const rankedInsights = await this.rankAndFilter(combinedFindings, config);

      // Step 3: Build knowledge hierarchy
      const hierarchyNodes = this.buildKnowledgeHierarchy(rankedInsights);

      // Step 4: Assign display positions (1-10)
      const finalInsights = this.assignDisplayPositions(
        rankedInsights,
        config.maxInsights
      );

      return {
        insights: finalInsights,
        hierarchyNodes,
        synthesisTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Synthesis error:", error);
      return {
        insights: [],
        hierarchyNodes: [],
        synthesisTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Mass synthesis: Combine raw findings using LLM
   */
  private async massSynthesize(
    rawFindings: RawFinding[]
  ): Promise<SynthesizedInsight[]> {
    if (rawFindings.length === 0) return [];

    // Combine findings into synthesis prompt
    const findingsText = rawFindings
      .map(
        (f, i) =>
          `Finding ${i + 1} [${f.findingType}] (confidence: ${f.confidenceScore}):\n${f.title}\n${f.content}\n`
      )
      .join("\n---\n");

    const synthesisPrompt = `You are a business intelligence synthesizer. Given multiple research findings, create a comprehensive analysis.

Research Findings:
${findingsText}

Task: Synthesize these findings into clear, actionable insights. For each insight:
1. Assign a hierarchy level (strategic/tactical/operational)
2. Determine priority (0.0-1.0)
3. Assess relevance (0.0-1.0)
4. Identify if it's actionable (yes/no)
5. Extract action items (if applicable, max 5)
6. Add psychographic tags (customer segments affected)

Format your response as JSON array:
[
  {
    "title": "Insight Title",
    "content": "Detailed insight content",
    "hierarchyLevel": "strategic" | "tactical" | "operational",
    "priorityScore": 0.85,
    "relevanceScore": 0.90,
    "isActionable": true,
    "actionItems": ["action 1", "action 2"],
    "psychographicTags": ["tag1", "tag2"]
  }
]

Provide 5-15 synthesized insights. Be concise but comprehensive.`;

    try {
      // Execute LLM synthesis with smart routing (research task → Claude)
      const llmResult = await llm.smartComplete(
        synthesisPrompt,
        "research",
        {
          systemPrompt:
            "You are an expert business intelligence analyst. Always respond with valid JSON arrays.",
          maxTokens: 3000,
          temperature: 0.3, // Lower temperature for consistent synthesis
        }
      );

      // Parse JSON response from LLM
      const parsed = this.parseJSONResponse(llmResult.content);

      // Convert to SynthesizedInsight format
      return parsed.map((item: any) => ({
        title: item.title || "Untitled Insight",
        content: item.content || "",
        hierarchyLevel: this.validateHierarchyLevel(item.hierarchyLevel),
        priorityScore: this.clampScore(item.priorityScore),
        relevanceScore: this.clampScore(item.relevanceScore),
        isActionable: Boolean(item.isActionable),
        actionItems: Array.isArray(item.actionItems)
          ? item.actionItems.slice(0, 5)
          : [],
        sourceFindingIds: rawFindings.map((f) => f.findingId),
        psychographicTags: Array.isArray(item.psychographicTags)
          ? item.psychographicTags
          : [],
        displayPosition: null,
      }));
    } catch (error) {
      console.error("Mass synthesis error:", error);
      // Fallback: Convert raw findings directly
      return this.fallbackSynthesis(rawFindings);
    }
  }

  /**
   * Fallback synthesis if LLM fails
   */
  private fallbackSynthesis(rawFindings: RawFinding[]): SynthesizedInsight[] {
    return rawFindings.slice(0, 15).map((finding) => ({
      title: finding.title,
      content: finding.content,
      hierarchyLevel: "tactical" as const,
      priorityScore: finding.confidenceScore,
      relevanceScore: finding.confidenceScore,
      isActionable: false,
      actionItems: [],
      sourceFindingIds: [finding.findingId],
      psychographicTags: [],
      displayPosition: null,
    }));
  }

  /**
   * Rank and filter insights to enforce finite introspect
   */
  private async rankAndFilter(
    insights: SynthesizedInsight[],
    config: FiniteIntrospectConfig
  ): Promise<SynthesizedInsight[]> {
    // Filter by relevance threshold
    let filtered = insights.filter(
      (i) => i.relevanceScore >= config.relevanceThreshold
    );

    // Sort by priority (actionable items first if prioritizeActionable is true)
    filtered.sort((a, b) => {
      if (config.prioritizeActionable) {
        if (a.isActionable !== b.isActionable) {
          return a.isActionable ? -1 : 1;
        }
      }
      return b.priorityScore - a.priorityScore;
    });

    // Apply finite bound (absolute max 10)
    const maxInsights = Math.min(config.maxInsights, 10);
    return filtered.slice(0, maxInsights);
  }

  /**
   * Build knowledge hierarchy from insights
   */
  private buildKnowledgeHierarchy(
    insights: SynthesizedInsight[]
  ): KnowledgeHierarchyNode[] {
    const hierarchy: KnowledgeHierarchyNode[] = [];

    // Group by hierarchy level
    const strategic = insights.filter((i) => i.hierarchyLevel === "strategic");
    const tactical = insights.filter((i) => i.hierarchyLevel === "tactical");
    const operational = insights.filter(
      (i) => i.hierarchyLevel === "operational"
    );

    // Create strategic nodes (root level)
    if (strategic.length > 0) {
      const strategicNode: KnowledgeHierarchyNode = {
        nodeTitle: "Strategic Insights",
        nodeContent: `${strategic.length} high-level strategic insights`,
        hierarchyLevel: "strategic",
        depth: 0,
        insightIds: strategic.map((_, i) => `insight-strategic-${i}`),
        relevanceScore: this.averageScore(
          strategic.map((i) => i.relevanceScore)
        ),
        children: [],
      };
      hierarchy.push(strategicNode);
    }

    // Create tactical nodes (child of strategic)
    if (tactical.length > 0) {
      const tacticalNode: KnowledgeHierarchyNode = {
        nodeTitle: "Tactical Actions",
        nodeContent: `${tactical.length} tactical recommendations`,
        hierarchyLevel: "tactical",
        depth: 1,
        insightIds: tactical.map((_, i) => `insight-tactical-${i}`),
        relevanceScore: this.averageScore(
          tactical.map((i) => i.relevanceScore)
        ),
        children: [],
      };
      hierarchy.push(tacticalNode);
    }

    // Create operational nodes (child of tactical)
    if (operational.length > 0) {
      const operationalNode: KnowledgeHierarchyNode = {
        nodeTitle: "Operational Tasks",
        nodeContent: `${operational.length} operational action items`,
        hierarchyLevel: "operational",
        depth: 2,
        insightIds: operational.map((_, i) => `insight-operational-${i}`),
        relevanceScore: this.averageScore(
          operational.map((i) => i.relevanceScore)
        ),
        children: [],
      };
      hierarchy.push(operationalNode);
    }

    return hierarchy;
  }

  /**
   * Assign display positions (1-10) for finite introspect
   */
  private assignDisplayPositions(
    insights: SynthesizedInsight[],
    maxInsights: number
  ): SynthesizedInsight[] {
    return insights.slice(0, maxInsights).map((insight, index) => ({
      ...insight,
      displayPosition: index + 1,
    }));
  }

  /**
   * Helper: Parse JSON response from LLM
   */
  private parseJSONResponse(response: string): any[] {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try direct parsing
      return JSON.parse(response);
    } catch {
      // If parsing fails, return empty array
      return [];
    }
  }

  /**
   * Helper: Validate hierarchy level
   */
  private validateHierarchyLevel(
    level: string
  ): "strategic" | "tactical" | "operational" {
    if (
      level === "strategic" ||
      level === "tactical" ||
      level === "operational"
    ) {
      return level;
    }
    return "tactical"; // Default
  }

  /**
   * Helper: Clamp score to 0.0-1.0 range
   */
  private clampScore(score: number): number {
    return Math.max(0.0, Math.min(1.0, Number(score) || 0.5));
  }

  /**
   * Helper: Calculate average score
   */
  private averageScore(scores: number[]): number {
    if (scores.length === 0) return 0.5;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
}

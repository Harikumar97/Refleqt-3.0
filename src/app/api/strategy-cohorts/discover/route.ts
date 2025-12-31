/**
 * Competitor Discovery API
 * AI-powered competitor discovery using multiple methods
 */

import { NextRequest, NextResponse } from "next/server";
import { llm } from "@/lib/llm";
import type {
  CompetitorDiscoveryRequest,
  CompetitorDiscoveryResponse,
} from "@/lib/strategy-cohorts/types";

/**
 * POST /api/strategy-cohorts/discover
 * Discover competitors using AI analysis
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth (not currently used)
    // const userId = 'demo-user-id'; // Replace with actual auth

    const body: CompetitorDiscoveryRequest = await request.json();
    const { method, input } = body;

    if (!method || !input) {
      return NextResponse.json(
        { error: "Discovery method and input are required" },
        { status: 400 }
      );
    }

    let prompt = "";
    let systemPrompt = `You are a competitive intelligence expert. Your task is to identify competitors based on the provided information. Return ONLY a valid JSON array of competitors with the following structure:

[
  {
    "name": "Company Name",
    "website": "https://example.com",
    "description": "Brief description of what they do",
    "relevanceScore": 0.95,
    "reason": "Why they are a competitor"
  }
]

Ensure the response is valid JSON. Do not include any markdown formatting or additional text.`;

    // Build prompts based on discovery method
    switch (method) {
      case "url":
        prompt = `Analyze this website URL and identify its direct competitors: ${input}

Return up to 10 main competitors that offer similar products or services. Include their websites if you know them.`;
        break;

      case "company-name":
        prompt = `Identify the top 10 direct competitors for this company: ${input}

Focus on companies that operate in the same market segment and offer similar solutions.`;
        break;

      case "industry-scan":
        prompt = `Identify the top 15 companies in this industry or market segment: ${input}

Include both established leaders and emerging players. Focus on companies that are actively competing in this space.`;
        break;

      case "bulk-import":
        // For bulk import, we just validate and structure the data
        try {
          const competitors = JSON.parse(input);
          if (!Array.isArray(competitors)) {
            return NextResponse.json(
              { error: "Bulk import must be a JSON array of competitors" },
              { status: 400 }
            );
          }

          // Validate and normalize the imported data
          const normalized = competitors.map((comp: any, index: number) => ({
            name: comp.name || `Competitor ${index + 1}`,
            website: comp.website || "",
            description: comp.description || "",
            relevanceScore: comp.relevanceScore || 0.8,
            reason: comp.reason || "Imported via bulk upload",
          }));

          return NextResponse.json({
            competitors: normalized,
            method: "bulk-import",
            source: "user-import",
          });
        } catch (error) {
          return NextResponse.json(
            { error: "Invalid JSON format for bulk import" },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { error: "Invalid discovery method" },
          { status: 400 }
        );
    }

    // Use AI to discover competitors
    const result = await llm.smartComplete(prompt, "research", {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 2500,
    });

    // Parse the AI response
    let competitors;
    try {
      // Remove markdown code blocks if present
      let content = result.content.trim();
      if (content.startsWith("```json")) {
        content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (content.startsWith("```")) {
        content = content.replace(/```\n?/g, "");
      }

      competitors = JSON.parse(content);

      if (!Array.isArray(competitors)) {
        throw new Error("Response is not an array");
      }

      // Validate and normalize each competitor
      competitors = competitors.map((comp: any) => ({
        name: comp.name || "Unknown Company",
        website: comp.website || "",
        description: comp.description || "",
        relevanceScore:
          typeof comp.relevanceScore === "number" ? comp.relevanceScore : 0.7,
        reason: comp.reason || "Identified through AI analysis",
      }));
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", result.content);

      return NextResponse.json(
        {
          error: "Failed to parse competitor discovery results",
          message: "The AI response was not in the expected format",
          rawResponse: result.content.substring(0, 500),
        },
        { status: 500 }
      );
    }

    const response: CompetitorDiscoveryResponse = {
      competitors,
      method,
      source: result.provider || "unknown",
      model: result.model,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to discover competitors:", error);

    return NextResponse.json(
      {
        error: "Failed to discover competitors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

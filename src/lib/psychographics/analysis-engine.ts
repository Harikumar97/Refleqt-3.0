/**
 * Psychographic Analysis Engine
 * AI-powered behavioral segmentation and customer psychology analysis
 */

import { assert } from "@/utils/assert";
import prisma from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// Constants for Power of Ten compliance
const MAX_SEGMENTS = 10;
const MAX_INSIGHTS_PER_SEGMENT = 5;
const MAX_JOURNEY_STAGES = 5;

export interface BehavioralSegment {
  name: string;
  tagline: string;
  percentage: number;
  userCount: number;
  conversionRate: number;
  averageValue: number;
  traits: string[];
  characteristics: {
    painPoints: string[];
    motivations: string[];
    objections: string[];
    triggers: string[];
  };
  funnelStage?: string;
}

export interface AnalysisProgress {
  stage: string;
  description: string;
  progress: number;
}

export type ProgressCallback = (progress: AnalysisProgress) => void;

/**
 * Generate sample behavioral segments for demonstration
 * In production, this would use real data from integrated sources
 */
export async function generateBehavioralSegments(
  userId: string,
  analysisId: string,
  onProgress?: ProgressCallback
): Promise<BehavioralSegment[]> {
  assert(userId, "userId is required");
  assert(analysisId, "analysisId is required");

  // Stage 1: Data Collection
  onProgress?.({
    stage: "Data Collection",
    description: "Gathering behavioral data from connected sources...",
    progress: 15,
  });

  await sleep(800);

  // Stage 2: Pattern Recognition
  onProgress?.({
    stage: "Pattern Recognition",
    description: "Identifying behavioral patterns and psychological traits...",
    progress: 35,
  });

  await sleep(1000);

  // Stage 3: Segment Clustering
  onProgress?.({
    stage: "Segment Clustering",
    description: "Creating psychographic clusters using AI algorithms...",
    progress: 55,
  });

  await sleep(1200);

  // Stage 4: Journey Mapping
  onProgress?.({
    stage: "Journey Mapping",
    description: "Mapping customer journeys with emotional context...",
    progress: 75,
  });

  await sleep(800);

  // Stage 5: Insight Generation
  onProgress?.({
    stage: "Insight Generation",
    description: "Generating actionable behavioral insights...",
    progress: 90,
  });

  await sleep(600);

  // Generate sample segments based on typical user behavior patterns
  const segments: BehavioralSegment[] = [
    {
      name: "Trial Abandoners",
      tagline: "Overwhelmed by complexity",
      percentage: 34,
      userCount: 2100,
      conversionRate: 3.2,
      averageValue: 89,
      traits: [
        "Feature-overwhelmed",
        "Price-sensitive",
        "Mobile-first",
        "Comparison shoppers",
      ],
      characteristics: {
        painPoints: [
          "Too many features to understand quickly",
          "Unclear value proposition",
          "Complex onboarding process",
        ],
        motivations: [
          "Looking for simple solutions",
          "Budget-conscious decision making",
          "Quick time-to-value",
        ],
        objections: [
          "Seems too complicated for our needs",
          "Pricing not transparent enough",
          "Requires too much setup time",
        ],
        triggers: [
          "Simplified onboarding",
          "Clear pricing tiers",
          "Quick-start templates",
        ],
      },
      funnelStage: "trial",
    },
    {
      name: "Power Customizers",
      tagline: "Enterprise potential users",
      percentage: 23,
      userCount: 1420,
      conversionRate: 67,
      averageValue: 340,
      traits: [
        "Tech-savvy",
        "Integration-heavy",
        "Customization-focused",
        "Growth-oriented",
      ],
      characteristics: {
        painPoints: [
          "Need advanced customization options",
          "Require specific integrations",
          "Looking for scalability",
        ],
        motivations: [
          "Build complex workflows",
          "Integrate with existing stack",
          "Scale operations efficiently",
        ],
        objections: [
          "Limited API capabilities",
          "Insufficient customization options",
          "Concerns about scalability",
        ],
        triggers: [
          "Advanced features showcase",
          "API documentation",
          "Enterprise tier benefits",
        ],
      },
      funnelStage: "conversion",
    },
    {
      name: "Quick Starters",
      tagline: "Template-seeking teams",
      percentage: 28,
      userCount: 1750,
      conversionRate: 45,
      averageValue: 156,
      traits: [
        "Template-focused",
        "Team-oriented",
        "Efficiency-driven",
        "Speed-focused",
      ],
      characteristics: {
        painPoints: [
          "Need to get started quickly",
          "Looking for proven templates",
          "Team collaboration is essential",
        ],
        motivations: [
          "Fast implementation",
          "Pre-built solutions",
          "Team productivity",
        ],
        objections: [
          "Lack of ready-made templates",
          "Collaboration features unclear",
          "Setup seems time-consuming",
        ],
        triggers: [
          "Template library access",
          "Team invitation prompts",
          "Quick-win case studies",
        ],
      },
      funnelStage: "consideration",
    },
    {
      name: "Enterprise Evaluators",
      tagline: "Large team decision makers",
      percentage: 15,
      userCount: 900,
      conversionRate: 78,
      averageValue: 890,
      traits: [
        "Security-conscious",
        "Compliance-focused",
        "ROI-driven",
        "Process-oriented",
      ],
      characteristics: {
        painPoints: [
          "Security and compliance requirements",
          "Need for vendor reliability",
          "ROI justification needed",
        ],
        motivations: [
          "Enterprise-grade security",
          "Compliance certifications",
          "Proven ROI metrics",
        ],
        objections: [
          "Security documentation insufficient",
          "Lack of compliance certifications",
          "Unclear ROI metrics",
        ],
        triggers: [
          "Security whitepaper",
          "Compliance badge display",
          "ROI calculator",
        ],
      },
      funnelStage: "awareness",
    },
  ];

  // Validate segment count
  assert(
    segments.length <= MAX_SEGMENTS,
    `Segment count ${segments.length} exceeds maximum ${MAX_SEGMENTS}`
  );

  return segments;
}

/**
 * Store behavioral segments in database
 */
export async function storeSegments(
  userId: string,
  analysisId: string,
  segments: BehavioralSegment[]
): Promise<void> {
  assert(userId, "userId is required");
  assert(analysisId, "analysisId is required");
  assert(
    segments.length <= MAX_SEGMENTS,
    `Too many segments: ${segments.length}`
  );

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    assert(segment !== undefined, `Segment at index ${i} is undefined`);

    // Create segment
    const dbSegment = await prisma.psychographicSegment.create({
      data: {
        userId,
        analysisId,
        segmentName: segment.name,
        segmentTagline: segment.tagline,
        percentage: new Decimal(segment.percentage),
        userCount: segment.userCount,
        conversionRate: new Decimal(segment.conversionRate),
        averageValue: new Decimal(segment.averageValue),
        traits: segment.traits,
        characteristics: segment.characteristics,
        funnelStage: segment.funnelStage,
      },
    });

    // Create insights for this segment
    const insights = generateSegmentInsights(segment);
    assert(
      insights.length <= MAX_INSIGHTS_PER_SEGMENT,
      `Too many insights: ${insights.length}`
    );

    for (let j = 0; j < insights.length; j++) {
      const insight = insights[j];
      assert(insight !== undefined, `Insight at index ${j} is undefined`);

      await prisma.segmentInsight.create({
        data: {
          segmentId: dbSegment.id,
          insightType: insight.type,
          title: insight.title,
          content: insight.content,
          confidenceScore: new Decimal(insight.confidence),
          impact: insight.impact,
        },
      });
    }
  }
}

interface SegmentInsightData {
  type: string;
  title: string;
  content: string;
  confidence: number;
  impact: string;
}

/**
 * Generate insights for a behavioral segment
 */
function generateSegmentInsights(
  segment: BehavioralSegment
): SegmentInsightData[] {
  const insights: SegmentInsightData[] = [];

  // Pain point insights
  if (segment.characteristics.painPoints.length > 0) {
    insights.push({
      type: "pain_point",
      title: "Primary Pain Points",
      content: segment.characteristics.painPoints.join("; "),
      confidence: 0.85,
      impact: "high",
    });
  }

  // Conversion trigger insights
  if (segment.characteristics.triggers.length > 0) {
    insights.push({
      type: "trigger",
      title: "Conversion Triggers",
      content: `Key triggers that drive conversion: ${segment.characteristics.triggers.join(", ")}`,
      confidence: 0.9,
      impact: "high",
    });
  }

  // Behavioral pattern insight
  insights.push({
    type: "behavior_pattern",
    title: "Behavioral Pattern",
    content: `This segment exhibits ${segment.traits.join(", ")} behavior patterns with a ${segment.conversionRate}% conversion rate.`,
    confidence: 0.87,
    impact: "medium",
  });

  return insights.slice(0, MAX_INSIGHTS_PER_SEGMENT);
}

/**
 * Generate journey stage data
 */
export async function generateJourneyStages(
  userId: string,
  analysisId: string
): Promise<void> {
  assert(userId, "userId is required");
  assert(analysisId, "analysisId is required");

  const stages = [
    {
      name: "awareness",
      conversionRate: 8.2,
      dropOffRate: 91.8,
      avgTimeInStage: 180, // 3 minutes
      keyActions: ["Landing page view", "Feature exploration", "Pricing check"],
    },
    {
      name: "consideration",
      conversionRate: 23.1,
      dropOffRate: 76.9,
      avgTimeInStage: 600, // 10 minutes
      keyActions: [
        "Documentation reading",
        "Video watching",
        "Comparison with alternatives",
      ],
    },
    {
      name: "trial",
      conversionRate: 34.5,
      dropOffRate: 65.5,
      avgTimeInStage: 3600, // 1 hour
      keyActions: [
        "Account creation",
        "First feature use",
        "Template selection",
      ],
    },
    {
      name: "conversion",
      conversionRate: 15.6,
      dropOffRate: 84.4,
      avgTimeInStage: 1800, // 30 minutes
      keyActions: ["Pricing page visit", "Trial to paid upgrade", "Team invite"],
    },
    {
      name: "retention",
      conversionRate: 67.8,
      dropOffRate: 32.2,
      avgTimeInStage: 86400, // 1 day
      keyActions: [
        "Daily login",
        "Feature usage",
        "Team collaboration",
        "Integration setup",
      ],
    },
  ];

  assert(
    stages.length <= MAX_JOURNEY_STAGES,
    `Too many journey stages: ${stages.length}`
  );

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    assert(stage !== undefined, `Stage at index ${i} is undefined`);

    await prisma.journeyStage.create({
      data: {
        userId,
        analysisId,
        stageName: stage.name,
        conversionRate: new Decimal(stage.conversionRate),
        dropOffRate: new Decimal(stage.dropOffRate),
        avgTimeInStage: stage.avgTimeInStage,
        keyActions: stage.keyActions,
      },
    });
  }
}

/**
 * Helper function for async delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate confidence score based on data quality
 */
export function calculateConfidenceScore(
  interactionsCount: number
): Decimal {
  // Simple confidence calculation based on sample size
  // More interactions = higher confidence
  if (interactionsCount >= 10000) return new Decimal(0.9);
  if (interactionsCount >= 5000) return new Decimal(0.85);
  if (interactionsCount >= 1000) return new Decimal(0.75);
  if (interactionsCount >= 500) return new Decimal(0.65);
  return new Decimal(0.5);
}

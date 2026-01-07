export type {
  IntelligenceMetrics,
  ScoreFactor,
  TrendAnalysis,
  RecommendationConfig,
} from './types';

export {
  calculateWeightedScore,
  calculateConfidence,
  analyzeTrend,
  buildMetrics,
} from './scoring';

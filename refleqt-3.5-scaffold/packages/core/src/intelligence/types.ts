export interface IntelligenceMetrics {
  userId: string;
  category: string;
  score: number;
  confidence: number;
  factors: ScoreFactor[];
  timestamp: Date;
}

export interface ScoreFactor {
  name: string;
  weight: number;
  value: number;
  contribution: number;
}

export interface TrendAnalysis {
  category: string;
  currentScore: number;
  previousScore: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'declining' | 'stable';
  period: string;
}

export interface RecommendationConfig {
  minConfidence: number;
  maxRecommendations: number;
  priorityWeights: Record<string, number>;
}

import type { IntelligenceMetrics, ScoreFactor, TrendAnalysis } from './types';
import { clamp } from '@refleqt/utils';

export function calculateWeightedScore(factors: ScoreFactor[]): number {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = factors.reduce((sum, f) => sum + f.value * f.weight, 0);
  return clamp(weightedSum / totalWeight, 0, 100);
}

export function calculateConfidence(factors: ScoreFactor[]): number {
  if (factors.length === 0) return 0;

  const avgContribution = factors.reduce((sum, f) => sum + Math.abs(f.contribution), 0) / factors.length;
  const variance = factors.reduce((sum, f) => sum + Math.pow(f.contribution - avgContribution, 2), 0) / factors.length;
  const stdDev = Math.sqrt(variance);

  return clamp(100 - stdDev, 0, 100);
}

export function analyzeTrend(current: number, previous: number, category: string, period: string): TrendAnalysis {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  let trend: TrendAnalysis['trend'];
  if (Math.abs(changePercent) < 2) {
    trend = 'stable';
  } else if (change > 0) {
    trend = 'improving';
  } else {
    trend = 'declining';
  }

  return {
    category,
    currentScore: current,
    previousScore: previous,
    change,
    changePercent,
    trend,
    period,
  };
}

export function buildMetrics(
  userId: string,
  category: string,
  factors: Omit<ScoreFactor, 'contribution'>[]
): IntelligenceMetrics {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);

  const enrichedFactors: ScoreFactor[] = factors.map(f => ({
    ...f,
    contribution: totalWeight > 0 ? (f.value * f.weight) / totalWeight : 0,
  }));

  return {
    userId,
    category,
    score: calculateWeightedScore(enrichedFactors),
    confidence: calculateConfidence(enrichedFactors),
    factors: enrichedFactors,
    timestamp: new Date(),
  };
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  category: string;
  properties: Record<string, unknown>;
  timestamp: Date;
}

export interface AggregatedMetrics {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: MetricSummary[];
}

export interface MetricSummary {
  name: string;
  value: number;
  count: number;
  average: number;
  min: number;
  max: number;
}

export interface UsageStats {
  totalSessions: number;
  totalQueries: number;
  avgSessionDuration: number;
  topCategories: { category: string; count: number }[];
  activeUsers: number;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  successRate: number;
}

import type { AnalyticsEvent, AggregatedMetrics, MetricSummary, UsageStats, PerformanceMetrics } from './types';

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private flushCallback?: (events: AnalyticsEvent[]) => Promise<void>;
  private flushInterval: number = 30000;
  private maxBufferSize: number = 100;
  private timer?: ReturnType<typeof setInterval>;

  constructor(options?: { flushInterval?: number; maxBufferSize?: number }) {
    this.flushInterval = options?.flushInterval ?? 30000;
    this.maxBufferSize = options?.maxBufferSize ?? 100;
  }

  track(userId: string, eventType: string, category: string, properties: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      userId,
      eventType,
      category,
      properties,
      timestamp: new Date(),
    };

    this.events.push(event);

    if (this.events.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  onFlush(callback: (events: AnalyticsEvent[]) => Promise<void>): void {
    this.flushCallback = callback;
  }

  startAutoFlush(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  stopAutoFlush(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    if (this.flushCallback) {
      await this.flushCallback(eventsToFlush);
    }
  }

  private generateEventId(): string {
    return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export function aggregateMetrics(events: AnalyticsEvent[], period: AggregatedMetrics['period']): AggregatedMetrics {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }

  const filteredEvents = events.filter(e => e.timestamp >= startDate && e.timestamp <= now);

  const metricsByName = new Map<string, number[]>();

  for (const event of filteredEvents) {
    for (const [key, value] of Object.entries(event.properties)) {
      if (typeof value === 'number') {
        const existing = metricsByName.get(key) ?? [];
        existing.push(value);
        metricsByName.set(key, existing);
      }
    }
  }

  const metrics: MetricSummary[] = [];

  for (const [name, values] of metricsByName) {
    if (values.length === 0) continue;

    metrics.push({
      name,
      value: values.reduce((a, b) => a + b, 0),
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    });
  }

  return {
    period,
    startDate,
    endDate: now,
    metrics,
  };
}

export function calculateUsageStats(events: AnalyticsEvent[]): UsageStats {
  const uniqueUsers = new Set(events.map(e => e.userId));
  const categoryCounts = new Map<string, number>();

  for (const event of events) {
    const count = categoryCounts.get(event.category) ?? 0;
    categoryCounts.set(event.category, count + 1);
  }

  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalSessions: events.filter(e => e.eventType === 'session_start').length,
    totalQueries: events.filter(e => e.eventType === 'query').length,
    avgSessionDuration: 0,
    topCategories,
    activeUsers: uniqueUsers.size,
  };
}

export function calculatePerformanceMetrics(responseTimes: number[], errors: number, total: number): PerformanceMetrics {
  if (responseTimes.length === 0) {
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      errorRate: 0,
      successRate: 100,
    };
  }

  const sorted = [...responseTimes].sort((a, b) => a - b);
  const p95Index = Math.floor(sorted.length * 0.95);
  const p99Index = Math.floor(sorted.length * 0.99);

  return {
    avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    p95ResponseTime: sorted[p95Index] ?? sorted[sorted.length - 1] ?? 0,
    p99ResponseTime: sorted[p99Index] ?? sorted[sorted.length - 1] ?? 0,
    errorRate: total > 0 ? (errors / total) * 100 : 0,
    successRate: total > 0 ? ((total - errors) / total) * 100 : 100,
  };
}

let trackerInstance: AnalyticsTracker | null = null;

export function initializeTracker(options?: { flushInterval?: number; maxBufferSize?: number }): AnalyticsTracker {
  trackerInstance = new AnalyticsTracker(options);
  return trackerInstance;
}

export function getTracker(): AnalyticsTracker {
  if (!trackerInstance) {
    trackerInstance = new AnalyticsTracker();
  }
  return trackerInstance;
}

export { AnalyticsTracker };

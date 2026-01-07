// Portal Types - Shared across portal components

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  industry: string;
  obsessionScore: number;
}

export interface IntelligenceItem {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'conversion' | 'users' | 'competitors' | 'market';
  priority: 'high' | 'medium' | 'low';
  relevanceScore: number;
  source: string;
  publishedAt: string;
  isActionable: boolean;
}

export interface LiveMetrics {
  obsessionScore: number;
  totalInsights: number;
  urgentCount: number;
  accuracyRate: number;
}

export interface KPIMetric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  trend: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string | number;
  badgeType?: 'new' | 'count' | 'beta';
  status?: 'running' | 'completed' | 'processing';
  locked?: boolean;
  children?: NavigationSubItem[];
}

export interface NavigationSubItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface IntelligenceFilter {
  category: 'all' | 'urgent' | 'conversion' | 'users' | 'competitors' | 'market';
}

// API Response Types
export interface IntelligenceResponse {
  items: IntelligenceItem[];
  total: number;
  hasMore: boolean;
}

export interface MetricsResponse {
  kpis: KPIMetric[];
  live: LiveMetrics;
  lastUpdated: string;
}

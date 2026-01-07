'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface IntelligenceItem {
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

interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  progressPercent: number;
}

interface LiveMetrics {
  obsessionScore: number;
  scoreChange: number;
  totalInsights: number;
  urgentCount: number;
  accuracyRate: number;
}

type FilterCategory = 'all' | 'urgent' | 'conversion' | 'users' | 'competitors' | 'market';

// KPI Card Component
function KPICard({ metric }: { metric: KPIMetric }) {
  const changeColorClass = {
    positive: 'text-emerald-500',
    negative: 'text-rose-500',
    neutral: 'text-cyan-500',
  }[metric.changeType];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {metric.label}
        </span>
        <div
          className="h-1 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden"
        >
          <div
            className={`h-full rounded-full ${
              metric.changeType === 'negative' ? 'bg-rose-400' : 'bg-purple-500'
            }`}
            style={{ width: `${metric.progressPercent}%` }}
          />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
        <span className={`text-sm font-medium ${changeColorClass}`}>
          {metric.change}
        </span>
      </div>
    </div>
  );
}

// Intelligence Item Component
function IntelligenceCard({ item }: { item: IntelligenceItem }) {
  const priorityStyles = {
    high: 'border-l-rose-500 bg-rose-50/50',
    medium: 'border-l-amber-500 bg-amber-50/50',
    low: 'border-l-gray-300 bg-gray-50/50',
  };

  const categoryIcon = {
    urgent: '🚨',
    conversion: '📈',
    users: '👥',
    competitors: '🎯',
    market: '🌍',
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div
      className={`border-l-4 rounded-lg p-4 mb-3 transition-all hover:shadow-md ${priorityStyles[item.priority]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span>{categoryIcon[item.category]}</span>
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {item.title}
            </h4>
            {item.isActionable && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded uppercase">
                Actionable
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>{item.source}</span>
            <span>•</span>
            <span>{timeAgo(item.publishedAt)}</span>
            <span>•</span>
            <span>{Math.round(item.relevanceScore * 100)}% relevant</span>
          </div>
        </div>
        {item.priority === 'high' && (
          <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
            Take Action
          </button>
        )}
      </div>
    </div>
  );
}

// Live Metrics Panel Component
function LiveMetricsPanel({ metrics }: { metrics: LiveMetrics }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-blue-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="font-semibold text-gray-900">Live Metrics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-cyan-600">{metrics.obsessionScore}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Obsession</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{metrics.totalInsights}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Insights</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-rose-500">{metrics.urgentCount}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Urgent</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-emerald-500">{metrics.accuracyRate}%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

// Filter Tabs Component
function FilterTabs({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}) {
  const filters: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'conversion', label: 'Conversion' },
    { id: 'users', label: 'Users' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'market', label: 'Market' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === filter.id
              ? 'bg-cyan-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

// Main Page Component
export default function IntelligenceFeedPage() {
  const [items, setItems] = useState<IntelligenceItem[]>([]);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  const fetchIntelligence = useCallback(async (category: FilterCategory) => {
    try {
      const response = await fetch(`/api/intelligence?category=${category}`);
      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch intelligence:', error);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setKpis(data.kpis);
      setLiveMetrics(data.live);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchIntelligence(activeFilter), fetchMetrics()]);
      setIsLoading(false);
    };
    loadData();
  }, [activeFilter, fetchIntelligence, fetchMetrics]);

  // Refresh data periodically when live feed is active
  useEffect(() => {
    if (!isLiveFeedActive) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isLiveFeedActive, fetchMetrics]);

  const handleFilterChange = (filter: FilterCategory) => {
    setActiveFilter(filter);
    fetchIntelligence(filter);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Intelligence Feed</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900 text-white rounded-full">
              <span className="text-lg font-bold">{liveMetrics?.obsessionScore || 8.4}</span>
              <div className="text-xs">
                <div className="font-medium">Obsessed</div>
                <div className="text-purple-200">↑ +{liveMetrics?.scoreChange || 0.3} this hour</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-gray-600">Live Business Intelligence Dashboard</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isLiveFeedActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveFeedActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              Live Feed {isLiveFeedActive ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchIntelligence(activeFilter);
              fetchMetrics();
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <span>⚙️</span>
            Configure
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
            <span>🤖</span>
            Ask AI Anything
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((metric) => (
          <KPICard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Intelligence Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Your Finite Intelligence Feed
              </h2>
              <p className="text-sm text-gray-500">
                Real-time insights curated for SaaS conversion optimization • Max 10 items (Finite Introspect)
              </p>
            </div>

            <div className="mb-6">
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
              />
            </div>

            <div className="space-y-3">
              {items.length > 0 ? (
                items.map((item) => (
                  <IntelligenceCard key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">📭</span>
                  <p>No intelligence items found for this filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Metrics Sidebar */}
        <div className="space-y-6">
          {liveMetrics && <LiveMetricsPanel metrics={liveMetrics} />}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                <span>🔬</span>
                <span>Start Research Swarm</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                <span>🎯</span>
                <span>Create Strategy Cohort</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center gap-3">
                <span>🍺</span>
                <span>Brew New Content</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

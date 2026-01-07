import { NextResponse } from 'next/server';

interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  trend: string;
  progressPercent: number;
  target?: string;
}

interface LiveMetrics {
  obsessionScore: number;
  scoreChange: number;
  totalInsights: number;
  urgentCount: number;
  accuracyRate: number;
}

// In production, these would be calculated from real data
function calculateKPIs(): KPIMetric[] {
  return [
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: '3.2%',
      change: '↑ Target: 8%',
      changeType: 'neutral',
      trend: 'Target: 8%',
      progressPercent: 40,
      target: '8%',
    },
    {
      id: 'monthly-churn',
      label: 'Monthly Churn',
      value: '11.8%',
      change: '↑ 2% from last month',
      changeType: 'negative',
      trend: '2% from last month',
      progressPercent: 82,
    },
    {
      id: 'avg-ltv',
      label: 'Avg LTV',
      value: '865',
      change: '↑ 12% via retention',
      changeType: 'positive',
      trend: '12% via retention',
      progressPercent: 65,
    },
    {
      id: 'monthly-mrr',
      label: 'Monthly MRR',
      value: '24.1K',
      change: '↑ 8% growth rate',
      changeType: 'positive',
      trend: '8% growth rate',
      progressPercent: 78,
    },
  ];
}

function calculateLiveMetrics(): LiveMetrics {
  return {
    obsessionScore: 8.4,
    scoreChange: 0.3,
    totalInsights: 23,
    urgentCount: 3,
    accuracyRate: 87,
  };
}

export async function GET() {
  // In production: aggregate from prisma queries
  const kpis = calculateKPIs();
  const live = calculateLiveMetrics();

  return NextResponse.json({
    kpis,
    live,
    lastUpdated: new Date().toISOString(),
  });
}

import { NextResponse } from 'next/server';
import { prisma } from '@refleqt/database';

// Demo user - In production, get from auth session
const DEMO_USER_EMAIL = 'alex@taskflow.io';

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

// Format numbers for display
function formatValue(value: number, type: string): string {
  switch (type) {
    case 'conversion_rate':
    case 'churn':
      return `${value.toFixed(1)}%`;
    case 'ltv':
      return value.toFixed(0);
    case 'mrr':
      return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(0);
    default:
      return value.toString();
  }
}

// Calculate change between current and previous value
function calculateChange(
  current: number,
  previous: number | null,
  target: number | null,
  type: string
): { change: string; changeType: 'positive' | 'negative' | 'neutral' } {
  if (previous === null) {
    if (target !== null) {
      return { change: `Target: ${formatValue(target, type)}`, changeType: 'neutral' };
    }
    return { change: 'No previous data', changeType: 'neutral' };
  }

  const diff = current - previous;
  const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;

  // Determine if change is positive or negative based on metric type
  // For churn, lower is better; for others, higher is better
  const isImprovement = type === 'churn' ? diff < 0 : diff > 0;

  let changeText: string;
  if (type === 'churn') {
    changeText = `↑ ${Math.abs(percentChange).toFixed(0)}% from last month`;
  } else if (type === 'ltv') {
    changeText = `↑ ${Math.abs(percentChange).toFixed(0)}% via retention`;
  } else if (type === 'mrr') {
    changeText = `↑ ${Math.abs(percentChange).toFixed(0)}% growth rate`;
  } else {
    changeText = target ? `↑ Target: ${formatValue(target, type)}` : `${diff > 0 ? '↑' : '↓'} ${Math.abs(percentChange).toFixed(0)}%`;
  }

  return {
    change: changeText,
    changeType: isImprovement ? 'positive' : type === 'churn' && diff > 0 ? 'negative' : 'neutral',
  };
}

// Calculate progress toward target
function calculateProgress(current: number, target: number | null, type: string): number {
  if (target === null || target === 0) return 50;

  // For churn, progress is inverse (lower is better)
  if (type === 'churn') {
    // If target is 5% churn and current is 11.8%, progress is how far we've come
    // Max reasonable churn might be 20%, so progress = (20 - current) / (20 - target) * 100
    const maxChurn = 20;
    return Math.min(100, Math.max(0, ((maxChurn - current) / (maxChurn - target)) * 100));
  }

  return Math.min(100, (current / target) * 100);
}

// Calculate obsession score based on user activity and engagement
async function calculateObsessionScore(userId: string): Promise<{ score: number; change: number }> {
  // Get latest obsession score
  const latestScores = await prisma.obsessionScore.findMany({
    where: { userId },
    orderBy: { calculatedAt: 'desc' },
    take: 2,
  });

  if (latestScores.length === 0) {
    // Calculate fresh score based on activity
    const [itemCount, swarmCount, insightCount] = await Promise.all([
      prisma.intelligenceItem.count({ where: { userId, dismissedAt: null } }),
      prisma.researchSwarm.count({ where: { userId, status: 'completed' } }),
      prisma.synthesizedInsight.count({ where: { userId, dismissedAt: null } }),
    ]);

    // Simple scoring algorithm (can be enhanced)
    const baseScore = 5.0;
    const activityBonus = Math.min(3.0, (itemCount * 0.1 + swarmCount * 0.5 + insightCount * 0.3));
    const score = Math.min(10.0, baseScore + activityBonus);

    // Store the calculated score
    await prisma.obsessionScore.create({
      data: {
        userId,
        score,
        factors: { itemCount, swarmCount, insightCount },
      },
    });

    return { score, change: 0 };
  }

  const currentScore = latestScores[0].score;
  const previousScore = latestScores[1]?.score || currentScore;

  return {
    score: currentScore,
    change: Number((currentScore - previousScore).toFixed(1)),
  };
}

export async function GET() {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch latest metrics from database
    const metricsData = await prisma.userMetrics.findMany({
      where: { userId: user.id },
      orderBy: { calculatedAt: 'desc' },
    });

    // Group by metric type and get latest
    const latestMetrics = new Map<string, typeof metricsData[0]>();
    for (const metric of metricsData) {
      if (!latestMetrics.has(metric.metricType)) {
        latestMetrics.set(metric.metricType, metric);
      }
    }

    // Build KPI response
    const metricConfigs = [
      { type: 'conversion_rate', label: 'Conversion Rate' },
      { type: 'churn', label: 'Monthly Churn' },
      { type: 'ltv', label: 'Avg LTV' },
      { type: 'mrr', label: 'Monthly MRR' },
    ];

    const kpis: KPIMetric[] = metricConfigs.map((config) => {
      const metric = latestMetrics.get(config.type);

      if (!metric) {
        return {
          id: config.type,
          label: config.label,
          value: '—',
          change: 'No data',
          changeType: 'neutral' as const,
          progressPercent: 0,
        };
      }

      const { change, changeType } = calculateChange(
        metric.value,
        metric.previousValue,
        metric.target,
        config.type
      );

      return {
        id: config.type,
        label: config.label,
        value: formatValue(metric.value, config.type),
        change,
        changeType,
        progressPercent: calculateProgress(metric.value, metric.target, config.type),
      };
    });

    // Calculate live metrics
    const [obsessionData, totalInsights, urgentCount] = await Promise.all([
      calculateObsessionScore(user.id),
      prisma.intelligenceItem.count({
        where: { userId: user.id, dismissedAt: null },
      }),
      prisma.intelligenceItem.count({
        where: { userId: user.id, category: 'urgent', dismissedAt: null },
      }),
    ]);

    const live: LiveMetrics = {
      obsessionScore: obsessionData.score,
      scoreChange: obsessionData.change,
      totalInsights,
      urgentCount,
      accuracyRate: 87, // This would be calculated from historical predictions vs outcomes
    };

    return NextResponse.json({
      kpis,
      live,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Metrics API error:', error);

    // Fallback response
    return NextResponse.json({
      kpis: [
        { id: 'conversion_rate', label: 'Conversion Rate', value: '3.2%', change: '↑ Target: 8%', changeType: 'neutral', progressPercent: 40 },
        { id: 'churn', label: 'Monthly Churn', value: '11.8%', change: '↑ 2% from last month', changeType: 'negative', progressPercent: 82 },
        { id: 'ltv', label: 'Avg LTV', value: '865', change: '↑ 12% via retention', changeType: 'positive', progressPercent: 65 },
        { id: 'mrr', label: 'Monthly MRR', value: '24.1K', change: '↑ 8% growth rate', changeType: 'positive', progressPercent: 78 },
      ],
      live: {
        obsessionScore: 8.4,
        scoreChange: 0.3,
        totalInsights: 23,
        urgentCount: 3,
        accuracyRate: 87,
      },
      lastUpdated: new Date().toISOString(),
      _fallback: true,
    });
  }
}

// POST endpoint to recalculate metrics
export async function POST() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Recalculate obsession score
    const obsessionData = await calculateObsessionScore(user.id);

    // Update user profile with latest score
    await prisma.userProfile.update({
      where: { userId: user.id },
      data: { obsessionScore: obsessionData.score },
    });

    return NextResponse.json({
      success: true,
      obsessionScore: obsessionData.score,
      message: 'Metrics recalculated',
    });
  } catch (error) {
    console.error('Metrics POST error:', error);
    return NextResponse.json({ error: 'Failed to recalculate metrics' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

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

// Simulated data - In production, this would come from Prisma
// This pattern allows easy swap to real database queries
function getIntelligenceItems(
  category?: string,
  limit: number = 10
): IntelligenceItem[] {
  const items: IntelligenceItem[] = [
    {
      id: '1',
      title: 'Competitor X launched new pricing tier targeting SMBs',
      content: 'Analysis shows 23% price reduction in their starter plan with added features that directly compete with your core offering.',
      category: 'competitors',
      priority: 'high',
      relevanceScore: 0.94,
      source: 'Market Intelligence',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isActionable: true,
    },
    {
      id: '2',
      title: 'Conversion funnel drop-off detected at pricing page',
      content: 'User behavior analysis shows 34% bounce rate increase on pricing page over last 7 days. A/B test recommended.',
      category: 'conversion',
      priority: 'high',
      relevanceScore: 0.91,
      source: 'Behavioral Analytics',
      publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isActionable: true,
    },
    {
      id: '3',
      title: 'Enterprise segment showing increased engagement',
      content: 'Enterprise trial signups increased 18% this week. Product-qualified leads up by 12 accounts.',
      category: 'users',
      priority: 'medium',
      relevanceScore: 0.87,
      source: 'User Analytics',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isActionable: false,
    },
    {
      id: '4',
      title: 'Market trend: AI-first positioning gaining traction',
      content: 'Industry reports show 67% of B2B SaaS buyers now prioritize AI capabilities. Consider messaging update.',
      category: 'market',
      priority: 'medium',
      relevanceScore: 0.85,
      source: 'Industry Research',
      publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      isActionable: true,
    },
    {
      id: '5',
      title: 'URGENT: Churn risk detected in 3 enterprise accounts',
      content: 'Engagement scores dropped below threshold for AccountCorp, TechGiant, and DataFlow. Immediate outreach recommended.',
      category: 'urgent',
      priority: 'high',
      relevanceScore: 0.98,
      source: 'Churn Prediction',
      publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isActionable: true,
    },
    {
      id: '6',
      title: 'New feature adoption rate exceeds expectations',
      content: 'Dashboard v2 adoption at 78% after 2 weeks. Power users showing 3.2x higher engagement.',
      category: 'users',
      priority: 'low',
      relevanceScore: 0.72,
      source: 'Product Analytics',
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isActionable: false,
    },
    {
      id: '7',
      title: 'Competitor Y acquired by major player',
      content: 'Strategic acquisition may lead to feature consolidation. Monitor for pricing and positioning changes.',
      category: 'competitors',
      priority: 'medium',
      relevanceScore: 0.83,
      source: 'News Intelligence',
      publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      isActionable: false,
    },
    {
      id: '8',
      title: 'Trial-to-paid conversion optimization opportunity',
      content: 'Users who complete onboarding checklist convert at 2.4x rate. Only 43% currently complete it.',
      category: 'conversion',
      priority: 'high',
      relevanceScore: 0.89,
      source: 'Conversion Analytics',
      publishedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
      isActionable: true,
    },
  ];

  // Filter by category
  let filtered = category && category !== 'all'
    ? items.filter((item) => item.category === category)
    : items;

  // Sort by relevance and recency
  filtered.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return b.relevanceScore - a.relevanceScore;
  });

  // Limit to finite introspect (max 10)
  return filtered.slice(0, Math.min(limit, 10));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'all';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // In production: const items = await prisma.intelligenceItem.findMany(...)
  const items = getIntelligenceItems(category, limit);

  return NextResponse.json({
    items,
    total: items.length,
    hasMore: false, // Finite introspect - no pagination
    filters: {
      category,
      limit,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@refleqt/database';

// Types for API response
interface IntelligenceItemResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  relevanceScore: number | null;
  source: string;
  publishedAt: string | null;
  isActionable: boolean;
}

// Demo user ID - In production, get from auth session
const DEMO_USER_EMAIL = 'alex@taskflow.io';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 10); // Max 10 for finite introspect

  try {
    // Get user (in production, use auth session)
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', items: [], total: 0 },
        { status: 404 }
      );
    }

    // Build query filters
    const where: {
      userId: string;
      dismissedAt: null;
      category?: string;
    } = {
      userId: user.id,
      dismissedAt: null, // Only show non-dismissed items
    };

    if (category !== 'all') {
      where.category = category;
    }

    // Fetch intelligence items from database
    const items = await prisma.intelligenceItem.findMany({
      where,
      orderBy: [
        { priority: 'asc' }, // 'high' comes before 'low' alphabetically... need custom sort
        { relevanceScore: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
      include: {
        source: {
          select: {
            sourceName: true,
          },
        },
      },
    });

    // Sort by priority (high > medium > low) then by relevance
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedItems = items.sort((a, b) => {
      const priorityDiff =
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    });

    // Transform to response format
    const response: IntelligenceItemResponse[] = sortedItems.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      relevanceScore: item.relevanceScore,
      source: item.source.sourceName || 'Unknown Source',
      publishedAt: item.publishedAt?.toISOString() || null,
      isActionable: item.isActionable,
    }));

    return NextResponse.json({
      items: response,
      total: response.length,
      hasMore: false, // Finite introspect - no pagination
      filters: { category, limit },
    });
  } catch (error) {
    console.error('Intelligence API error:', error);

    // Fallback to mock data if database fails
    return NextResponse.json({
      items: getMockIntelligenceItems(category, limit),
      total: 0,
      hasMore: false,
      filters: { category, limit },
      _fallback: true,
    });
  }
}

// Dismiss an intelligence item
export async function PATCH(request: NextRequest) {
  try {
    const { itemId, action } = await request.json();

    if (action === 'dismiss') {
      await prisma.intelligenceItem.update({
        where: { id: itemId },
        data: { dismissedAt: new Date() },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Intelligence PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// Fallback mock data
function getMockIntelligenceItems(category: string, limit: number) {
  const items = [
    {
      id: 'mock-1',
      title: 'URGENT: Churn risk detected in 3 enterprise accounts',
      content: 'Engagement scores dropped below threshold. Immediate outreach recommended.',
      category: 'urgent',
      priority: 'high',
      relevanceScore: 0.98,
      source: 'Churn Prediction',
      publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isActionable: true,
    },
    {
      id: 'mock-2',
      title: 'Competitor X launched new pricing tier',
      content: '23% price reduction in starter plan with added features.',
      category: 'competitors',
      priority: 'high',
      relevanceScore: 0.94,
      source: 'Market Intelligence',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isActionable: true,
    },
  ];

  const filtered = category === 'all' ? items : items.filter((i) => i.category === category);
  return filtered.slice(0, limit);
}

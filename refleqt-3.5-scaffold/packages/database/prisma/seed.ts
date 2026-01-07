// Database Seed Script for Refleqt 3.5
// Run with: pnpm --filter @refleqt/database prisma db seed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'alex@taskflow.io' },
    update: {},
    create: {
      email: 'alex@taskflow.io',
      name: 'Alex Chen',
      profile: {
        create: {
          companyName: 'TaskFlow',
          industry: 'SaaS / Productivity',
          businessChallenge: 'Scaling from SMB to Enterprise market',
          obsessionScore: 8.4,
        },
      },
    },
  });

  console.log(`✅ Created user: ${user.name} (${user.id})`);

  // Create intelligence source
  const source = await prisma.intelligenceSource.upsert({
    where: {
      userId_sourceUrl: {
        userId: user.id,
        sourceUrl: 'internal://market-intelligence',
      },
    },
    update: {},
    create: {
      userId: user.id,
      sourceType: 'internal',
      sourceUrl: 'internal://market-intelligence',
      sourceName: 'Refleqt Market Intelligence',
      category: 'market',
      isActive: true,
    },
  });

  console.log(`✅ Created intelligence source: ${source.sourceName}`);

  // Create intelligence items
  const intelligenceItems = [
    {
      title: 'URGENT: Churn risk detected in 3 enterprise accounts',
      content: 'Engagement scores dropped below threshold for AccountCorp, TechGiant, and DataFlow. Immediate outreach recommended. Historical data shows 78% recovery rate when contacted within 48 hours.',
      category: 'urgent',
      priority: 'high',
      isActionable: true,
      relevanceScore: 0.98,
      publishedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      title: 'Competitor X launched new pricing tier targeting SMBs',
      content: 'Analysis shows 23% price reduction in their starter plan with added features that directly compete with your core offering. Market response indicates potential customer migration risk.',
      category: 'competitors',
      priority: 'high',
      isActionable: true,
      relevanceScore: 0.94,
      publishedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      title: 'Conversion funnel drop-off detected at pricing page',
      content: 'User behavior analysis shows 34% bounce rate increase on pricing page over last 7 days. Heat map analysis suggests confusion around feature comparison. A/B test recommended.',
      category: 'conversion',
      priority: 'high',
      isActionable: true,
      relevanceScore: 0.91,
      publishedAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      title: 'Trial-to-paid conversion optimization opportunity',
      content: 'Users who complete onboarding checklist convert at 2.4x rate. Only 43% currently complete it. Gamification or progress indicators could drive completion.',
      category: 'conversion',
      priority: 'high',
      isActionable: true,
      relevanceScore: 0.89,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      title: 'Enterprise segment showing increased engagement',
      content: 'Enterprise trial signups increased 18% this week. Product-qualified leads up by 12 accounts. Sales team should prioritize outreach to high-engagement trials.',
      category: 'users',
      priority: 'medium',
      isActionable: false,
      relevanceScore: 0.87,
      publishedAt: new Date(Date.now() - 1000 * 60 * 90),
    },
    {
      title: 'Market trend: AI-first positioning gaining traction',
      content: 'Industry reports show 67% of B2B SaaS buyers now prioritize AI capabilities. Competitors emphasizing AI in messaging see 40% higher engagement. Consider messaging update.',
      category: 'market',
      priority: 'medium',
      isActionable: true,
      relevanceScore: 0.85,
      publishedAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      title: 'Competitor Y acquired by major player',
      content: 'Strategic acquisition may lead to feature consolidation and aggressive pricing. Monitor for positioning changes. Historical acquisitions in this space led to 6-month feature parity push.',
      category: 'competitors',
      priority: 'medium',
      isActionable: false,
      relevanceScore: 0.83,
      publishedAt: new Date(Date.now() - 1000 * 60 * 180),
    },
    {
      title: 'New feature adoption rate exceeds expectations',
      content: 'Dashboard v2 adoption at 78% after 2 weeks. Power users showing 3.2x higher engagement. Consider featuring success stories in marketing content.',
      category: 'users',
      priority: 'low',
      isActionable: false,
      relevanceScore: 0.72,
      publishedAt: new Date(Date.now() - 1000 * 60 * 240),
    },
  ];

  for (const item of intelligenceItems) {
    await prisma.intelligenceItem.create({
      data: {
        sourceId: source.id,
        userId: user.id,
        ...item,
      },
    });
  }

  console.log(`✅ Created ${intelligenceItems.length} intelligence items`);

  // Create user metrics (KPIs)
  const metrics = [
    { metricType: 'conversion_rate', value: 3.2, previousValue: 2.9, target: 8.0 },
    { metricType: 'churn', value: 11.8, previousValue: 9.8, target: 5.0 },
    { metricType: 'ltv', value: 865, previousValue: 772, target: 1200 },
    { metricType: 'mrr', value: 24100, previousValue: 22300, target: 50000 },
  ];

  for (const metric of metrics) {
    await prisma.userMetrics.create({
      data: {
        userId: user.id,
        ...metric,
        period: 'monthly',
      },
    });
  }

  console.log(`✅ Created ${metrics.length} user metrics`);

  // Create obsession score history
  const obsessionScores = [
    { score: 8.4, factors: { engagement: 9.2, consistency: 8.1, depth: 7.9 } },
    { score: 8.1, factors: { engagement: 8.8, consistency: 8.0, depth: 7.5 } },
    { score: 7.8, factors: { engagement: 8.5, consistency: 7.6, depth: 7.3 } },
  ];

  for (let i = 0; i < obsessionScores.length; i++) {
    await prisma.obsessionScore.create({
      data: {
        userId: user.id,
        score: obsessionScores[i].score,
        factors: obsessionScores[i].factors,
        calculatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * i), // One per day
      },
    });
  }

  console.log(`✅ Created ${obsessionScores.length} obsession score records`);

  // Create some competitors
  const competitors = [
    { name: 'Competitor X', website: 'https://competitorx.com' },
    { name: 'Competitor Y', website: 'https://competitory.com' },
    { name: 'Competitor Z', website: 'https://competitorz.com' },
  ];

  for (const competitor of competitors) {
    await prisma.competitor.create({
      data: {
        userId: user.id,
        ...competitor,
      },
    });
  }

  console.log(`✅ Created ${competitors.length} competitors`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

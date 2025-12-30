/**
 * Seed script for Research Swarm Templates
 * Run with: npx tsx scripts/seed-swarm-templates.ts
 */

import prisma from "../src/lib/db/prisma.js";

const systemTemplates = [
  {
    icon: "🎯",
    title: "Competitor Feature Gap Analysis",
    description:
      "Identify missing features in competitor products that could be your competitive advantage",
    query:
      "Compare TaskFlow features against Notion, Airtable, Monday.com, and Asana. Identify gaps in their offerings that we could exploit as competitive advantages. Focus on missing integrations, workflow limitations, and user complaints.",
    swarmType: "competitive",
  },
  {
    icon: "💰",
    title: "SaaS Pricing Strategy Intelligence",
    description:
      "Monitor competitor pricing changes and market positioning strategies",
    query:
      "Analyze current pricing strategies of Asana, Monday.com, Notion, Airtable, and Clickup. Track recent price changes, feature tier adjustments, and customer reactions. Provide recommendations for TaskFlow pricing optimization.",
    swarmType: "competitive",
  },
  {
    icon: "📈",
    title: "Market Opportunity Mapping",
    description:
      "Discover emerging market segments and untapped customer needs",
    query:
      "Research fastest-growing industry segments adopting project management software in 2024-2025. Analyze their specific needs, budget ranges, and preferred feature sets. Identify underserved niches TaskFlow could target.",
    swarmType: "market",
  },
  {
    icon: "👥",
    title: "Customer Churn Analysis",
    description:
      "Understand why customers leave for competitors and how to prevent it",
    query:
      "Research why SaaS customers churn from project management tools. Analyze competitor customer reviews, complaints, and migration patterns. Identify early warning signs and retention strategies that work.",
    swarmType: "customer",
  },
  {
    icon: "🤖",
    title: "AI Feature Competitive Landscape",
    description:
      "Track AI integration strategies across the competitive landscape",
    query:
      "Analyze AI features being integrated into project management tools by competitors. Track implementation approaches, customer reception, pricing models for AI features, and identify opportunities for TaskFlow's AI strategy.",
    swarmType: "product",
  },
  {
    icon: "🔗",
    title: "Integration Ecosystem Analysis",
    description:
      "Map competitor integration strategies and identify partnership gaps",
    query:
      "Research integration ecosystems of major project management competitors. Analyze partnership strategies, API usage patterns, and integration gaps that TaskFlow could fill to gain competitive advantage.",
    swarmType: "product",
  },
  {
    icon: "🌍",
    title: "Global Market Expansion Intelligence",
    description:
      "Research international market opportunities and localization requirements",
    query:
      "Research international expansion strategies of successful SaaS project management tools. Analyze market entry approaches, localization requirements, pricing strategies, and regulatory considerations for key markets.",
    swarmType: "market",
  },
  {
    icon: "📊",
    title: "Customer Segment Deep Dive",
    description:
      "Analyze specific customer segments and their unique requirements",
    query:
      "Deep dive into different customer segments using project management tools. Compare needs, behaviors, and satisfaction patterns between startups, SMBs, and enterprises. Identify segment-specific opportunities.",
    swarmType: "customer",
  },
];

async function main() {
  console.log("Seeding swarm templates...");

  // Clear existing system templates
  await prisma.swarmTemplate.deleteMany({
    where: {
      userId: null, // System templates
    },
  });

  // Create system templates
  for (const template of systemTemplates) {
    await prisma.swarmTemplate.create({
      data: {
        ...template,
        userId: null, // System template
        isPublic: false,
        usageCount: 0,
      },
    });
  }

  console.log(`✅ Created ${systemTemplates.length} system swarm templates`);
}

main()
  .catch((e) => {
    console.error("Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

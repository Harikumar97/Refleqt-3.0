/**
 * Seed Test User for Development
 * Creates a test user so the app can function without authentication
 */

import { config } from 'dotenv';
// Load .env.local file BEFORE importing prisma
config({ path: '.env.local' });

import prisma from '../src/lib/db/prisma';

async function main() {
  console.log('🌱 Seeding test user...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'demo@refleqt.ai' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'demo@refleqt.ai',
      name: 'Demo User',
      password: null,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create user profile
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      companyName: 'Demo Company',
      industry: 'Technology',
      businessChallenge: 'Understanding competitive landscape and market trends',
      obsessionScore: 7.5,
    },
  });

  console.log('✅ Created profile for:', user.email);
  console.log('📊 Obsession Score:', profile.obsessionScore);
  console.log('\n🎉 Seed complete! You can now use the app with:');
  console.log('   Email:', user.email);
  console.log('   User ID:', user.id);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

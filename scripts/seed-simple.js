// Simple SQLite seed script
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath);

console.log('🌱 Seeding test user into SQLite database...');
console.log('📂 Database path:', dbPath);

try {
  // Insert user
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, name, password, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  insertUser.run('demo-user-id', 'demo@refleqt.ai', 'Demo User', null, now, now);

  console.log('✅ Created user: demo@refleqt.ai');

  // Insert user profile
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO user_profiles (id, user_id, company_name, industry, business_challenge, obsession_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const profileId = 'demo-profile-id';
  insertProfile.run(
    profileId,
    'demo-user-id',
    'Demo Company',
    'Technology',
    'Understanding competitive landscape and market trends',
    7.5,
    now,
    now
  );

  console.log('✅ Created profile for: demo@refleqt.ai');
  console.log('📊 Obsession Score: 7.5');

  // Verify the data
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get('demo-user-id');
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get('demo-user-id');

  console.log('\n🎉 Seed complete!');
  console.log('   User:', user);
  console.log('   Profile:', profile);

} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
} finally {
  db.close();
}

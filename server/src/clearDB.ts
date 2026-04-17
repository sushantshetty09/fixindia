import sql from './db';

async function clear() {
  console.log('🧹 Clearing legacy mock data from database...');
  try {
    await sql`TRUNCATE TABLE reports, news_items, users, upvotes, verifications CASCADE;`;
    console.log('✅ All mock data cleared successfully.');
  } catch (error) {
    console.error('❌ Failed to clear mock data:', error);
  } finally {
    await sql.end();
  }
}

clear();

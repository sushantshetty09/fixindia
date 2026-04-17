import sql from './db';

async function migrate() {
  console.log('🚀 Running database migration...');
  try {
    await sql`
      ALTER TABLE reports 
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `;
    console.log('✅ Migration complete: image_url column added to reports table.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();

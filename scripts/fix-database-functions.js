const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixDatabaseFunctions() {
  try {
    console.log('🔧 Fixing database function conflicts...');

    // Drop existing functions that are causing conflicts
    console.log('🗑️ Dropping existing functions...');
    await sql`DROP FUNCTION IF EXISTS calculate_current_streak(uuid) CASCADE`;
    await sql`DROP FUNCTION IF EXISTS calculate_total_completions(uuid) CASCADE`;

    console.log('✅ Database functions fixed!');
    console.log('🎉 Your app should now work without function conflicts!');
    
  } catch (error) {
    console.error('❌ Failed to fix database functions:', error);
    process.exit(1);
  }
}

fixDatabaseFunctions(); 
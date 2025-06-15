const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration for user authentication...');

    // Create users table
    console.log('📝 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        avatar_url TEXT,
        provider VARCHAR(50) NOT NULL DEFAULT 'credentials',
        provider_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for users table
    console.log('📊 Creating indexes for users table...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id)`;

    // Check if user_id column exists in activities table
    console.log('🔍 Checking activities table structure...');
    const activitiesColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activities' AND column_name = 'user_id'
    `;

    if (activitiesColumns.length === 0) {
      console.log('➕ Adding user_id column to activities table...');
      await sql`ALTER TABLE activities ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    }

    // Check if user_id column exists in activity_logs table
    console.log('🔍 Checking activity_logs table structure...');
    const activityLogsColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'activity_logs' AND column_name = 'user_id'
    `;

    if (activityLogsColumns.length === 0) {
      console.log('➕ Adding user_id column to activity_logs table...');
      await sql`ALTER TABLE activity_logs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    }

    // Create indexes for user_id columns
    console.log('📊 Creating indexes for user_id columns...');
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`;

    // Check if there are existing activities without user_id
    const existingActivities = await sql`SELECT COUNT(*) as count FROM activities WHERE user_id IS NULL`;
    
    if (existingActivities[0].count > 0) {
      console.log('👤 Creating demo user for existing data...');
      
      // Create demo user
      const demoUser = await sql`
        INSERT INTO users (email, name, provider) 
        VALUES ('demo@momentum.app', 'Demo User', 'credentials')
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      
      const demoUserId = demoUser[0].id;
      
      // Assign existing activities to demo user
      console.log('🔗 Assigning existing activities to demo user...');
      await sql`UPDATE activities SET user_id = ${demoUserId} WHERE user_id IS NULL`;
      await sql`UPDATE activity_logs SET user_id = ${demoUserId} WHERE user_id IS NULL`;
    }

    // Make user_id NOT NULL
    console.log('🔒 Making user_id columns required...');
    await sql`ALTER TABLE activities ALTER COLUMN user_id SET NOT NULL`;
    await sql`ALTER TABLE activity_logs ALTER COLUMN user_id SET NOT NULL`;

    console.log('✅ Database migration completed successfully!');
    console.log('🎉 Your app now supports user authentication!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 
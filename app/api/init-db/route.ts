import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Default user ID for single-user application
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function POST() {
  try {
    console.log("Initializing database...")

    // Create users table first
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        avatar_url TEXT,
        provider VARCHAR(50) DEFAULT 'credentials',
        provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create activities table
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        emoji VARCHAR(10) DEFAULT '🎯',
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create activity_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(activity_id, date)
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_id ON activity_logs(activity_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(date)`

    // Drop existing functions if they exist to avoid conflicts
    await sql`DROP FUNCTION IF EXISTS calculate_current_streak(UUID)`
    await sql`DROP FUNCTION IF EXISTS calculate_best_streak(UUID)`

    // Create the streak calculation functions
    await sql`
      CREATE OR REPLACE FUNCTION calculate_current_streak(activity_uuid UUID)
      RETURNS INTEGER AS $$
      DECLARE
          current_date DATE := CURRENT_DATE;
          streak_count INTEGER := 0;
          check_date DATE;
      BEGIN
          check_date := current_date;
          
          WHILE EXISTS (
              SELECT 1 FROM activity_logs 
              WHERE activity_id = activity_uuid 
              AND date = check_date
              AND count > 0
          ) LOOP
              streak_count := streak_count + 1;
              check_date := check_date - INTERVAL '1 day';
          END LOOP;
          
          RETURN streak_count;
      END;
      $$ LANGUAGE plpgsql;
    `

    await sql`
      CREATE OR REPLACE FUNCTION calculate_best_streak(activity_uuid UUID)
      RETURNS INTEGER AS $$
      DECLARE
          max_streak INTEGER := 0;
          current_streak INTEGER := 0;
          prev_date DATE;
          log_record RECORD;
      BEGIN
          FOR log_record IN 
              SELECT date FROM activity_logs 
              WHERE activity_id = activity_uuid 
              AND count > 0
              ORDER BY date ASC
          LOOP
              IF prev_date IS NULL OR log_record.date = prev_date + INTERVAL '1 day' THEN
                  current_streak := current_streak + 1;
              ELSE
                  current_streak := 1;
              END IF;
              
              IF current_streak > max_streak THEN
                  max_streak := current_streak;
              END IF;
              
              prev_date := log_record.date;
          END LOOP;
          
          RETURN max_streak;
      END;
      $$ LANGUAGE plpgsql;
    `

    // Create the default user
    await sql`
      INSERT INTO users (id, email, name, provider) 
      VALUES (${DEFAULT_USER_ID}, 'user@momentum.app', 'Momentum User', 'default')
      ON CONFLICT (id) DO NOTHING
    `

    // Check if we have any activities for the default user, if not, add demo data
    const existingActivities = await sql`
      SELECT COUNT(*) as count FROM activities WHERE user_id = ${DEFAULT_USER_ID}
    `

    if (Number(existingActivities[0].count) === 0) {
      console.log("Adding demo activities...")

      const demoActivities = await sql`
        INSERT INTO activities (user_id, name, emoji, description) VALUES
        (${DEFAULT_USER_ID}, 'Morning Exercise', '💪', '30 minutes of workout to start the day'),
        (${DEFAULT_USER_ID}, 'Read Books', '📚', 'Read for at least 20 minutes daily'),
        (${DEFAULT_USER_ID}, 'Meditation', '🧘', 'Daily mindfulness and meditation practice')
        RETURNING id
      `

      // Add some demo logs for the past few days
      const today = new Date()
      for (let i = 0; i < 5; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        for (const activity of demoActivities) {
          if (Math.random() > 0.3) {
            // 70% chance of doing the activity
            await sql`
              INSERT INTO activity_logs (activity_id, user_id, date, count)
              VALUES (${activity.id}, ${DEFAULT_USER_ID}, ${dateStr}, ${Math.floor(Math.random() * 3) + 1})
              ON CONFLICT (activity_id, date) DO NOTHING
            `
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully with default user and demo data" 
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      { error: "Failed to initialize database", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

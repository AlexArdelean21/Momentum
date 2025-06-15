import { neon } from "@neondatabase/serverless"
import type { Activity } from "./types"

const sql = neon(process.env.DATABASE_URL!)

// Simple in-memory flag to track if database is initialized
let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) return // Skip if already initialized

  try {
    console.log("Initializing database...")

    // Create activities table
    await sql`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(activity_id, date)
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_id ON activity_logs(activity_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(date)`

    // Create a simple streak calculation function
    await sql`
      CREATE OR REPLACE FUNCTION calculate_current_streak(target_activity_id UUID)
      RETURNS INTEGER AS $$
      DECLARE
          streak_count INTEGER := 0;
          check_date DATE := CURRENT_DATE;
      BEGIN
          WHILE EXISTS (
              SELECT 1 FROM activity_logs 
              WHERE activity_id = target_activity_id 
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
      CREATE OR REPLACE FUNCTION calculate_best_streak(target_activity_id UUID)
      RETURNS INTEGER AS $$
      DECLARE
          max_streak INTEGER := 0;
          current_streak INTEGER := 0;
          prev_date DATE;
          log_record RECORD;
      BEGIN
          FOR log_record IN 
              SELECT date FROM activity_logs 
              WHERE activity_id = target_activity_id 
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

    // Check if we have any activities, if not, add demo data
    const existingActivities = await sql`SELECT COUNT(*) as count FROM activities`

    if (Number(existingActivities[0].count) === 0) {
      console.log("Adding demo activities...")

      const demoActivities = await sql`
        INSERT INTO activities (name, emoji, description) VALUES
        ('Morning Exercise', '💪', '30 minutes of workout to start the day'),
        ('Read Books', '📚', 'Read for at least 20 minutes daily'),
        ('Meditation', '🧘', 'Daily mindfulness and meditation practice')
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
              INSERT INTO activity_logs (activity_id, date, count)
              VALUES (${activity.id}, ${dateStr}, ${Math.floor(Math.random() * 3) + 1})
              ON CONFLICT (activity_id, date) DO NOTHING
            `
          }
        }
      }
    }

    isInitialized = true
    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Database initialization failed:", error)
    // Don't throw here to allow the app to continue
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    // Initialize database if not already done
    if (!isInitialized) {
      await initializeDatabase()
    }

    const today = new Date().toISOString().split("T")[0]

    const activities = await sql`
      SELECT 
        a.id,
        a.name,
        a.emoji,
        a.description,
        a.created_at,
        COALESCE(today_log.count, 0) as today_count,
        COALESCE(total_stats.total_days, 0) as total_days,
        calculate_current_streak(a.id) as current_streak,
        calculate_best_streak(a.id) as best_streak
      FROM activities a
      LEFT JOIN activity_logs today_log ON a.id = today_log.activity_id AND today_log.date = ${today}
      LEFT JOIN (
        SELECT 
          activity_id,
          COUNT(DISTINCT date) as total_days
        FROM activity_logs 
        WHERE count > 0
        GROUP BY activity_id
      ) total_stats ON a.id = total_stats.activity_id
      ORDER BY a.created_at DESC
    `

    return activities.map((row) => ({
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      description: row.description,
      createdAt: new Date(row.created_at),
      todayCount: Number(row.today_count) || 0,
      totalDays: Number(row.total_days) || 0,
      currentStreak: Number(row.current_streak) || 0,
      bestStreak: Number(row.best_streak) || 0,
    }))
  } catch (error) {
    console.error("Failed to fetch activities:", error)
    return []
  }
}

export async function getTodaySummary() {
  try {
    // Initialize database if not already done
    if (!isInitialized) {
      await initializeDatabase()
    }

    const today = new Date().toISOString().split("T")[0]

    const result = await sql`
      SELECT 
        COALESCE(SUM(count), 0) as total_actions,
        COUNT(DISTINCT activity_id) as active_streaks
      FROM activity_logs 
      WHERE date = ${today}
      AND count > 0
    `

    const summaryResult = result[0]

    return {
      totalActions: Number(summaryResult?.total_actions) || 0,
      activeStreaks: Number(summaryResult?.active_streaks) || 0,
    }
  } catch (error) {
    console.error("Failed to fetch today's summary:", error)
    return {
      totalActions: 0,
      activeStreaks: 0,
    }
  }
}

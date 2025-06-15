import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Check if tables exist and create them if they don't
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

    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(activity_id, date)
      )
    `

    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_id ON activity_logs(activity_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(date)`

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

    await sql`
      CREATE OR REPLACE FUNCTION get_activity_stats(activity_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
      RETURNS TABLE(
          today_count INTEGER,
          total_days BIGINT,
          current_streak INTEGER,
          best_streak INTEGER
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              COALESCE((
                  SELECT al.count 
                  FROM activity_logs al 
                  WHERE al.activity_id = activity_uuid 
                  AND al.date = target_date
              ), 0) as today_count,
              
              COALESCE((
                  SELECT COUNT(DISTINCT al.date)
                  FROM activity_logs al 
                  WHERE al.activity_id = activity_uuid 
                  AND al.count > 0
              ), 0) as total_days,
              
              calculate_current_streak(activity_uuid) as current_streak,
              calculate_best_streak(activity_uuid) as best_streak;
      END;
      $$ LANGUAGE plpgsql;
    `

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      { error: "Failed to initialize database", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

import { neon } from "@neondatabase/serverless"
import type { Activity } from "./types"

const sql = neon(process.env.DATABASE_URL!)

// Default user ID for single-user application
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function initializeDatabase() {
  try {
    console.log("Checking database initialization...")

    // Simple check - just ensure the default user exists
    const users = await sql`
      SELECT id FROM users WHERE id = ${DEFAULT_USER_ID}
    `

    if (users.length === 0) {
      console.log("Default user not found. Please initialize the database by calling /api/init-db")
      return false
    }

    console.log("Database appears to be initialized")
    return true
  } catch (error) {
    console.error("Database check failed:", error)
    return false
  }
}

export async function getActivities(userId: string = DEFAULT_USER_ID): Promise<Activity[]> {
  try {
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
      WHERE a.user_id = ${userId}
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

export async function getTodaySummary(userId: string = DEFAULT_USER_ID) {
  try {
    const today = new Date().toISOString().split("T")[0]

    const result = await sql`
      SELECT 
        COALESCE(SUM(count), 0) as total_actions,
        COUNT(DISTINCT activity_id) as active_streaks
      FROM activity_logs 
      WHERE date = ${today}
      AND count > 0
      AND user_id = ${userId}
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

"use server"

import { revalidatePath } from "next/cache"
import { neon } from "@neondatabase/serverless"
import type { CreateActivityData } from "./types"

const sql = neon(process.env.DATABASE_URL!)

// Default user ID for single-user application
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function createActivity(data: CreateActivityData) {
  try {
    await sql`
      INSERT INTO activities (user_id, name, emoji, description)
      VALUES (${DEFAULT_USER_ID}, ${data.name}, ${data.emoji}, ${data.description})
    `

    revalidatePath("/")
  } catch (error) {
    console.error("Failed to create activity:", error)
    throw new Error("Failed to create activity")
  }
}

export async function editActivity(activityId: string, data: CreateActivityData) {
  try {
    await sql`
      UPDATE activities 
      SET name = ${data.name}, emoji = ${data.emoji}, description = ${data.description}, updated_at = NOW()
      WHERE id = ${activityId} AND user_id = ${DEFAULT_USER_ID}
    `

    revalidatePath("/")
  } catch (error) {
    console.error("Failed to edit activity:", error)
    throw new Error("Failed to edit activity")
  }
}

export async function incrementActivity(activityId: string) {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Insert or update today's log
    await sql`
      INSERT INTO activity_logs (activity_id, user_id, date, count)
      VALUES (${activityId}, ${DEFAULT_USER_ID}, ${today}, 1)
      ON CONFLICT (activity_id, date)
      DO UPDATE SET count = activity_logs.count + 1
    `

    // Get the new streak count
    const [streakResult] = await sql`
      SELECT calculate_current_streak(${activityId}) as new_streak
    `

    revalidatePath("/")

    return {
      newStreak: Number(streakResult?.new_streak) || 0,
    }
  } catch (error) {
    console.error("Failed to increment activity:", error)
    throw new Error("Failed to increment activity")
  }
}

export async function undoLastIncrement(activityId: string) {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Decrease count by 1, but don't go below 0
    await sql`
      UPDATE activity_logs 
      SET count = GREATEST(count - 1, 0)
      WHERE activity_id = ${activityId} AND user_id = ${DEFAULT_USER_ID} AND date = ${today}
    `

    // Remove the log entry if count becomes 0
    await sql`
      DELETE FROM activity_logs 
      WHERE activity_id = ${activityId} AND user_id = ${DEFAULT_USER_ID} AND date = ${today} AND count = 0
    `

    revalidatePath("/")
  } catch (error) {
    console.error("Failed to undo increment:", error)
    throw new Error("Failed to undo increment")
  }
}

export async function deleteActivity(activityId: string) {
  try {
    // Delete the activity
    await sql`
      DELETE FROM activities 
      WHERE id = ${activityId} AND user_id = ${DEFAULT_USER_ID}
    `
    
    revalidatePath("/")
  } catch (error) {
    console.error("Failed to delete activity:", error)
    throw new Error("Failed to delete activity")
  }
}

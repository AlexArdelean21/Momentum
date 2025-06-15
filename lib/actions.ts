"use server"

import { revalidatePath } from "next/cache"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import type { CreateActivityData } from "./types"
import { initializeDatabase } from "./database"

const sql = neon(process.env.DATABASE_URL!)

export async function createActivity(data: CreateActivityData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Ensure database is initialized
    await initializeDatabase()

    await sql`
      INSERT INTO activities (user_id, name, emoji, description)
      VALUES (${session.user.id}, ${data.name}, ${data.emoji}, ${data.description})
    `

    revalidatePath("/")
  } catch (error) {
    console.error("Failed to create activity:", error)
    throw new Error("Failed to create activity")
  }
}

export async function incrementActivity(activityId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Ensure database is initialized
    await initializeDatabase()

    const today = new Date().toISOString().split("T")[0]

    // Verify the activity belongs to the user
    const activities = await sql`
      SELECT id FROM activities WHERE id = ${activityId} AND user_id = ${session.user.id}
    `
    
    if (activities.length === 0) {
      throw new Error("Activity not found or unauthorized")
    }

    // Insert or update today's log
    await sql`
      INSERT INTO activity_logs (activity_id, user_id, date, count)
      VALUES (${activityId}, ${session.user.id}, ${today}, 1)
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Ensure database is initialized
    await initializeDatabase()

    const today = new Date().toISOString().split("T")[0]

    // Verify the activity belongs to the user
    const activities = await sql`
      SELECT id FROM activities WHERE id = ${activityId} AND user_id = ${session.user.id}
    `
    
    if (activities.length === 0) {
      throw new Error("Activity not found or unauthorized")
    }

    // Decrease count by 1, but don't go below 0
    await sql`
      UPDATE activity_logs 
      SET count = GREATEST(count - 1, 0)
      WHERE activity_id = ${activityId} AND user_id = ${session.user.id} AND date = ${today}
    `

    // Remove the log entry if count becomes 0
    await sql`
      DELETE FROM activity_logs 
      WHERE activity_id = ${activityId} AND user_id = ${session.user.id} AND date = ${today} AND count = 0
    `

    revalidatePath("/")
  } catch (error) {
    console.error("Failed to undo increment:", error)
    throw new Error("Failed to undo increment")
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // Ensure database is initialized
    await initializeDatabase()

    // Verify the activity belongs to the user and delete it
    await sql`
      DELETE FROM activities 
      WHERE id = ${activityId} AND user_id = ${session.user.id}
    `
    
    revalidatePath("/")
  } catch (error) {
    console.error("Failed to delete activity:", error)
    throw new Error("Failed to delete activity")
  }
}

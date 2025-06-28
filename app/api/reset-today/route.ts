import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0]
    
    // Delete all activity logs for today
    await sql`
      DELETE FROM activity_logs 
      WHERE date = ${today}
    `

    return NextResponse.json({ 
      success: true, 
      message: "Today's activity counts have been reset" 
    })
  } catch (error) {
    console.error("Failed to reset today's counts:", error)
    return NextResponse.json(
      { error: "Failed to reset today's counts" },
      { status: 500 }
    )
  }
} 
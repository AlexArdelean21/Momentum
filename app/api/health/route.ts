import { NextResponse } from 'next/server'
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Simple health check query
    await sql`SELECT 1 as health_check`

    // Check if our tables exist
    const tableCheck = await sql`
      SELECT 
        EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activities') as activities_exists,
        EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs') as logs_exists
    `

    const tablesExist = tableCheck[0]?.activities_exists && tableCheck[0]?.logs_exists

    if (!tablesExist) {
      return NextResponse.json(
        {
          error: "Database tables not found",
          details: "Tables will be created automatically on first use",
        },
        { status: 500 },
      )
    }

    // Check if we have any data
    const dataCheck = await sql`
      SELECT 
        (SELECT COUNT(*) FROM activities) as activity_count,
        (SELECT COUNT(*) FROM activity_logs) as log_count
    `

    return NextResponse.json({
      success: true,
      message: "Database is healthy",
      data: {
        activities: Number(dataCheck[0]?.activity_count) || 0,
        logs: Number(dataCheck[0]?.log_count) || 0,
      },
    })
  } catch (error) {
    console.error("Database health check failed:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

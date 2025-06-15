import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database_url_exists: !!process.env.DATABASE_URL,
      nextauth_secret_exists: !!process.env.NEXTAUTH_SECRET,
      nextauth_url: process.env.NEXTAUTH_URL || 'not set'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 })
  }
}

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { ActivityDashboard } from "@/components/activity-dashboard"
import { AddActivityButton } from "@/components/add-activity-button"
import { TodaySummary } from "@/components/today-summary"
import { LoadingSpinner } from "@/components/loading-spinner"
import { DatabaseStatus } from "@/components/database-status"
import { ProjectsTeaser } from "@/components/projects/ProjectsTeaser"

export default async function Home() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />

        <DatabaseStatus />

        <div className="mb-10">
          <Suspense fallback={<LoadingSpinner />}>
            <TodaySummary />
          </Suspense>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Activities
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your daily habits and build streaks</p>
          </div>
          <AddActivityButton />
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <ActivityDashboard />
        </Suspense>

        {/* Projects teaser */}
        <Suspense fallback={<div className="h-24" />}>
          {/* @ts-expect-error Server Component */}
          <ProjectsTeaser />
        </Suspense>
      </div>
    </div>
  )
}

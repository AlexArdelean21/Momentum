import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { ActivityDashboard } from "@/components/activity-dashboard"
import { AddActivityButton } from "@/components/add-activity-button"
import { TodaySummary } from "@/components/today-summary"
import { LoadingSpinner } from "@/components/loading-spinner"
import { DatabaseStatus } from "@/components/database-status"
import { TabbedDashboard } from "@/components/projects/TabbedDashboard"

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

        {/* Unified dashboard tabs */}
        {/* Activities grid is rendered as a slot to ensure visibility */}
        <TabbedDashboard
          activitiesSlot={
            <Suspense fallback={<LoadingSpinner />}>
              <ActivityDashboard />
            </Suspense>
          }
        />
      </div>
    </div>
  )
}

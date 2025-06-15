import { Suspense } from "react"
import { Header } from "@/components/header"
import { ActivityDashboard } from "@/components/activity-dashboard"
import { AddActivityButton } from "@/components/add-activity-button"
import { TodaySummary } from "@/components/today-summary"
import { LoadingSpinner } from "@/components/loading-spinner"
import { DatabaseStatus } from "@/components/database-status"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />

        <DatabaseStatus />

        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <TodaySummary />
          </Suspense>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Activities</h2>
          <AddActivityButton />
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <ActivityDashboard />
        </Suspense>
      </div>
    </div>
  )
}

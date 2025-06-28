import { getActivities } from "@/lib/database"
import { ActivityCard } from "./activity-card"

// Default user ID for single-user application
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function ActivityDashboard() {
  const activities = await getActivities(DEFAULT_USER_ID)

  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6 animate-bounce">🎯</div>
        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">No activities yet</h3>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Create your first activity to start building amazing streaks and develop lasting habits!
        </p>
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
            <p className="text-orange-700 dark:text-orange-300 font-semibold">
              💡 Click "Add Activity" above to get started!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

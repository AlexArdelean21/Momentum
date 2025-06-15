import { getActivities } from "@/lib/database"
import { ActivityCard } from "./activity-card"

export async function ActivityDashboard() {
  const activities = await getActivities()

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No activities yet</h3>
        <p className="text-gray-500 dark:text-gray-400">Create your first activity to start building streaks!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

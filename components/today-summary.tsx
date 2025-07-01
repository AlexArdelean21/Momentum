import { getTodaySummary } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Target } from "lucide-react"

export async function TodaySummary() {
  const summary = await getTodaySummary()

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-2xl overflow-hidden relative hover:shadow-3xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-red-600/30 backdrop-blur-sm"></div>
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
              <Flame className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Momentum</h2>
              <p className="text-orange-100 font-medium text-lg">Keep the fire burning! 🚀</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-5xl font-bold mb-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
              {summary.totalActions}
            </div>
            <div className="text-base text-orange-100 font-semibold">Actions completed</div>
          </div>
        </div>

        {summary.activeStreaks > 0 && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Target className="h-6 w-6 text-orange-100" />
                </div>
                <span className="font-bold text-orange-100 text-lg">Active Streaks</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-3xl font-bold">{summary.activeStreaks}</span>
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


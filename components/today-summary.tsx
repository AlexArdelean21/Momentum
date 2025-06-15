import { getTodaySummary } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Target } from "lucide-react"

export async function TodaySummary() {
  const summary = await getTodaySummary()

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Today's Momentum</h2>
              <p className="text-orange-100 font-medium">Keep the fire burning!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{summary.totalActions}</div>
            <div className="text-sm text-orange-100 font-medium">Actions completed</div>
          </div>
        </div>

        {summary.activeStreaks > 0 && (
          <div className="mt-6 pt-4 border-t border-orange-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-orange-100" />
                <span className="font-semibold text-orange-100">Active Streaks</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{summary.activeStreaks}</span>
                <span className="text-xl">🔥</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

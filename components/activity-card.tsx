"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Undo2, Trash2, MoreVertical, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { incrementActivity, undoLastIncrement, deleteActivity } from "@/lib/actions"
import { ConfettiEffect } from "./confetti-effect"
import { StreakFlame } from "./streak-flame"
import { EditActivityModal } from "./edit-activity-modal"
import type { Activity } from "@/lib/types"

interface ActivityCardProps {
  activity: Activity
}

// Motivational messages for when today's count is 0
const MOTIVATIONAL_MESSAGES = [
  "Don't forget about me! 🥺",
  "You can do this! 💪",
  "Ready when you are! ✨",
  "Let's build that streak! 🔥",
  "I'm waiting for you! 😊",
  "Today's the day! 🌟",
  "You've got this! 💫",
  "Time to shine! ⭐",
  "Let's make it happen! 🚀",
  "Your future self will thank you! 🙏",
  "Small steps, big results! 👣",
  "Progress over perfection! 📈"
]

export function ActivityCard({ activity }: ActivityCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStreakFlame, setShowStreakFlame] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Get a consistent motivational message for this activity
  const motivationalMessage = MOTIVATIONAL_MESSAGES[
    activity.id.charCodeAt(0) % MOTIVATIONAL_MESSAGES.length
  ]

  const handleIncrement = async () => {
    setIsLoading(true)
    try {
      const result = await incrementActivity(activity.id)

      // Show confetti for any increment
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)

      // Show streak flame for milestone streaks
      if (result.newStreak && (result.newStreak % 7 === 0 || result.newStreak % 30 === 0)) {
        setShowStreakFlame(true)
        setTimeout(() => setShowStreakFlame(false), 3000)
      }
    } catch (error) {
      console.error("Failed to increment activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = async () => {
    setIsLoading(true)
    try {
      await undoLastIncrement(activity.id)
    } catch (error) {
      console.error("Failed to undo increment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${activity.name}"? This action cannot be undone.`)) {
      try {
        await deleteActivity(activity.id)
      } catch (error) {
        console.error("Failed to delete activity:", error)
      }
    }
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl p-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
                {activity.emoji || "🎯"}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{activity.name}</h3>
                {activity.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit} className="text-blue-600 dark:text-blue-400">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Activity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Activity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              {(activity.todayCount || 0) > 0 ? (
                <>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activity.todayCount}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">Today</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 px-2 py-1">
                    {motivationalMessage}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">Today</div>
                </>
              )}
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activity.totalDays || 0}</div>
              <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">Total Days</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {activity.currentStreak || 0}
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">Current Streak</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200/50 dark:border-red-700/50">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{activity.bestStreak || 0}</div>
              <div className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">Best Streak</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button
                onClick={handleIncrement}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold">+1</span>
                  </div>
                )}
              </Button>
            </motion.div>

            <Button
              onClick={handleUndo}
              disabled={isLoading || !activity.todayCount}
              variant="outline"
              size="icon"
              className="rounded-xl h-14 w-14 border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Undo2 className="h-5 w-5" />
            </Button>
          </div>

          {activity.currentStreak && activity.currentStreak > 0 && (
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 text-sm font-semibold border border-orange-200/50 dark:border-orange-700/50"
              >
                🔥 {activity.currentStreak} day streak!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <EditActivityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        activity={activity}
      />

      <AnimatePresence>
        {showConfetti && <ConfettiEffect />}
        {showStreakFlame && <StreakFlame streak={activity.currentStreak || 0} />}
      </AnimatePresence>
    </motion.div>
  )
}

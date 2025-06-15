"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createActivity } from "@/lib/actions"

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMOJI_OPTIONS = [
  "🎯",
  "💪",
  "📚",
  "🏃",
  "🧘",
  "💧",
  "🎨",
  "🎵",
  "🍎",
  "💤",
  "📝",
  "🌱",
  "🏋️",
  "🚶",
  "🧠",
  "❤️",
  "🌟",
  "⚡",
  "🔥",
  "✨",
  "🎪",
  "🎭",
  "🎬",
  "🎮",
  "🎲",
  "🎸",
  "🎹",
  "🎤",
  "🎧",
]

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🎯")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      await createActivity({
        name: name.trim(),
        emoji,
        description: description.trim() || null,
      })

      // Reset form
      setName("")
      setEmoji("🎯")
      setDescription("")
      onClose()
    } catch (error) {
      console.error("Failed to create activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border-0"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Add New Activity
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Activity Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Exercise"
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 h-12 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose an Emoji
                </label>
                <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto p-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl">
                  {EMOJI_OPTIONS.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      type="button"
                      onClick={() => setEmoji(emojiOption)}
                      className={`p-2 text-xl rounded-lg transition-all hover:scale-110 ${
                        emoji === emojiOption
                          ? "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 ring-2 ring-orange-500 shadow-lg"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {emojiOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Description (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your activity..."
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 resize-none text-base"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl h-12 border-2 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Flame className="h-4 w-4" />
                      <span>Create Activity</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

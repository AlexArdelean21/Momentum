"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { editActivity } from "@/lib/actions"
import type { Activity } from "@/lib/types"

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity | null
}

const EMOJI_OPTIONS = [
  "🎯", "💪", "📚", "🏃", "🧘", "💧", "🎨", "🎵", "🍎", "💤",
  "📝", "🌱", "🏋️", "🚶", "🧠", "❤️", "🌟", "⚡", "🔥", "✨",
  "💻", "💡", "💰", "📈", "📅", "✅", "🎉", "🏆", "🥇", "🚀",
  "🧗", "🚵", "🏊", "🧘‍♂️", "🤸", "🏀", "⚽", "⚾", "🎾", "🏐",
  "🎨", "🖌️", "🎼", "🎹", "🎺", "🥁", "💃", "🕺", "🎤", "🎧",
  "📖", "✏️", "🔬", "🔭", "⚗️", "🧪", "💾", "📈", "📊", "💡",
  "🥗", "🥑", "🥦", "🥕", "🍓", "🥝", "🍵", "🥤", "💊", "🩹",
  "🧼", "🛏️", "☀️", "🌙", "⭐", "🏞️", "🌅", "🌆", "🌲", "🌳",
  "👨‍💻", "👩‍💻", "👨‍🏫", "👩‍🏫", "👨‍🎨", "👩‍🎨", "👨‍🍳", "👩‍🍳", "👨‍🔬", "👩‍🔬",
  "💖", "💞", "💯", "🙌", "🙏", "🤝", "🤗", "🥰", "🥳", "🤩",
  "🏩","🥑","🥂","🍻","🛏️","🚲","⚽️","🎾","🧼","💊","🩻","🦠",
  "💸","✒️","💲","♛","🧑‍🧑‍🧒","🫦","🫁","💅","👮‍♂️","🧑‍🍳","💍","🙇🏼‍♀️",
  "🏊🏼‍♀️","⛹🏼","🧗🏼‍♂️","🧜🏾‍♂️","🧙🏾‍♂️","💃🏾","☢️","🌚","🍃","🍳","🎰","🌠",
]

export function EditActivityModal({ isOpen, onClose, activity }: EditActivityModalProps) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🎯")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when activity changes or modal opens
  useEffect(() => {
    if (activity && isOpen) {
      setName(activity.name || "")
      setEmoji(activity.emoji || "🎯")
      setDescription(activity.description || "")
    }
  }, [activity, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !activity) return

    setIsLoading(true)
    try {
      await editActivity(activity.id, {
        name: name.trim(),
        emoji,
        description: description.trim() || null,
      })

      onClose()
    } catch (error) {
      console.error("Failed to edit activity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && activity && (
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
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Activity
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
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 h-12 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Choose an Emoji
                </label>
                <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/20">
                  {EMOJI_OPTIONS.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      type="button"
                      onClick={() => setEmoji(emojiOption)}
                      className={`p-1.5 text-xl rounded-lg transition-all hover:scale-110 aspect-square flex items-center justify-center ${
                        emoji === emojiOption
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 ring-2 ring-blue-500 shadow-lg"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600"
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
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none text-base"
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
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>Save Changes</span>
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
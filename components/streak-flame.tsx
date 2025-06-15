"use client"

import { motion } from "framer-motion"

interface StreakFlameProps {
  streak: number
}

export function StreakFlame({ streak }: StreakFlameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -20 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
        🔥 {streak} Day Milestone! 🔥
      </div>
    </motion.div>
  )
}

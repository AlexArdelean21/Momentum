"use client"

import { Flame } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
          <Flame className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Momentum
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Build habits, gain momentum</p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  )
}

"use client"

import { Flame } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="flex items-center justify-between mb-12">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <Flame className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
            Momentum
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-semibold mt-1">
            Build habits, gain momentum 🚀
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </header>
  )
}

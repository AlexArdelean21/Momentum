"use client"

import { Flame, LogOut, User } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function Header() {
  const { data: session } = useSession()

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
        {session?.user && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-full px-3 py-2 backdrop-blur-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {session.user.name || session.user.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}

"use client"

import { Flame, LogOut, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Link from "next/link"

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
        <ThemeToggle />
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                    {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{session.user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

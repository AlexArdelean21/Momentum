"use client"

import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Flame, LogOut, User, Menu, FolderKanban } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
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

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/projects" className="text-sm text-foreground/80 hover:text-foreground inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <FolderKanban className="h-4 w-4" />
          <span>Projects</span>
        </Link>
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

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-6 pt-6">
              <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <FolderKanban className="h-4 w-4" />
                <span>Projects</span>
              </Link>
              {session?.user && (
                <>
                  <div className="flex items-center space-x-3 px-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image || undefined} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full justify-start px-4 text-base"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              )}
              <div className="flex items-center justify-between px-4">
                <span className="text-base">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

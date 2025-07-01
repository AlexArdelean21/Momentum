"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { data: session, status } = useSession()

  // Debug session status
  useEffect(() => {
    console.log("🔍 Session status:", status)
    console.log("🔍 Session data:", session)
    
    if (status === "authenticated" && session?.user) {
      console.log("🔍 User is already authenticated, redirecting...")
      router.push("/")
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🔍 FORM SUBMIT - Email:", email)
    setIsLoading(true)
    setError("")

    try {
      console.log("🔍 CALLING SIGNIN...")
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("🔍 SIGNIN RESULT:", JSON.stringify(result, null, 2))

      if (result?.error) {
        console.log("🔍 SIGNIN ERROR:", result.error)
        setError("Invalid email or password")
      } else if (result?.ok) {
        console.log("🔍 SIGNIN SUCCESS - URL:", result.url)
        setError("")
        
        // Instead of immediate redirect, let the session update naturally
        console.log("🔍 Waiting for session update...")
        
        // Use router.push instead of window.location.href
        setTimeout(() => {
          console.log("🔍 Redirecting to home page...")
          router.push("/")
        }, 1000)
      } else {
        console.log("🔍 UNEXPECTED SIGNIN RESULT:", result)
        setError("Authentication failed. Please try again.")
      }
    } catch (error) {
      console.error("🔍 SIGNIN EXCEPTION:", error)
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl">
                <Flame className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
              Sign in to continue your momentum
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Debug info in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                <p>Status: {status}</p>
                <p>User: {session?.user?.email || "None"}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl h-12 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 
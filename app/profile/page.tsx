"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Profile() {
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Not authenticated</h1>
          <Link href="/auth/signin">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Here you would implement the API call to update user profile
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 font-semibold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24 ring-4 ring-orange-200 dark:ring-orange-800">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold">
                    {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Profile Settings
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                Manage your account information
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-800 dark:text-white">
                        {session.user.name || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <p className="text-lg font-medium text-gray-800 dark:text-white">
                      {session.user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Member Since
                    </label>
                    <p className="text-lg font-medium text-gray-800 dark:text-white">
                      {new Date().toLocaleDateString()} {/* This would come from user creation date */}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setName(session.user.name || "")
                      }}
                      variant="outline"
                      className="flex-1 rounded-xl h-12 border-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 
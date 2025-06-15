"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DatabaseHealth {
  success: boolean
  message: string
  data?: {
    activities: number
    logs: number
  }
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<"initializing" | "ready" | "error">("initializing")
  const [message, setMessage] = useState("Setting up database...")
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const checkDatabase = async () => {
    try {
      setStatus("initializing")
      setMessage("Connecting to database...")

      const response = await fetch("/api/health")
      const result = await response.json()

      if (response.ok) {
        setStatus("ready")
        setMessage("Database ready!")
        setHealth(result)

        // Auto-hide after 3 seconds if successful
        setTimeout(() => {
          if (!showDetails) {
            setStatus("ready")
            setMessage("")
          }
        }, 3000)
      } else {
        setStatus("error")
        setMessage(result.error || "Database connection failed")
        setHealth(null)
      }
    } catch (error) {
      console.error("Database check failed:", error)
      setStatus("error")
      setMessage("Failed to connect to database")
      setHealth(null)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  // Don't show anything if ready and message is empty and not showing details
  if (status === "ready" && !message && !showDetails) {
    return null
  }

  return (
    <Card
      className={`mb-6 ${
        status === "error"
          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          : status === "ready"
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
            : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status === "initializing" && <Loader2 className="h-5 w-5 text-orange-600 animate-spin" />}
            {status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
            {status === "ready" && <CheckCircle className="h-5 w-5 text-green-600" />}

            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <div>
                <p
                  className={`text-sm font-medium ${
                    status === "error"
                      ? "text-red-800 dark:text-red-200"
                      : status === "ready"
                        ? "text-green-800 dark:text-green-200"
                        : "text-orange-800 dark:text-orange-200"
                  }`}
                >
                  {status === "initializing" && "Setting up database..."}
                  {status === "error" && "Database Error"}
                  {status === "ready" && "Database Connected"}
                </p>
                {message && (
                  <p
                    className={`text-xs ${
                      status === "error"
                        ? "text-red-600 dark:text-red-300"
                        : status === "ready"
                          ? "text-green-600 dark:text-green-300"
                          : "text-orange-600 dark:text-orange-300"
                    }`}
                  >
                    {message}
                  </p>
                )}
                {health?.data && showDetails && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {health.data.activities} activities • {health.data.logs} logs
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {status === "ready" && (
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="text-xs">
                {showDetails ? "Hide" : "Details"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={checkDatabase} className="h-8 w-8">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

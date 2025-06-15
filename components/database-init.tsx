"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function DatabaseInit() {
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const response = await fetch("/api/init-db", { method: "POST" })
        const result = await response.json()

        if (response.ok) {
          setStatus("ready")
          setMessage("Database is ready!")
        } else {
          setStatus("error")
          setMessage(result.error || "Database initialization failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to connect to database")
      }
    }

    initDatabase()
  }, [])

  if (status === "ready") return null

  return (
    <Card
      className={`mb-6 ${status === "error" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {status === "checking" && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
          {status === "ready" && <CheckCircle className="h-5 w-5 text-green-600" />}

          <div>
            <p
              className={`text-sm font-medium ${status === "error" ? "text-red-800 dark:text-red-200" : "text-blue-800 dark:text-blue-200"}`}
            >
              {status === "checking" && "Initializing database..."}
              {status === "error" && "Database Error"}
              {status === "ready" && "Database Ready"}
            </p>
            {message && (
              <p
                className={`text-xs mt-1 ${status === "error" ? "text-red-600 dark:text-red-300" : "text-blue-600 dark:text-blue-300"}`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

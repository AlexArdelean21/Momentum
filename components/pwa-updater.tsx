"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAUpdater() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox

      // Add event listener for when a new service worker is waiting
      wb.addEventListener('waiting', () => {
        setShowUpdate(true)
      })

      // Add event listener for when service worker takes control
      wb.addEventListener('controlling', () => {
        setShowUpdate(false)
        window.location.reload()
      })

      // Register for updates
      wb.register()
    }
  }, [])

  const handleUpdate = async () => {
    if (window.workbox && window.workbox.waiting) {
      setIsUpdating(true)
      
      // Tell the waiting service worker to skip waiting and become active
      window.workbox.messageSkipWaiting()
      
      // The 'controlling' event will trigger reload
    }
  }

  if (!showUpdate) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <Card className="border-orange-200 bg-white/95 backdrop-blur-sm shadow-lg dark:border-orange-800 dark:bg-gray-900/95">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  New version available
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  A newer version of Momentum is ready. Update now for the latest features and improvements.
                </p>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isUpdating ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-3 w-3" />
                        <span>Update</span>
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setShowUpdate(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Later
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => setShowUpdate(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Extend window object for TypeScript
declare global {
  interface Window {
    workbox: any
  }
}

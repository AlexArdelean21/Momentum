"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useInstallPrompt } from '@/lib/hooks/use-install-prompt'
import { Download, Smartphone, Share, Plus } from 'lucide-react'

export function InstallPWAButton() {
  const { 
    canInstall, 
    showIOSInstructions, 
    promptInstall, 
    isStandalone
  } = useInstallPrompt()
  
  const [showInstructions, setShowInstructions] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)



  // Don't show button if app is already installed
  if (isStandalone) {
    return null
  }

  const handleInstallClick = async () => {
    if (showIOSInstructions) {
      setShowInstructions(true)
      return
    }

    if (canInstall) {
      setIsInstalling(true)
      try {
        await promptInstall()
      } finally {
        setIsInstalling(false)
      }
    }
  }

  // Don't show anything if can't install and not iOS
  if (!canInstall && !showIOSInstructions) {
    return null
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        disabled={isInstalling}
        variant="outline"
        size="sm"
        className="w-full mt-4 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300"
      >
        {isInstalling ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
            <span>Installing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {showIOSInstructions ? (
              <Smartphone className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>
              {showIOSInstructions ? 'Install App' : 'Download App'}
            </span>
          </div>
        )}
      </Button>

      {/* iOS Installation Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Install Momentum</span>
            </DialogTitle>
            <DialogDescription>
              Add Momentum to your home screen for the best experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Important notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/50 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Make sure you're logged in and on your dashboard before installing. This ensures the app opens to your activities, not the login page.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tap the <Share className="inline h-4 w-4 mx-1" /> <strong>Share</strong> button at the bottom of your browser
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  Tap <strong>"Add"</strong> to install Momentum on your home screen
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => setShowInstructions(false)}
              className="w-full"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

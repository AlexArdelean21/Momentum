"use client"

import { useState } from "react"
import { Plus, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddActivityModal } from "./add-activity-modal"

export function AddActivityButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Activity
      </Button>

      <AddActivityModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

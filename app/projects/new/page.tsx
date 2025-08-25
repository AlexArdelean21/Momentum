"use client"

import { useState, useTransition } from "react"
import { createProjectActivity } from "@/app/(actions)/projects"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Subtask = { name: string; target: number; unit?: string; order?: number }

export default function NewProjectPage() {
  // Legacy route – redirect users to dashboard tabs and open modal there
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
  return null
}



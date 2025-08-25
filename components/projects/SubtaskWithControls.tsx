"use client"

import { useState } from "react"
import { SubtaskRow } from "./SubtaskRow"
import { QuickLogControls } from "./QuickLogControls"

type Props = {
  projectId: string
  subtask: { id: string; name: string; target: number; unit?: string }
  initialTotal: number
}

export function SubtaskWithControls({ projectId, subtask, initialTotal }: Props) {
  const [todayTotal, setTodayTotal] = useState<number>(initialTotal)

  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <SubtaskRow name={subtask.name} unit={subtask.unit} todayTotal={todayTotal} target={subtask.target} />
      <div className="mt-3">
        <QuickLogControls
          projectId={projectId}
          subtaskId={subtask.id}
          onUpdate={(delta) => setTodayTotal((t) => Math.max(0, t + delta))}
        />
      </div>
    </div>
  )
}



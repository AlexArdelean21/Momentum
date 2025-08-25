"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { logProjectProgress, getProjectDashboardData } from "@/app/(actions)/projects"

type Subtask = { id: string; name: string; target: number; unit?: string; todayTotal: number }

export function ProjectDetails({
  projectId,
  subtasks,
  last7,
  onUpdated,
}: {
  projectId: string
  subtasks: Subtask[]
  last7?: Array<{ day: string; completed: boolean }>
  onUpdated?: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const quickLog = (subtaskId: string, delta: number) => {
    startTransition(async () => {
      try {
        await logProjectProgress({ projectId, subtaskId, delta })
        onUpdated?.()
      } catch (e) {
        // swallow; parent may toast on failure elsewhere
        console.error("logProjectProgress failed", e)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {subtasks.map((s) => {
          const pct = s.target > 0 ? Math.min(s.todayTotal / s.target, 1) : 0
          return (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-sm text-foreground/70 shrink-0">
                  {Math.round(s.todayTotal)} / {s.target} {s.unit || ""}
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500" style={{ width: `${pct * 100}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-2 justify-end">
                <Button size="sm" variant="secondary" disabled={isPending} onClick={() => quickLog(s.id, -5)}>-5</Button>
                <Button size="sm" variant="secondary" disabled={isPending} onClick={() => quickLog(s.id, +5)}>+5</Button>
                <Button size="sm" variant="secondary" disabled={isPending} onClick={() => quickLog(s.id, +10)}>+10</Button>
              </div>
            </div>
          )
        })}
      </div>

      {last7 && last7.length > 0 && (
        <div className="flex items-center gap-1 pt-1">
          {last7.map((d) => (
            <div key={d.day} className={"h-3 w-3 rounded-[3px] " + (d.completed ? "bg-white/80" : "border border-white/20")} />
          ))}
        </div>
      )}
    </div>
  )
}



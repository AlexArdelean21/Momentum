"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { logProjectProgress } from "@/app/(actions)/projects"
import { WeeklyMiniChart } from "@/components/projects/WeeklyMiniChart"
import { toast } from "sonner"

type Subtask = { id: string; name: string; target: number; unit?: string; todayTotal: number }

export function ProjectDetails({
  projectId,
  subtasks,
  last7,
  last7Totals,
  description,
  onUpdated,
}: {
  projectId: string
  subtasks: Subtask[]
  last7?: Array<{ day: string; completed: boolean }>
  last7Totals?: Array<{ date: string; total: number }>
  description?: string
  onUpdated?: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [custom, setCustom] = useState<Record<string, string>>({})

  const quickLog = (subtaskId: string, delta: number) => {
    startTransition(async () => {
      try {
        await logProjectProgress({ projectId, subtaskId, delta })
        onUpdated?.()
      } catch (e: any) {
        toast.error(e?.message || "Failed to log progress")
      }
    })
  }

  const submitCustom = (subtaskId: string) => {
    const raw = (custom[subtaskId] || "").trim()
    if (!raw) return
    const n = Number(raw)
    if (!Number.isInteger(n) || n < -999 || n > 999 || n === 0) {
      toast.message("Enter an integer between -999 and 999")
      return
    }
    setCustom((m) => ({ ...m, [subtaskId]: "" }))
    quickLog(subtaskId, n)
  }

  return (
    <div className="space-y-4">
      {description && (
        <div className="text-sm text-foreground/70">
          {description}
        </div>
      )}
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
              <div className="mt-2 flex items-center gap-2 justify-end flex-wrap">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                  <Button size="sm" variant="secondary" disabled={isPending} onClick={() => quickLog(s.id, -5)}>-5</Button>
                  <Button size="sm" variant="secondary" disabled={isPending} onClick={() => quickLog(s.id, +5)}>+5</Button>
                  <Button size="sm" variant="secondary" disabled={isPending} onClick={() => quickLog(s.id, +10)}>+10</Button>
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <input
                    inputMode="numeric"
                    pattern="-?[0-9]+"
                    min={-999}
                    max={999}
                    step={1}
                    value={custom[s.id] ?? ""}
                    onChange={(e) => setCustom((m) => ({ ...m, [s.id]: e.target.value.replace(/[^0-9-]/g, "").slice(0, 4) }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitCustom(s.id) } }}
                    placeholder="±N"
                    className="w-16 text-center rounded-md bg-slate-800/60 ring-1 ring-slate-700 focus:ring-orange-500 h-8 text-sm px-1"
                    disabled={isPending}
                    aria-label="Custom amount"
                  />
                  <Button size="sm" variant="secondary" disabled={isPending} onClick={() => submitCustom(s.id)} title="Add custom">➕</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {last7Totals && last7Totals.length > 0 && (
        <WeeklyMiniChart points={last7Totals} />
      )}
    </div>
  )
}



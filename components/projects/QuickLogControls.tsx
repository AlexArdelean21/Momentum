"use client"

import { useOptimistic, useState, useTransition } from "react"
import { logProjectProgress } from "@/app/(actions)/projects"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  projectId: string
  subtaskId: string
  onUpdate?: (delta: number) => void
}

export function QuickLogControls({ projectId, subtaskId, onUpdate }: Props) {
  const [value, setValue] = useState<number>(5)
  const [isPending, startTransition] = useTransition()

  const apply = (delta: number) => {
    if (onUpdate) onUpdate(delta)
    startTransition(async () => {
      try {
        await logProjectProgress({ projectId, subtaskId, delta })
        toast.success(`Added ${delta > 0 ? "+" : ""}${delta}`)
      } catch (e: any) {
        toast.error(e?.message || "Failed to log progress")
        if (onUpdate) onUpdate(-delta)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      {[5, 10, 20].map((n) => (
        <Button key={n} size="sm" variant="secondary" disabled={isPending} onClick={() => apply(n)}>
          +{n}
        </Button>
      ))}
      <Button size="sm" variant="secondary" disabled={isPending} onClick={() => apply(-5)}>
        -5
      </Button>
      <input
        type="number"
        step={1}
        className="h-9 w-20 rounded-md bg-background border border-white/10 px-2 text-sm"
        value={value}
        onChange={(e) => setValue(Number(e.target.value || 0))}
        aria-label="Custom amount"
      />
      <Button size="sm" disabled={isPending || !Number.isFinite(value)} onClick={() => apply(value)} aria-live="polite">
        Add
      </Button>
    </div>
  )
}



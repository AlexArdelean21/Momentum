"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type SubtaskValue = {
  id?: string
  name: string
  target: number
  unit?: string
}

export function ProjectSubtaskRow({
  value,
  onChange,
  onRemove,
  disableRemove,
}: {
  value: SubtaskValue
  onChange: (patch: Partial<SubtaskValue>) => void
  onRemove: () => void
  disableRemove?: boolean
}) {
  return (
    <div className="w-full">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <Input
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., Pushups"
            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 h-10 text-base"
            aria-label="Subtask Name"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={Number.isFinite(value.target) ? value.target : 0}
              onChange={(e) => {
                const n = Math.max(0, Number(e.target.value || 0))
                onChange({ target: n })
              }}
              placeholder="10"
              className="w-28 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 h-10 text-base"
              aria-label="Target"
            />
            <Input
              value={value.unit || ""}
              onChange={(e) => onChange({ unit: e.target.value })}
              placeholder="Unit (optional)"
              className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 h-10 text-base"
              aria-label="Unit (optional)"
            />
          </div>
        </div>
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disableRemove}
            className="mt-0.5 text-foreground/70"
            aria-label="Remove subtask"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}



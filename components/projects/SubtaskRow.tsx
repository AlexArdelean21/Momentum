"use client"

import { motion } from "framer-motion"

type Props = {
  name: string
  unit?: string
  todayTotal: number
  target: number
}

export function SubtaskRow({ name, unit, todayTotal, target }: Props) {
  const progress = target > 0 ? Math.min(Math.max(todayTotal, 0) / target, 1) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="truncate font-medium">{name}</div>
        <div className="text-xs text-foreground/70 whitespace-nowrap">
          {Math.max(0, todayTotal)}{unit ? ` ${unit}` : ""} / {target}{unit ? ` ${unit}` : ""}
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#FF7A18] via-[#FF3D54] to-[#FFB800]"
          initial={{ width: 0, opacity: 0.8 }}
          animate={{ width: `${progress * 100}%`, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}



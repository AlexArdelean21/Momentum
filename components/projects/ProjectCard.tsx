"use client"

import { cn } from "@/lib/utils"
import { ProjectRadialFuel } from "./ProjectRadialFuel"
import { type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ProjectMenu } from "./ProjectMenu"

type Props = {
  name: string
  emoji?: string
  progressPct: number
  isCompletedToday: boolean
  last7?: Array<{ day: string; completed: boolean }>
  onEdit?: () => void
  onDelete?: () => void
  isExpanded?: boolean
  onToggle?: () => void
  children?: ReactNode
}

export function ProjectCard({ name, emoji, progressPct, isCompletedToday, last7, onEdit, onDelete, isExpanded, onToggle, children }: Props) {
  return (
    <div className={cn(
      "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)]",
      "p-4 sm:p-5 transition will-change-transform hover:-translate-y-0.5 hover:ring-1 hover:ring-white/10"
    )}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!!isExpanded}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle?.() } }}
        onClick={onToggle}
        className="flex items-center gap-4 cursor-pointer"
      >
        <div className="shrink-0">
          <div aria-label={`${name} progress ${(progressPct * 100).toFixed(0)}%`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-full">
            <ProjectRadialFuel value={progressPct} aria-label="Fuel meter" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded" aria-hidden>
              {emoji || "🧩"}
            </div>
            {isCompletedToday && (
              <span className="bg-gradient-to-br from-[#FF7A18] via-[#FF3D54] to-[#FFB800] text-[10px] px-2 py-0.5 rounded-full text-white">
                Completed • today
              </span>
            )}
          </div>
          <div className="mt-1 font-medium truncate block text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded">
            {name}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative shrink-0" onClick={(e) => { e.stopPropagation() }} onMouseDown={(e) => { e.stopPropagation() }}>
            <ProjectMenu onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}
      </div>
      {/* Removed header squares to avoid duplicates; chart shows in details panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`panel-${name}`}
            role="region"
            aria-label={`Project details: ${name}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden mt-3"
          >
            <div className="pt-3 border-t border-white/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



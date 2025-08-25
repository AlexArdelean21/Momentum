"use client"

import { cn } from "@/lib/utils"
import { ProjectRadialFuel } from "./ProjectRadialFuel"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState, type ReactNode } from "react"

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
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className={cn(
      "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)]",
      "p-4 sm:p-5 transition will-change-transform hover:-translate-y-0.5 hover:ring-1 hover:ring-white/10"
    )}>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <button aria-label={`${name} progress ${(progressPct * 100).toFixed(0)}%`} onClick={onToggle} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-full">
            <ProjectRadialFuel value={progressPct} aria-label="Fuel meter" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={onToggle} className="text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded" aria-hidden>
              {emoji || "🧩"}
            </button>
            {isCompletedToday && (
              <span className="bg-gradient-to-br from-[#FF7A18] via-[#FF3D54] to-[#FFB800] text-[10px] px-2 py-0.5 rounded-full text-white">
                Completed • today
              </span>
            )}
          </div>
          <button onClick={onToggle} className="mt-1 font-medium truncate block text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded">
            {name}
          </button>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative shrink-0">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label="Project menu"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setMenuOpen((o) => !o)
              }}
              title="Menu"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl z-10">
                {onEdit && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation(); e.preventDefault(); setMenuOpen(false); onEdit()
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 text-red-400 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation(); e.preventDefault(); setMenuOpen(false); if (confirm("Delete project?")) onDelete()
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {last7 && last7.length > 0 && (
        <div className="mt-3 flex items-center gap-1">
          {last7.map((d) => (
            <div key={d.day} className={cn("h-3 w-3 rounded-[3px]", d.completed ? "bg-white/80" : "border border-white/20")}
              title={`${d.day}: ${d.completed ? "Completed" : "Missed"}`}
            />
          ))}
        </div>
      )}
      <div className={cn("overflow-hidden transition-all", isExpanded ? "max-h-[1200px] opacity-100 mt-3" : "max-h-0 opacity-0")}
        aria-hidden={!isExpanded}
      >
        <div className="pt-3 border-t border-white/10">
          {children}
        </div>
      </div>
    </div>
  )
}



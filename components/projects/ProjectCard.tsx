"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProjectRadialFuel } from "./ProjectRadialFuel"

type Props = {
  name: string
  emoji?: string
  progressPct: number
  isCompletedToday: boolean
  href: string
  last7?: Array<{ day: string; completed: boolean }>
}

export function ProjectCard({ name, emoji, progressPct, isCompletedToday, href, last7 }: Props) {
  return (
    <Link
      href={href}
      aria-label={`${name} progress ${(progressPct * 100).toFixed(0)}%`}
      role="link"
      className={cn(
        "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)]",
        "p-4 sm:p-5 transition will-change-transform hover:-translate-y-0.5 hover:ring-1 hover:ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <ProjectRadialFuel value={progressPct} aria-label="Fuel meter" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-2xl" aria-hidden>{emoji || "🧩"}</div>
            {isCompletedToday && (
              <span className="bg-gradient-to-br from-[#FF7A18] via-[#FF3D54] to-[#FFB800] text-[10px] px-2 py-0.5 rounded-full text-white">
                Completed • today
              </span>
            )}
          </div>
          <div className="mt-1 font-medium truncate">{name}</div>
        </div>
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
    </Link>
  )
}



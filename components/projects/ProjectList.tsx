"use client"

import { useState } from "react"
import { ProjectCard } from "./ProjectCard"
import { motion, AnimatePresence } from "framer-motion"
import { getProjectDashboardData, deleteProjectActivity } from "@/app/(actions)/projects"
import { toast } from "sonner"

type Project = Awaited<ReturnType<typeof getProjectDashboardData>>[number]

export function ProjectList({ projects, onEdit, onDeleted }: { projects: Project[]; onEdit: (p: Project) => void; onDeleted: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <div key={p.id} className="space-y-2">
          <div onClick={() => setExpandedId((id) => (id === p.id ? null : p.id))} className="cursor-pointer">
            <ProjectCard
              name={p.name}
              emoji={p.emoji}
              progressPct={p.progressPct}
              isCompletedToday={p.isCompletedToday}
              href={`/projects/${p.id}`}
              last7={p.last7}
              onEdit={() => onEdit(p)}
              onDelete={async () => {
                try {
                  await deleteProjectActivity({ projectId: p.id })
                  toast.success("Project deleted")
                  onDeleted()
                } catch (e: any) {
                  toast.error(e?.message || "Failed to delete project")
                }
              }}
            />
          </div>
          <AnimatePresence initial={false}>
            {expandedId === p.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)] p-4"
              >
                <div className="text-sm text-foreground/80">Details coming soon… subtasks, quick log, etc.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}



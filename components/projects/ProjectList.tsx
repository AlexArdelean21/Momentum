"use client"

import { useState } from "react"
import { ProjectCard } from "./ProjectCard"
import { motion, AnimatePresence } from "framer-motion"
import { getProjectDashboardData, deleteProjectActivity } from "@/app/(actions)/projects"
import { ProjectDetails } from "@/components/projects/ProjectDetails"
import { toast } from "sonner"

type Project = Awaited<ReturnType<typeof getProjectDashboardData>>[number]

export function ProjectList({ projects, onEdit, onDeleted }: { projects: Project[]; onEdit: (p: Project) => void; onDeleted: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <div key={p.id} className="space-y-2" data-project-id={p.id}>
          <div>
            <ProjectCard
              name={p.name}
              emoji={p.emoji}
              progressPct={p.progressPct}
              isCompletedToday={p.isCompletedToday}
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
              isExpanded={expandedId === p.id}
              onToggle={() => setExpandedId((id) => (id === p.id ? null : p.id))}
            >
              {expandedId === p.id ? (
                <ProjectDetails
                  projectId={p.id}
                  subtasks={p.subtasks}
                  last7={p.last7}
                  onUpdated={async () => {
                    const data = await getProjectDashboardData()
                    // keep currently expanded id
                    const keep = expandedId
                    // naive: we don't replace projects prop here; parent passes it, so skip
                  }}
                />
              ) : (
                <div className="text-sm text-foreground/80">Details coming soon… subtasks, quick log, etc.</div>
              )}
            </ProjectCard>
          </div>
          <AnimatePresence initial={false}>
            {expandedId === p.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="hidden"
              >
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}



"use client"

import { useState } from "react"
import { motion, PanInfo } from "framer-motion"
import { TabBar } from "@/components/dashboard/TabBar"
import { AddActivityButton } from "@/components/add-activity-button"
import { AddProjectModal } from "@/components/projects/AddProjectModal"
import { useRouter } from "next/navigation"
import { getProjectDashboardData } from "@/app/(actions)/projects"
import { useEffect } from "react"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { CreateProjectButton } from "@/components/projects/CreateProjectButton"
import { ProjectList } from "@/components/projects/ProjectList"

type Project = Awaited<ReturnType<typeof getProjectDashboardData>>[number]

export function TabbedDashboard({ activitiesSlot }: { activitiesSlot: React.ReactNode }) {
  const [active, setActive] = useState<"activities" | "projects">("activities")
  const [openProjectModal, setOpenProjectModal] = useState(false)
  const [projects, setProjects] = useState<Project[] | null>(null)

  // Load projects on mount and when switching to projects tab
  useEffect(() => {
    let mounted = true
    if (active === "projects" && projects == null) {
      getProjectDashboardData().then((data) => {
        if (mounted) setProjects(data)
      })
    }
    return () => {
      mounted = false
    }
  }, [active, projects])

  const onDragEnd = (_: any, info: PanInfo) => {
    const dx = info.offset.x
    if (Math.abs(dx) < 40) return
    if (dx < 0) {
      setActive("projects")
    } else {
      setActive("activities")
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <TabBar active={active} onChange={(t) => setActive(t)} />
        {active === "activities" ? (
          <AddActivityButton />
        ) : (
          <CreateProjectButton ariaLabel="Add Project" onClick={() => setOpenProjectModal(true)} />
        )}
      </div>

      <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={onDragEnd} className="cursor-grab active:cursor-grabbing">
        {active === "activities" ? (
          <div className="mt-2">{activitiesSlot}</div>
        ) : (
          <div className="space-y-4">
            {(projects?.length || 0) === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)] p-6 text-center">
                <div className="text-5xl">🧩</div>
                <div className="mt-2 text-sm text-foreground/70">No projects yet</div>
              </div>
            ) : (
              <ProjectList
                projects={projects!}
                onEdit={(proj) => setOpenProjectModal(true)}
                onDeleted={async () => {
                  const data = await getProjectDashboardData()
                  setProjects(data)
                }}
              />
            )}
          </div>
        )}
      </motion.div>

      <AddProjectModal
        open={openProjectModal}
        onOpenChange={setOpenProjectModal}
        mode="create"
        onCreatedOrUpdated={async () => {
          const data = await getProjectDashboardData()
          setProjects(data)
        }}
      />
    </section>
  )
}



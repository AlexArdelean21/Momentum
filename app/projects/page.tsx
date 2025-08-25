import { getProjectDashboardData } from "@/app/(actions)/projects"
import { ProjectCard } from "@/components/projects/ProjectCard"
import Link from "next/link"
import { CreateProjectButton } from "@/components/projects/CreateProjectButton"

export default async function ProjectsPage() {
  const data = await getProjectDashboardData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">Projects</h2>
        <CreateProjectButton ariaLabel="Add Project" />
      </div>

      {(data?.length || 0) === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)] p-8 text-center space-y-3">
          <div className="text-6xl">🧩</div>
          <div className="text-lg font-medium">Create your first Project</div>
          <p className="text-foreground/70">Track multi-step progress with beautiful daily meters.</p>
          <div className="pt-2">
            <CreateProjectButton ariaLabel="Create your first Project" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data!.map((p) => (
            <ProjectCard
              key={p.id}
              name={p.name}
              emoji={p.emoji}
              progressPct={p.progressPct}
              isCompletedToday={p.isCompletedToday}
              href={`/projects/${p.id}`}
              last7={p.last7}
            />
          ))}
        </div>
      )}

      <CreateProjectButton variant="fab" ariaLabel="Add Project" />
    </div>
  )
}



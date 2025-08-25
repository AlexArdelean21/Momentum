import { getProjectDashboardData } from "@/app/(actions)/projects"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { CreateProjectButton } from "@/components/projects/CreateProjectButton"

export async function ProjectsTeaser() {
  const projects = await getProjectDashboardData()
  const firstThree = (projects || []).slice(0, 3)

  return (
    <section className="mt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Projects</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track multi-step goals alongside your habits</p>
        </div>
        <CreateProjectButton ariaLabel="Add Project" />
      </div>
      {firstThree.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-[0_2px_30px_rgba(255,80,20,0.08)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🧩</div>
            <div className="text-sm text-foreground/70">No projects yet</div>
          </div>
          <CreateProjectButton ariaLabel="Create your first Project" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {firstThree.map((p) => (
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
    </section>
  )
}



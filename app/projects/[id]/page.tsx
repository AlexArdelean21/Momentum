import { prisma } from "@/lib/prisma"
import { startOfLocalDay, isoDay } from "@/lib/date"
import { auth } from "@/lib/auth"
import { SubtaskWithControls } from "@/components/projects/SubtaskWithControls"
import { Decimal } from "@prisma/client/runtime/library"
import Link from "next/link"
import { CreateProjectButton } from "@/components/projects/CreateProjectButton"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const today = startOfLocalDay(new Date())
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const project = await prisma.projectActivity.findFirst({
    where: { id: params.id, userId },
    include: {
      subtasks: { orderBy: { order: "asc" } },
      logs: { where: { date: today } },
      daily: {
        where: { date: { gte: sevenDaysAgo, lte: today } },
        orderBy: { date: "asc" },
      },
    },
  })

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p>Project not found.</p>
      </div>
    )
  }

  const totals: Record<string, Decimal> = {}
  for (const s of project.subtasks) totals[s.id] = new Decimal(0)
  for (const l of project.logs) {
    totals[l.subtaskId] = (totals[l.subtaskId] || new Decimal(0)).add(l.delta as any)
  }

  const isCompletedToday = project.progressRequired && project.subtasks.length > 0 && project.subtasks.every((s) => {
    const t = totals[s.id] || new Decimal(0)
    return t.greaterThanOrEqualTo(s.target as any)
  })

  const last7: Array<{ day: string; completed: boolean }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = isoDay(d)
    const dayStatus = project.daily.find((ds) => isoDay(ds.date) === key)
    last7.push({ day: key, completed: !!dayStatus?.isCompleted })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      <div>
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <span aria-hidden>←</span>
          <span>Back</span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-3xl" aria-hidden>{project.emoji || "🧩"}</div>
        <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
        {isCompletedToday && (
          <span className="bg-gradient-to-br from-[#FF7A18] via-[#FF3D54] to-[#FFB800] text-[10px] px-2 py-0.5 rounded-full text-white">
            Completed • today
          </span>
        )}
      </div>

      <div className="space-y-4">
        {project.subtasks.map((s) => {
          const t = Number((totals[s.id] || new Decimal(0)).toNumber())
          return (
            <SubtaskWithControls
              key={s.id}
              projectId={project.id}
              subtask={{ id: s.id, name: s.name, target: Number(s.target as any), unit: s.unit || undefined }}
              initialTotal={Math.max(0, t)}
            />
          )
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Last 7 days</h2>
        <div className="flex items-center gap-2">
          {last7.map((d) => (
            <div key={d.day} className="w-8 text-center">
              <div
                className={
                  d.completed
                    ? "h-6 rounded-md bg-gradient-to-br from-[#FF7A18] via-[#FF3D54] to-[#FFB800]"
                    : "h-6 rounded-md bg-foreground/15"
                }
                title={`${d.day}: ${d.completed ? "Completed" : "Missed"}`}
              />
              <div className="mt-1 text-[10px] text-foreground/60">{d.day.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>

      <CreateProjectButton variant="fab" ariaLabel="Add Project" />
    </div>
  )
}



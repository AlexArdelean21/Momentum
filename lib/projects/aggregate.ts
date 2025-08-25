import { prisma } from "@/lib/prisma"
import { startOfLocalDay } from "@/lib/date"
import { addDecimal, gteDecimal } from "@/lib/decimal"
import { Decimal } from "@prisma/client/runtime/library"

export async function onProjectCompleted(projectId: string, date: Date, userId: string): Promise<void> {
  console.info("[onProjectCompleted]", { projectId, date: date.toISOString(), userId })
}

export async function recomputeProjectDailyStatus(projectId: string, date: Date, userId: string): Promise<void> {
  const dayStart = startOfLocalDay(date)

  const project = await prisma.projectActivity.findFirst({
    where: { id: projectId, userId },
    include: {
      subtasks: true,
      logs: {
        where: {
          date: dayStart,
        },
      },
      daily: {
        where: { date: dayStart },
        take: 1,
      },
    },
  })

  if (!project) {
    throw new Error("Project not found or access denied")
  }

  const totals: Record<string, string> = {}
  for (const sub of project.subtasks) {
    totals[sub.id] = "0"
  }

  for (const log of project.logs) {
    const key = log.subtaskId
    if (!(key in totals)) totals[key] = "0"
    const current = new Decimal(totals[key])
    const next = addDecimal(current, log.delta as any)
    totals[key] = next.toString()
  }

  let isCompleted = false
  if (project.progressRequired && project.subtasks.length > 0) {
    isCompleted = project.subtasks.every((sub) => {
      const sum = new Decimal(totals[sub.id] || "0")
      return gteDecimal(sum, sub.target as any)
    })
  }

  const prevCompleted = project.daily[0]?.isCompleted ?? false

  await prisma.projectDailyStatus.upsert({
    where: { projectId_date: { projectId, date: dayStart } },
    create: {
      projectId,
      date: dayStart,
      totals,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    update: {
      totals,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  })

  if (!prevCompleted && isCompleted) {
    await onProjectCompleted(projectId, dayStart, userId)
  }
}



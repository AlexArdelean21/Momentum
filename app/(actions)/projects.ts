"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfLocalDay, isoDay } from "@/lib/date"
import { recomputeProjectDailyStatus } from "@/lib/projects/aggregate"
import { Decimal } from "@prisma/client/runtime/library"
import { revalidatePath } from "next/cache"

const subtaskInput = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1).max(100),
  target: z.number().positive(),
  unit: z.string().max(20).optional().nullable(),
  order: z.number().int().min(0).optional(),
})

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  emoji: z.string().max(10).optional(),
  progressRequired: z.boolean().optional().default(true),
  repeatsToday: z.boolean().optional().default(false),
  subtasks: z.array(
    z.object({
      name: z.string().min(1).max(100),
      target: z.number().positive(),
      unit: z.string().max(20).optional().nullable(),
      order: z.number().int().min(0).optional(),
    })
  ),
})

export async function createProjectActivity(input: z.infer<typeof createProjectSchema>): Promise<{ id: string }> {
  console.log("[createProjectActivity] input", input?.name)
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  const parsed = createProjectSchema.safeParse(input)
  if (!parsed.success) {
    throw parsed.error
  }
  if (parsed.data.subtasks.length === 0) {
    throw new Error("Project must have at least one subtask")
  }

  const result = await prisma.$transaction(async (tx) => {
    const proj = await tx.projectActivity.create({
      data: {
        userId,
        name: parsed.data.name,
        description: parsed.data.description,
        emoji: parsed.data.emoji,
        progressRequired: parsed.data.progressRequired,
        repeatsToday: parsed.data.repeatsToday,
      },
    })

    await tx.projectSubtask.createMany({
      data: parsed.data.subtasks.map((s, index) => ({
        projectId: proj.id,
        name: s.name,
        target: new Decimal(s.target),
        unit: s.unit || undefined,
        order: s.order ?? index,
      })),
    })

    return proj
  })

  return { id: result.id }
}

const getProjectForEditSchema = z.object({ projectId: z.string().cuid() })

export async function getProjectForEdit(input: z.infer<typeof getProjectForEditSchema>): Promise<{
  id: string
  name: string
  emoji?: string
  description?: string
  subtasks: Array<{ id: string; name: string; target: number; unit?: string; order?: number }>
} | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const parsed = getProjectForEditSchema.safeParse(input)
  if (!parsed.success) throw parsed.error

  const proj = await prisma.projectActivity.findFirst({
    where: { id: parsed.data.projectId, userId },
    include: { subtasks: { orderBy: { order: "asc" } } },
  })
  if (!proj) return null

  return {
    id: proj.id,
    name: proj.name,
    emoji: proj.emoji || undefined,
    description: (proj as any).description || undefined,
    subtasks: proj.subtasks.map((s) => ({
      id: s.id,
      name: s.name,
      target: Number(s.target as any),
      unit: s.unit || undefined,
      order: s.order ?? 0,
    })),
  }
}

const updateProjectSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  emoji: z.string().max(10).optional(),
  subtasks: z.array(subtaskInput),
})

export async function updateProject(input: z.infer<typeof updateProjectSchema>): Promise<{ id: string }> {
  console.log("[updateProject]", input?.projectId)
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  const parsed = updateProjectSchema.safeParse(input)
  if (!parsed.success) throw parsed.error

  const { projectId, name, description, emoji, subtasks } = parsed.data

  await prisma.$transaction(async (tx) => {
    // Ensure ownership
    const existing = await tx.projectActivity.findFirst({ where: { id: projectId, userId }, include: { subtasks: true } })
    if (!existing) throw new Error("Project not found or access denied")

    await tx.projectActivity.update({
      where: { id: projectId },
      data: { name, description, emoji },
    })

    const existingById = new Map(existing.subtasks.map((s) => [s.id, s]))
    const payloadIds = new Set<string>()

    // Upsert provided subtasks
    for (const [index, s] of subtasks.entries()) {
      if (s.id && existingById.has(s.id)) {
        payloadIds.add(s.id)
        await tx.projectSubtask.update({
          where: { id: s.id },
          data: {
            name: s.name,
            target: new Decimal(s.target),
            unit: s.unit || undefined,
            order: s.order ?? index,
          },
        })
      } else {
        const created = await tx.projectSubtask.create({
          data: {
            projectId,
            name: s.name,
            target: new Decimal(s.target),
            unit: s.unit || undefined,
            order: s.order ?? index,
          },
        })
        payloadIds.add(created.id)
      }
    }

    // Delete missing subtasks
    for (const s of existing.subtasks) {
      if (!payloadIds.has(s.id)) {
        await tx.projectSubtask.delete({ where: { id: s.id } })
      }
    }
  })

  // Invalidate any project lists
  try {
    revalidatePath("/")
    revalidatePath("/projects")
  } catch {}

  return { id: parsed.data.projectId }
}

const upsertSubtasksSchema = z.object({
  projectId: z.string().cuid(),
  subtasks: z.array(subtaskInput),
})

export async function upsertProjectSubtasks(input: z.infer<typeof upsertSubtasksSchema>): Promise<void> {
  console.log("[upsertProjectSubtasks]", input?.projectId)
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  const parsed = upsertSubtasksSchema.safeParse(input)
  if (!parsed.success) throw parsed.error

  // Ensure project belongs to user
  const project = await prisma.projectActivity.findFirst({ where: { id: parsed.data.projectId, userId } })
  if (!project) throw new Error("Project not found or access denied")

  await prisma.$transaction(async (tx) => {
    for (const s of parsed.data.subtasks) {
      if (s.id) {
        await tx.projectSubtask.update({
          where: { id: s.id },
          data: {
            name: s.name,
            target: new Decimal(s.target),
            unit: s.unit || undefined,
            order: s.order ?? 0,
          },
        })
      } else {
        await tx.projectSubtask.create({
          data: {
            projectId: parsed.data.projectId,
            name: s.name,
            target: new Decimal(s.target),
            unit: s.unit || undefined,
            order: s.order ?? 0,
          },
        })
      }
    }
  })
}

const logProgressSchema = z.object({
  projectId: z.string().cuid(),
  subtaskId: z.string().cuid(),
  delta: z.number().finite(),
  note: z.string().max(500).optional(),
  userTimezone: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
})

export async function logProjectProgress(input: z.infer<typeof logProgressSchema>): Promise<{ currentTotals: Record<string, string>; isCompleted: boolean }> {
  console.log("[logProjectProgress]", input?.projectId, input?.subtaskId, input?.delta)
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  const parsed = logProgressSchema.safeParse(input)
  if (!parsed.success) throw parsed.error

  const timeZone = parsed.data.userTimezone
  const inputDate = parsed.data.date ? new Date(parsed.data.date as any) : new Date()
  const bucket = startOfLocalDay(inputDate, timeZone)

  // Ensure the subtask belongs to the user's project
  const subtask = await prisma.projectSubtask.findFirst({
    where: { id: parsed.data.subtaskId, project: { id: parsed.data.projectId, userId } },
    include: { project: true },
  })
  if (!subtask) throw new Error("Subtask not found or access denied")

  await prisma.projectProgressLog.create({
    data: {
      projectId: parsed.data.projectId,
      subtaskId: parsed.data.subtaskId,
      date: bucket,
      delta: new Decimal(parsed.data.delta),
      note: parsed.data.note,
    },
  })

  await recomputeProjectDailyStatus(parsed.data.projectId, bucket, userId)

  const status = await prisma.projectDailyStatus.findUnique({
    where: { projectId_date: { projectId: parsed.data.projectId, date: bucket } },
  })

  return { currentTotals: (status?.totals as any) || {}, isCompleted: !!status?.isCompleted }
}

const deleteProjectSchema = z.object({ projectId: z.string().cuid() })

export async function deleteProjectActivity(input: z.infer<typeof deleteProjectSchema>): Promise<void> {
  console.log("[deleteProjectActivity]", input?.projectId)
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error("Not authenticated")

  const parsed = deleteProjectSchema.safeParse(input)
  if (!parsed.success) throw parsed.error

  // Ensure ownership
  const proj = await prisma.projectActivity.findFirst({ where: { id: parsed.data.projectId, userId } })
  if (!proj) throw new Error("Project not found or access denied")

  await prisma.projectActivity.delete({ where: { id: parsed.data.projectId } })
}

export async function getProjectDashboardData(): Promise<Array<{
  id: string
  name: string
  description?: string
  emoji?: string
  progressPct: number
  isCompletedToday: boolean
  subtasks: Array<{ id: string; name: string; target: number; unit?: string; todayTotal: number }>
  last7: Array<{ day: string; completed: boolean }>
  last7Totals: Array<{ date: string; total: number }>
}>> {
  console.log("[getProjectDashboardData]")
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const today = startOfLocalDay(new Date())
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const projects = await prisma.projectActivity.findMany({
    where: { userId },
    include: {
      subtasks: { orderBy: { order: "asc" } },
      logs: { where: { date: today } },
      daily: {
        where: { date: { gte: sevenDaysAgo, lte: today } },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return projects.map((p) => {
    const totals: Record<string, Decimal> = {}
    for (const s of p.subtasks) totals[s.id] = new Decimal(0)
    for (const l of p.logs) {
      totals[l.subtaskId] = (totals[l.subtaskId] || new Decimal(0)).add(l.delta as any)
    }

    const subtasks = p.subtasks.map((s) => {
      const t = Number((totals[s.id] || new Decimal(0)).toNumber())
      return { id: s.id, name: s.name, target: Number(s.target as any), unit: s.unit || undefined, todayTotal: Math.max(0, t) }
    })

    const pctValues = subtasks.map((s) => (s.target > 0 ? Math.min(s.todayTotal / s.target, 1) : 0))
    const progressPct = pctValues.length ? pctValues.reduce((a, b) => a + b, 0) / pctValues.length : 0

    const isCompletedToday = p.progressRequired && p.subtasks.length > 0 && p.subtasks.every((s) => {
      const t = totals[s.id] || new Decimal(0)
      return t.greaterThanOrEqualTo(s.target as any)
    })

    const last7: Array<{ day: string; completed: boolean }> = []
    const last7Totals: Array<{ date: string; total: number }> = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dayKey = isoDay(d)
      const dayStatus = p.daily.find((ds) => isoDay(ds.date) === dayKey)
      last7.push({ day: dayKey, completed: !!dayStatus?.isCompleted })
      let total = 0
      if (dayStatus && (dayStatus as any).totals) {
        const t: Record<string, any> = (dayStatus as any).totals
        for (const k of Object.keys(t)) {
          const v = t[k]
          total += Number(typeof v === "object" && "toNumber" in (v as any) ? (v as any).toNumber() : v)
        }
      }
      last7Totals.push({ date: dayKey, total: Math.max(0, total) })
    }

    return {
      id: p.id,
      name: p.name,
      description: (p as any).description || undefined,
      emoji: p.emoji || undefined,
      progressPct,
      isCompletedToday,
      subtasks,
      last7,
      last7Totals,
    }
  })
}



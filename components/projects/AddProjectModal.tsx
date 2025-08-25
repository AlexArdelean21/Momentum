"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { createProjectActivity, upsertProjectSubtasks } from "@/app/(actions)/projects"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Subtask = { id?: string; name: string; target: number; unit?: string; order?: number }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "create" | "edit"
  project?: {
    id: string
    name: string
    emoji?: string
    description?: string
    subtasks: Array<{ id: string; name: string; target: number; unit?: string; order?: number }>
  }
  onCreatedOrUpdated?: () => void
}

export function AddProjectModal({ open, onOpenChange, mode = "create", project, onCreatedOrUpdated }: Props) {
  const [name, setName] = useState(project?.name || "")
  const [emoji, setEmoji] = useState(project?.emoji || "🧩")
  const [description, setDescription] = useState(project?.description || "")
  const [subtasks, setSubtasks] = useState<Subtask[]>(project?.subtasks || [{ name: "", target: 10 }])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open && project) {
      setName(project.name || "")
      setEmoji(project.emoji || "🧩")
      setDescription(project.description || "")
      setSubtasks(project.subtasks || [])
    }
  }, [open, project])

  const addSubtask = () => setSubtasks((s) => [...s, { name: "", target: 10 }])
  const updateSubtask = (i: number, patch: Partial<Subtask>) =>
    setSubtasks((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const removeSubtask = (i: number) => setSubtasks((s) => s.filter((_, idx) => idx !== i))

  const onSubmit = () => {
    startTransition(async () => {
      try {
        const filtered = subtasks.map((s, idx) => ({ ...s, order: idx })).filter((s) => s.name.trim().length > 0)
        if (mode === "create") {
          await createProjectActivity({ name, emoji, description, subtasks: filtered })
        } else if (project) {
          await upsertProjectSubtasks({ projectId: project.id, subtasks: filtered })
        }
        toast.success(mode === "create" ? "Project created" : "Project updated")
        onOpenChange(false)
        onCreatedOrUpdated?.()
      } catch (e: any) {
        toast.error(e?.message || "Failed to save project")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Project" : "Edit Project"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <label className="text-sm text-foreground/70">Emoji</label>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3" />
            <label className="text-sm text-foreground/70">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3" />
            <label className="text-sm text-foreground/70">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Subtasks</div>
              <Button size="sm" variant="secondary" onClick={addSubtask} disabled={isPending}>
                Add subtask
              </Button>
            </div>
            {subtasks.map((s, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  placeholder="Name"
                  value={s.name}
                  onChange={(e) => updateSubtask(i, { name: e.target.value })}
                  className="sm:col-span-6 h-9 rounded-md bg-background border border-white/10 px-3"
                />
                <input
                  placeholder="Target"
                  type="number"
                  step={1}
                  value={s.target}
                  onChange={(e) => updateSubtask(i, { target: Number(e.target.value || 0) })}
                  className="sm:col-span-3 h-9 rounded-md bg-background border border-white/10 px-3"
                />
                <input
                  placeholder="Unit (optional)"
                  value={s.unit || ""}
                  onChange={(e) => updateSubtask(i, { unit: e.target.value })}
                  className="sm:col-span-2 h-9 rounded-md bg-background border border-white/10 px-3"
                />
                <Button size="sm" variant="ghost" onClick={() => removeSubtask(i)} disabled={isPending}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={isPending || !name.trim() || subtasks.length === 0} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-400 hover:to-rose-400">
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


